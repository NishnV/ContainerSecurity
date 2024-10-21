import { spawn, exec } from "child_process";
import { Pool } from "pg";
import fs from "fs/promises";

const pool = new Pool({
    user: 'nishantv',
    database: 'ContainerSecurity',
    password: 'nishant123'
});

export class SyftRunner {
    private image_id: string;
    private jsonFilePath = "/Users/nishantv/Downloads/Projects/ContainerSecurity/New/backend/JSONs/output.json";

    constructor(image_id: string) {
        this.image_id = image_id;
    }

    private async joinWithRec() {
        const delete_query = `DELETE FROM checkdb;`
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
            const result = await pool.query(query);

            if (result.rows.length > 0) {
                const jsonData = result.rows;

                await fs.writeFile(this.jsonFilePath, JSON.stringify(jsonData, null, 2));
                console.log("Data written to output.json");

                exec(`docker image rm user-image`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error: ${error}`);
                    } else {
                        console.log(stdout);
                    }
                });

                const filesToDelete = ["Dockerfile", "package.json", "pom.xml", "go.mod", ".csproj", "Cargo.toml", "Package.swift", "composer.json", "Gemfile"];
                for (const file of filesToDelete) {
                    const filePath = `/Users/nishantv/Downloads/Projects/ContainerSecurity/New/backend/uploads/${file}`;
                    try {
                        await fs.unlink(filePath);
                        console.log(`${file} deleted successfully`);
                    } catch (err) {
                        console.warn(`Failed to delete ${file}:`,err);
                    }
                }

                await pool.query(delete_query);

                return jsonData;
            } else {
                console.log("No records found.");
                return [];
            }
        } catch (error) {
            console.error("Error executing query:", error);
            throw error;
        }
    }

    private async insertIntoDb(name: string, version: string, type: string) {
        const query = `INSERT INTO checkdb (name, version, type) VALUES ($1, $2, $3)`;
        const values = [name, version, type];

        try {
            await pool.query(query, values);
        } catch (error) {
            console.error('Error executing insert query:', error);
            throw error;
        }
    }

    scan(): Promise<any> {
        return new Promise((resolve, reject) => {
            const command = `syft`;
            const args = [this.image_id];

            console.log(`Running Syft scan on image: ${this.image_id}`);

            const syftProcess = spawn(command, args);

            let output = '';

            syftProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            syftProcess.stderr.on('data', (data) => {
                console.error(`Error: ${data.toString()}`);
            });

            syftProcess.on('close', async (code) => {
                const lines = output.trim().split("\n");

                const parsedData = lines.slice(1).map((line) => {
                    const name = line.slice(0, 35).trim(); 
                    const version = line.slice(35, 65).trim(); 
                    const type = line.slice(65, 73).trim(); 

                    return { name, version, type };
                });

                try {
                    for (const { name, version, type } of parsedData) {
                        await this.insertIntoDb(name, version, type);
                    }
                    console.log('Syft scan data inserted into the database.');
                    const jsonData = await this.joinWithRec();
                    resolve(jsonData); 
                } catch (error) {
                    console.error('Error inserting data into the database:', error);
                    reject(error); 
                }
            });
        });
    }
}
