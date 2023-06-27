import * as vd from "./VersionData";
import * as wscs from "./ConsoleServer";
import * as zp from "./Zipper";
import { ServerProcess } from "./ServerProcess";

export class Server {
    Version: string;
    Software: string;
    Name: string;
    JarFolder: string = '';
    HasOutputted: boolean = false;
    ServerProcessInstance: ServerProcess | undefined = undefined;
    ConsoleServerInstance: wscs.Console | undefined = undefined;

    Ready: Promise<void>;


    constructor(version: string, software: 'vanilla' | 'paper', serverName: string) {
        // if (version.endsWith('.0')) version = version.slice(0, -2)

        this.Version = version;
        this.Software = software;
        this.Name = serverName;
        
        
        if (!vd.versionInstalled(version, software, serverName))
            vd.downloadVersion(version, software, serverName)

        this.JarFolder = `./server/${this.Name}/${this.Software}-${this.Version}`;
        
        
        this.ConsoleServerInstance = new wscs.Console((data: string) => {
            let message = data.startsWith('/') ? data.slice(1) : data;
            this.ServerProcessInstance?.input(message + '\n');
        })

        this.Ready = new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (this.HasOutputted) {
                    clearInterval(interval);
                    resolve();
                }
            }, 250);
        })
        
    }

    
    isOnline() {
        return this.ServerProcessInstance !== undefined;
    }
    
    stop() {
        this._stop();
    }

    _stop() {
        //console.log(this)
        if (!this.ServerProcessInstance) return;
        
        this.ConsoleServerInstance?.close();
        this.ServerProcessInstance.stop();
        this.ServerProcessInstance = undefined;
    }
    
    restart() {
        this._stop();
        this.start();
    }
    start() {  
        if (this.ServerProcessInstance) return;

        this.ServerProcessInstance = new ServerProcess(`./server/${this.Name}/${this.Software}-${this.Version}/${this.Software}-${this.Version}.jar`, this.stop, this.restart, (ci) => {
            
            const { message, isError, type, code } = ci;

            if (!this.HasOutputted && /\[.+\]: Starting Minecraft server on \*:25565/.test(message))
                this.HasOutputted = true;
                
            

            //console.log(message + " | " + isError + " | " + type + " | " + code);
            console.log(message);
            if (message === 'Server stopped.') {
                try {
                    this.stop();
                } catch (error) {
                    if (this.ServerProcessInstance) {
                        this.ConsoleServerInstance?.close();
                        this.ServerProcessInstance.stop();
                        this.ServerProcessInstance = undefined;
                    }

                    
                }
            }
                
            this.ConsoleServerInstance?.postMessage(message);

            // if (message.includes('echo')) {
            //     this.ServerProcessInstance?.input('say help\n');
            // }

        });
    }

    async downloadWorld(name: string): Promise<string> {
        return await zp.zipFolder(`./server/${this.Name}/${this.Software}-${this.Version}/${name}`, `./server/${this.Name}/${this.Software}-${this.Version}/${name}.zip`);
    }
}