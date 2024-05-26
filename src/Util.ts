const fetch = require("node-fetch") //Look, I know this is typescript, but I'm lazy and I don't want to figure out how to import this properly.
const {
    ArrayBuffer
} = fetch
import * as fs from 'fs'
import { promisify } from 'node:util'
import { strftime } from './strftime/strftime';
import { createHash } from 'node:crypto';

const writeFilePromise: (path: string, data: Buffer) => Promise<void> = promisify(fs.writeFile);

export function downloadFile(url: string, outputPath: string) {
    return fetch(url)
        .then((x: ReturnType<typeof fetch>) => x.arrayBuffer())
        .then((x: ArrayBuffer) => writeFilePromise(outputPath, Buffer.from(x)));
}

export const _24HFormat = `%F %k:%M:%S`

export function twentyFourHourTimestamp(date: Date = new Date()) {
    return strftime(_24HFormat, date)
}

export function sha256(data: string) {
    return createHash('sha256').update(data).digest('base64');
}
export function updateIpAddressForServer(propPath: string) {
    if (!fs.existsSync(propPath)) return;
    const older = fs.readFileSync(propPath).toString()
    const newer = older.replace(/server\-ip\=\s/, 'server-ip=0.0.0.0\n')
    
    fs.writeFileSync(propPath, newer)
}