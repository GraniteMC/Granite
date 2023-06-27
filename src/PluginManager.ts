import * as fs from 'fs';
import { Server } from './ServerRunner';

export type Plugin = {
    name: string,
    path: string,
    enabled: boolean,
}

export class PluginManager {
    server: Server;
    plugins: Plugin[] = [];
    disabledFolder: string;
    pluginsFolder: string;

    constructor(_server: Server) {
        this.server = _server;
        this.pluginsFolder = `./server/${this.server.Name}/${this.server.Software}-${this.server.Version}/plugins`;
        this.disabledFolder = this.pluginsFolder + '/__granite_disabled';

        this.loadPlugins();
        
    }

    loadPlugins() {
        if (!fs.existsSync(this.pluginsFolder)) 
            fs.mkdirSync(this.pluginsFolder);
        
            const plugins = fs.readdirSync(this.pluginsFolder);

        if (!fs.existsSync(this.disabledFolder)) 
            fs.mkdirSync(this.disabledFolder);
        
        const disabledPlugins = fs.readdirSync(this.disabledFolder);
            
        plugins.forEach(plugin => {
            if (!plugin.endsWith('.jar')) return;
            this.plugins.push({
                name: plugin,
                path: this.pluginsFolder + '/' + plugin,
                enabled: true
            });
        });

        disabledPlugins.forEach(plugin => {
            if (!plugin.endsWith('.jar')) return;
            this.plugins.push({
                name: plugin,
                path: this.disabledFolder + '/' + plugin,
                enabled: false
            });
        })
        
    }

    disablePlugin(name: string) {
        let plugin = this.plugins.find(p => p.name === name);
        // console.log(plugin, this.plugins, name);
        if (!plugin || !plugin.enabled) return;

        fs.renameSync(plugin.path, this.disabledFolder + '/' + plugin.name);

        plugin.enabled = false;
        plugin.path = this.disabledFolder + '/' + plugin.name;
    }

    enablePlugin(name: string) {
        let plugin = this.plugins.find(p => p.name === name);
        // console.log(plugin, this.plugins, name);
        if (!plugin || plugin.enabled) return;

        fs.renameSync(plugin.path, this.pluginsFolder + '/' + plugin.name);

        plugin.enabled = true;
        plugin.path = this.pluginsFolder + '/' + plugin.name;
    }

    addPlugin(name: string, b64: string) {
        if (this.plugins.find(p => p.name === name)) return;
        
        // const pluginsFolder = `./server/${this.server.Name}/${this.server.Software}-${this.server.Version}/plugins`;
        const path = this.pluginsFolder + '/' + name;

        //write the base64 (eg. "data:application/java-archive;base64,UEsDBAoAAAgIAFJ9mU8AAAAAAgAAAAAAAAAJAAAATUVUQS1JTkYvAwBQSwMECgAACAgAUn2ZT88mMgx7AAAAmwAAABQAAABNRVRBLUlORi9NQU5JRkVTVC5NRk3KQQrCMBBA0X0gd+gFMjEKRbqTClKhq6LbEtoxTtFJyOj9jV11+R+/90wPlI+5YxaK3FQOdlpdz6aNGbfq4LD65dZtuYZaq94Tm/blRZoq5gDLDOFLcEpJqyEVfw5TRmTTvX3A9bHLbMtj6S9SaqQp8uj2R0gctNLqB1BLAwQKAAAICABSfZlPAAAAAA", etc)
        // to a file
        let b64splitted = b64.includes(',') ? b64.split(',')[1] : b64;
        fs.writeFileSync(path, Buffer.from(b64splitted, 'base64'));

        this.plugins.push({
            name,
            path,
            enabled: true
        });


    }

    getString() {
        return JSON.stringify(this.plugins);
    }

    removePlugin(filename: string) {
        const plugin = this.plugins.find(p => p.name === filename);
        if (!plugin) return;
        fs.unlinkSync(plugin.path);
        this.plugins = this.plugins.filter(p => p.name !== filename);
    }
}