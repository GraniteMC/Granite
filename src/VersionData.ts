import * as fs from 'fs'
import { downloadFile } from './Util'

const vanilla = JSON.parse(fs.readFileSync('./data/vanilla.json', 'utf-8'))
const paper = JSON.parse(fs.readFileSync('./data/paper.json', 'utf-8'))

export async function downloadVersion(version: string, software: 'paper' | 'vanilla', serverName: string): Promise<boolean> {
    if (version.endsWith('.0')) version = version.slice(0, -2)
    
    const destPath: string = `./server/${serverName}/${software}-${version}/${software}-${version}.jar`
    const destFolder: string = `./server/${serverName}/${software}-${version}`
    if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true })
    if (fs.existsSync(destPath)) fs.unlinkSync(destPath)

    
    let url: string | undefined;

    if (software === 'paper') 
        url = paper['paper-' + version]
    else if (software === 'vanilla')
        url = vanilla[version].server

    // console.log(url, software, version)


    if (!url) return false

    await downloadFile(url, destPath)
    

    return true;
}

export function versionInstalled(version: string, software: 'paper' | 'vanilla', serverName: string): boolean {
    if (version.endsWith('.0')) version = version.slice(0, -2)
    return fs.existsSync(`./server/${serverName}/${software}-${version}/${software}-${version}.jar`)
}

export let Versions = {
    vanilla: Object.keys(vanilla),
    paper: Object.keys(paper)
}