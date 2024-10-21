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
exports.runSyft = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class runSyft {
    constructor(fileName) {
        this.fileName = fileName;
        this.scriptPath = "/Users/nishantv/Downloads/Projects/ContainerSecurity/backend/PythonScripts/ImageConfigurations/getDependencies.py";
        this.jsonPath = "/Users/nishantv/Downloads/Projects/ContainerSecurity/backend/PythonScripts/JSONs/";
    }
    createJSON(fileName, resultObj) {
        const jsonData = JSON.stringify(resultObj, null, 2);
        const jsonFile = path_1.default.join(this.jsonPath, `${fileName}.json`);
        return new Promise((resolve, reject) => {
            fs_1.default.writeFile(jsonFile, jsonData, 'utf8', (err) => {
                if (err) {
                    console.error('Error writing JSON file:', err);
                    reject(err);
                }
                else {
                    console.log('JSON file created successfully');
                    resolve();
                }
            });
        });
    }
    getDependencies() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const pythonOut = (0, child_process_1.spawn)('python', [this.scriptPath, this.fileName]);
                const params = {
                    "fileName": this.fileName
                };
                pythonOut.stdin.write(JSON.stringify(params));
                pythonOut.stdin.end();
                let errorOutput = '';
                pythonOut.stdout.on('data', (data) => {
                    console.log('python syft output:', data.toString());
                    // should be empty illa naa error
                });
                pythonOut.stderr.on('data', (data) => {
                    errorOutput += data.toString();
                });
                pythonOut.on('close', (code) => __awaiter(this, void 0, void 0, function* () {
                    if (code === 0) {
                        try {
                            const jsonName = `${this.fileName}.json`;
                            const jsonFilePath = path_1.default.join(this.jsonPath, jsonName);
                            fs_1.default.readFile(jsonFilePath, 'utf8', (err, data) => {
                                if (err) {
                                    console.error('Error reading JSON file:', err);
                                    reject(err);
                                }
                                else {
                                    console.log('File read successfully');
                                    resolve(JSON.parse(data));
                                }
                            });
                        }
                        catch (error) {
                            console.error('Error in processing:', error);
                            reject(error);
                        }
                    }
                    else {
                        console.error(`Process exited with code ${code}`);
                        reject(new Error(errorOutput));
                    }
                }));
            });
        });
    }
}
exports.runSyft = runSyft;
