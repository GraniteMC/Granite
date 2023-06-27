import * as fs from 'fs';
import archiver from 'archiver';

export function zipFolder(folderPath: string, zipPath: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', () => {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');

            resolve(zipPath);
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);

        archive.directory(folderPath, false);

        archive.finalize();
    })
}