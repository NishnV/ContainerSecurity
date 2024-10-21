import { spawn } from "child_process";
import fs from "fs";
import path from "path";

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

            pythonOut.stdout.on('data', (data) => {
                console.log('python syft output:', data.toString());
                // should be empty illa naa error
            });

            pythonOut.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            pythonOut.on('close', async (code) => {
                if (code === 0) {
                    try {
                        const jsonName = `${this.fileName}.json`;
                        const jsonFilePath = path.join(this.jsonPath, jsonName);

                        fs.readFile(jsonFilePath, 'utf8', (err, data) => {
                            if (err) {
                                console.error('Error reading JSON file:', err);
                                reject(err);
                            } else {
                                console.log('File read successfully');
                                resolve(JSON.parse(data));
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
