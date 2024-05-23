import path from 'node:path'
import { strftime } from './strftime/strftime'
import * as zp from './Zipper'
import * as fs from 'node:fs'
import { properConfig } from './Config'

export interface backupServerDetails {
    name: string,
    version: string,
}
export type backupFunction = (options: {serverDetails: backupServerDetails, items?: string[], destfolder: string, zip?: boolean}) => boolean

export const backup: backupFunction = ({
    serverDetails = null,
    items = [
        'plugins', 'logs', 'world', 'world_nether', 'world_the_end', 'ops.json', 'version_history.json', 'bukkit.yml', 'server.properties', 'spigot.yml'
    ],
    destfolder = null,
    zip = true,
}) => {
    if (!serverDetails || items.length == 0 || !destfolder) return false

    try {
        const stamp = strftime('%Y-%m-%d %X %Zs', new Date()).replace(/:/g, ';') //eg. 2022-04-01 5;15;00 PM PST
        const uniqueFolder = path.join(destfolder, stamp)

        fs.mkdirSync(uniqueFolder, { recursive: true })
        
        for (const item of items) {
            const ip = path.join('server', serverDetails.name, serverDetails.version, item)
            const dp = path.join(uniqueFolder, item)
            const ipExists = fs.existsSync(ip)
            
            if (!fs.existsSync(dp) && (ipExists && fs.statSync(ip).isDirectory())) 
                fs.mkdirSync(dp, { recursive: true })
            
            if (ipExists)
                fs.cpSync(ip, dp, { recursive: true})
        }

        if (zip) {
            zp.zipFolder(uniqueFolder, uniqueFolder + '.zip').then(() => {
                fs.rmdirSync(uniqueFolder, {recursive: true})
            })
        }
        
    } catch (e) {
        console.error(e)
        return false
    }



    return true
}

export const eligible = (config: properConfig) => {
    if (config.backups.interval == -1) return true

    return (new Date().valueOf() - config.backups.lastBackup) >= config.backups.interval
}

export default backup