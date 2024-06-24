"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonTocheckdb = void 0;
const child_process_1 = require("child_process");
class jsonTocheckdb {
    constructor(jsonName) {
        this.jsonName = jsonName;
        this.path = '/Users/nishantv/Downloads/Projects/ContainerSecurity/backend/PythonScripts/ImageConfigurations/jsonToDB.py';
    }
    pushToCheckDB() {
        return new Promise((resolve, reject) => {
            const output = (0, child_process_1.spawn)('python', [this.path]);
            console.log('inside function');
            const params = {
                "fileName": this.jsonName
            };
            output.stdin.write(JSON.stringify(params));
            output.stdin.end();
            let errorOutput = '';
            output.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
            });
            output.stderr.on('data', (data) => {
                errorOutput += data.toString();
                console.error(`stderr: ${data}`);
            });
            output.on('close', (code) => {
                if (code === 0) {
                    console.log('Process completed successfully');
                    resolve();
                }
                else {
                    console.error(`Process exited with code ${code}`);
                    reject(new Error(errorOutput));
                }
            });
            output.on('error', (err) => {
                console.error('Failed to start subprocess:', err);
                reject(err);
            });
        });
    }
}
exports.jsonTocheckdb = jsonTocheckdb;
