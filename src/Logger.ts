import * as util from "./Util";
import * as fs from 'node:fs'
import { strftime } from "./strftime/strftime";
import path from "node:path";

export class InitialiseLogger {
    public filename: string;
    public filepath: fs.PathOrFileDescriptor;
    public folder = 'logs'

    constructor() {
        if (!fs.existsSync(this.folder)) fs.mkdirSync(this.folder)
        this.filename = strftime(`${util._24HFormat.replace(/:/g, ';')}`) + '.log'
        this.filepath = path.join(this.folder, this.filename)
    }

    _appendToFile(message: string) {
        fs.appendFileSync(this.filepath, message + '\n')
    }

    _log(message: string)  {
        const msg = util.twentyFourHourTimestamp() + ': ' + message
        this._appendToFile(msg)
    }

    chat(message: string) {
        this._log(`[[CHAT]] -> ${message}`)
    }

    ipAddressed(ip: string, message: string) {
        this._log(`(IP: ${ip}) -> ${message}`)
    }
}

export default new InitialiseLogger()