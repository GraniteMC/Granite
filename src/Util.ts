const fetch = require("node-fetch") //Look, I know this is typescript, but I'm lazy and I don't want to figure out how to import this properly.
const {
    ArrayBuffer
} = fetch
import * as fs from 'fs'
import { promisify } from 'util'

const writeFilePromise: (path: string, data: Buffer) => Promise<void> = promisify(fs.writeFile);

export function downloadFile(url: string, outputPath: string) {
    return fetch(url)
        .then((x: ReturnType<typeof fetch>) => x.arrayBuffer())
        .then((x: ArrayBuffer) => writeFilePromise(outputPath, Buffer.from(x)));
}