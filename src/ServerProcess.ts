import {
    spawn,
    ChildProcessWithoutNullStreams
} from 'child_process';

import * as fs from 'fs';

export type callBackData = {
    message: string;
    isError: boolean;
    type: string;
    code?: string;
}

export class ServerProcess {
    public jarPath: string;
    public jarFolder: string;
    public jarName: string;
    public eulaPath: string;
    //make it so callback's argument is a dictionary that follows callBackData
    public callback: Function;
    public proc: ChildProcessWithoutNullStreams;

    private eulaTestRegex = /\[(\d{2}:\d{2}:\d{2}) INFO\]: You need to agree to the EULA in order to run the server\. Go to eula.txt for more info\./

    stop() {
        this.proc.stdin.write('stop\n');
        // this.callback({
        //     message: 'Server stopped.',
        //     isError: false,
        //     type: 'stop',
        //     code: '1'
        // });
    }

    kill() {
        this.proc.kill();
    }

    constructor(jarPath: string, stop: Function, restart: Function, callback: (data: callBackData) => void) {
        this.jarPath = jarPath;
        this.jarFolder = jarPath.substring(0, jarPath.lastIndexOf('/') + 1);
        this.jarName = jarPath.substring(jarPath.lastIndexOf('/') + 1);
        this.eulaPath = this.jarFolder + 'eula.txt';
        this.callback = callback;

        // console.log("SP:", this.jarPath, this.jarFolder, this.jarName, callback);

        this.proc = spawn('java', ['-jar', this.jarName, 'nogui'], { cwd: this.jarFolder });
        
        this.proc.on('exit', () => {
            this.proc.kill();
            this.callback({
                message: 'Server stopped.',
                isError: false,
                type: 'stop',
                code: '1'
            });

        });

        this.proc.stdout.on('data', data => {
            if (!data?.toString()) return;
            if (this.eulaTestRegex.test(data.toString().trim())) {
                fs.writeFile(this.eulaPath, 'eula=true', err => {
                    if (err) throw err;
                });

                this.proc.stdin.write('stop\n');
                callback({
                    message: 'EULA accepted. Restarting server...',
                    isError: false,
                    type: 'eula',
                    code: '2'
                });

                restart();
            }

            if (data.toString().trim() === 'Server Stopped') {
                stop();
            }

            callback({
                message: data.toString().trim(),
                isError: false,
                type: 'stdout',
                code: '0'
            });
            
        });

        this.proc.stderr.on('data', data => {
            if (!data?.toString()) return;
            
            
            // console.log(
            //     "ERR:",
            //     this.jarPath
            //     , this.jarFolder
            //     , this.jarName,
            //     fs.existsSync(this.jarPath),
            //     callback
            // )

            callback({
                message: data.toString().trim(),
                isError: true,
                type: 'stderr',
                code: '1'
            });
        });
    }

    input(data: string) {
        this.proc.stdin.write(data);
    }
}