"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyftRunner = void 0;
const child_process_1 = require("child_process");
const pg_1 = require("pg");
const promises_1 = __importDefault(require("fs/promises"));
const pool = new pg_1.Pool({
    user: 'nishantv',
    database: 'ContainerSecurity',
    password: 'nishant123'
});
class SyftRunner {
    constructor(image_id) {
        this.jsonFilePath = "/Users/nishantv/Downloads/Projects/ContainerSecurity/New/backend/JSONs/output.json";
        this.image_id = image_id;
    }
    joinWithRec() {
        return __awaiter(this, void 0, void 0, function* () {
            const delete_query = `DELETE FROM checkdb;`;
            const query = `SELECT DISTINCT 
                rec_new.name,
                rec_new.version,
                rec_new.fixed_in,
                rec_new.type,
                rec_new.vulnerability,
                rec_new.severity,
                cvss_score.score
            FROM 
                rec_new
            JOIN 
                checkdb
            ON 
                rec_new.name = checkdb.name
            AND 
                rec_new.version = checkdb.version
            LEFT JOIN 
                cvss_score
            ON 
                rec_new.vulnerability = cvss_score.cve_name;`;
            try {
                const result = yield pool.query(query);
                if (result.rows.length > 0) {
                    const jsonData = result.rows;
                    yield promises_1.default.writeFile(this.jsonFilePath, JSON.stringify(jsonData, null, 2));
                    console.log("Data written to output.json");
                    (0, child_process_1.exec)(`docker image rm user-image`, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Error: ${error}`);
                        }
                        else {
                            console.log(stdout);
                        }
                    });
                    const filesToDelete = ["Dockerfile", "package.json", "pom.xml", "go.mod", ".csproj", "Cargo.toml", "Package.swift", "composer.json", "Gemfile"];
                    for (const file of filesToDelete) {
                        const filePath = `/Users/nishantv/Downloads/Projects/ContainerSecurity/New/backend/uploads/${file}`;
                        try {
                            yield promises_1.default.unlink(filePath);
                            console.log(`${file} deleted successfully`);
                        }
                        catch (err) {
                            console.warn(`Failed to delete ${file}:`, err);
                        }
                    }
                    yield pool.query(delete_query);
                    return jsonData;
                }
                else {
                    console.log("No records found.");
                    return [];
                }
            }
            catch (error) {
                console.error("Error executing query:", error);
                throw error;
            }
        });
    }
    insertIntoDb(name, version, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `INSERT INTO checkdb (name, version, type) VALUES ($1, $2, $3)`;
            const values = [name, version, type];
            try {
                yield pool.query(query, values);
            }
            catch (error) {
                console.error('Error executing insert query:', error);
                throw error;
            }
        });
    }
    scan() {
        return new Promise((resolve, reject) => {
            const command = `syft`;
            const args = [this.image_id];
            console.log(`Running Syft scan on image: ${this.image_id}`);
            const syftProcess = (0, child_process_1.spawn)(command, args);
            let output = '';
            syftProcess.stdout.on('data', (data) => {
                output += data.toString();
            });
            syftProcess.stderr.on('data', (data) => {
                console.error(`Error: ${data.toString()}`);
            });
            syftProcess.on('close', (code) => __awaiter(this, void 0, void 0, function* () {
                const lines = output.trim().split("\n");
                const parsedData = lines.slice(1).map((line) => {
                    const name = line.slice(0, 35).trim();
                    const version = line.slice(35, 65).trim();
                    const type = line.slice(65, 73).trim();
                    return { name, version, type };
                });
                try {
                    for (const { name, version, type } of parsedData) {
                        yield this.insertIntoDb(name, version, type);
                    }
                    console.log('Syft scan data inserted into the database.');
                    const jsonData = yield this.joinWithRec();
                    resolve(jsonData);
                }
                catch (error) {
                    console.error('Error inserting data into the database:', error);
                    reject(error);
                }
            }));
        });
    }
}
exports.SyftRunner = SyftRunner;
