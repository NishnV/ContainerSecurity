import { spawn } from "child_process";

export class jsonTocheckdb {

    private jsonName: string;
    private path: string;

    constructor(jsonName: string) {
        this.jsonName = jsonName;
        this.path = '/Users/nishantv/Downloads/Projects/ContainerSecurity/backend/PythonScripts/ImageConfigurations/jsonToDB.py';
    }

    public pushToCheckDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const output = spawn('python', [this.path]);

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
                } else {
                    console.error(`Process exited with code ${code}`);
                    reject(new Error(errorOutput));
                }
            });

            output.on('error', (err) => {
                console.error('failed no subprocess', err);
                reject(err);
            });
        });
    }
}
