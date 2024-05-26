import wss from 'ws';
import * as cfg from './Config';
import Logger from './Logger';


export class Console {
    public server: wss.Server | null;
    // public inputFunction: (data: string) => void;
    public ws: any;

    constructor(inputcb: (data: string) => void) {
        this.server = new wss.WebSocketServer({ port: cfg.getSocketPort() });
        console.log('Console server started on port ' + cfg.getSocketPort());
        this.server.on('connection', (ws, req) => {

            this.ws = ws;

            ws.on('message', (message: string) => {
                Logger.ipAddressed((ws as any)._socket?.remoteAddress || (ws as any)._socket?.address?.().address || req.headers['x-forwarded-for'] || req.socket.remoteAddress, `**WS** received ${message}`)
                console.log('received: %s', message);
                inputcb(message.toString());
            });

            ws.on('close', () => {
                console.log('Client disconnected');
            });

            ws.on('error', (err: any) => {
                console.log(err);
            })

        });

    }

    postMessage(message: string) {
        try {
            this.ws?.send(message);
        } catch (error) {
            console.log("Failed to send message to client: " + error);
        }
    }

    close() {
        this.postMessage('Granite Server stopped.')
        console.log('Closing console server');
        this.server?.close();
        // this.server = null;
        this.ws?.close();
    }

}