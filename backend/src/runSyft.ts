import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { jsonTocheckdb } from "./jsonTocheckdb";

export class runSyft {

    private fileName: string;
    private scriptPath: string;
    private jsonPath: string;

    constructor(fileName: string) {
        this.fileName = fileName;
        this.scriptPath = "/Users/nishantv/Downloads/Projects/ContainerSecurity/backend/PythonScripts/ImageConfigurations/getDependencies.py";
        this.jsonPath = "/Users/nishantv/Downloads/Projects/ContainerSecurity/backend/PythonScripts/JSONs/";
    }

    private createJSON(fileName: string, resultObj: object[]): Promise<void> {
        const jsonData = JSON.stringify(resultObj, null, 2);
        const jsonFile = path.join(this.jsonPath, `${fileName}.json`);

        return new Promise<void>((resolve, reject) => {
            fs.writeFile(jsonFile, jsonData, 'utf8', (err) => {
                if (err) {
                    console.error('Error writing JSON file:', err);
                    reject(err);
                } else {
                    console.log('JSON file created successfully');
                    resolve();
                }
            });
        });
    }

    public async getDependencies(): Promise<any> {
        return new Promise((resolve, reject) => {
            const pythonOut = spawn('python', [this.scriptPath, this.fileName]);

            const params = {
                "fileName": this.fileName
            };

            pythonOut.stdin.write(JSON.stringify(params));
            pythonOut.stdin.end();

            let errorOutput = '';
            let resultObj: any[] = [];

            pythonOut.stdout.on('data', (data) => {
                const dataStr = data.toString();
                const splitStr = dataStr.split(/\s+/);

                let combinedStr = splitStr.join(' ');
                combinedStr = combinedStr.replace(/['"\[\],]/g, '');

                const cleanedStrArr = combinedStr.split(/\s+/);

                for (let i = 0; i < cleanedStrArr.length; i += 3) {
                    const name = cleanedStrArr[i];
                    const version = cleanedStrArr[i + 1];
                    const type = cleanedStrArr[i + 2];

                    if (name === "NAME" && version === "VERSION" && type === "TYPE") {
                        continue;
                    }

                    resultObj.push({ name, version, type });
                }
            });

            pythonOut.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            pythonOut.on('close', async (code) => {
                if (code === 0) {
                    try {
                        const startTime = Date.now();
                        await this.createJSON(this.fileName, resultObj);

                        const jsonName = `${this.fileName}.json`;
                        await new jsonTocheckdb(jsonName).pushToCheckDB();

                        const jsonPath = path.join(this.jsonPath, jsonName);
                        fs.readFile(jsonPath, 'utf8', (err, data) => {
                            if (err) {
                                console.error('JSON file read aagalaaaa', err);
                                reject(err);
                            } else {
                                console.log('File read done');
                                resolve(data);
                            }
                        });

                    } catch (error) {
                        console.error('Error in processing:', error);
                        reject(error);
                    }
                } else {
                    console.error(`Process exited with code ${code}`);
                    reject(new Error(errorOutput));
                }
            });
        });
    }
}
