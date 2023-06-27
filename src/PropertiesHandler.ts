import propertyparser from 'properties-parser';
import * as fs from 'fs';

export type supportedProperties = {
    'gamemode': 'survival' | 'creative' | 'adventure' | 'spectator';
    'enable-command-block': boolean;
    'motd': string;
    'pvp': boolean;
    'difficulty': 'peaceful' | 'easy' | 'normal' | 'hard';
    'max-players': number;
    'online-mode': boolean;
    'allow-flight': boolean;
    'server-port': number;
    'enforce-whitelist': boolean;
    'spawn-protection': number;
    'spawn-npcs': boolean;
}

export const supportPropertiesArray: string[] = [
    'gamemode',
    'enable-command-block',
    'motd',
    'pvp',
    'difficulty',
    'max-players',
    'online-mode',
    'allow-flight',
    'server-port',
    'enforce-whitelist',
    'spawn-protection',
    'spawn-npcs'
]

export let file: any = {};
export let originalFile: any = {};

export function loadProperties(path: string) {
    let tempFile = propertyparser.read(path);
    originalFile = {...tempFile}
    
    //only return values that are IN the supportedProperties type
    for (const key in tempFile) {
        if (key in tempFile) {
            const value: string = tempFile[key];
            if (supportPropertiesArray.includes(key)) {
                file[key] = value;
            }
        }
    }
    return file;
}

export function saveProperties(path: string, supported: any) {
    
    //merge originalFile and supported, do not overwrite originalFile
    let outString = '';
    for (const key in originalFile) {
        if (key in supported) {
            const value: string = supported[key];
            outString += `${key}=${value}\n`;
        }
        else {
            const value: string = originalFile[key];
            outString += `${key}=${value}\n`;
        }
    }

    //console.log(outString);
    
    fs.writeFileSync(path, outString);

    return outString;
    
}
