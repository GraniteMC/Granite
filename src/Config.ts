import * as fs from 'fs';

export type current_server_choiceType = {
    server_name: string
    version: string,
    software: 'vanilla' | 'paper',
    port: number,
}

export type properConfig = {
    frontend_port: number,
    ws_port: number,
    current_server_choice?: current_server_choiceType,
    servers: current_server_choiceType[]
}

export const settings_name = 'settings.json';

export let Config = {} as properConfig;

try {
    Config = JSON.parse(fs.readFileSync(settings_name, 'utf8'));
} catch (e: any) {
    if (e.code === 'ENOENT') {
        Config = {
            frontend_port: 4444,
            ws_port: 4488,
            servers: [
                {
                    server_name: 'Default',
                    version: '1.19.4',
                    software: 'vanilla',
                    port: 25565,
                }
            ],
            current_server_choice: {
                server_name: 'Default',
                version: '1.19.4',
                software: 'vanilla',
                port: 25565,
            }
        };
        fs.writeFileSync(settings_name, JSON.stringify(Config, null, 4));
    }
}

// export let config = Config;
export let {
    frontend_port,
    current_server_choice,
    ws_port,
} = Config;

export function getSocketPort() {
    return Config.ws_port
}

export function getConfig() {
    let o = structuredClone(Config)
    //@ts-ignore
    delete o.ws_port
    return o as any
}

export function plusWSport() {
    Config.ws_port++;
    ws_port = Config.ws_port;
    updateConfig(Config);
}

export function updateConfig(data: properConfig) {
    Config = data;
    // config = Config;
    fs.writeFileSync(settings_name, JSON.stringify(Config, null, 4));
}

export function addNewServer(server: current_server_choiceType) {
    Config.servers.push(server);
    updateConfig(Config);
}