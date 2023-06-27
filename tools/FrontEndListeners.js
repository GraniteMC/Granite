const {spawn, exec }= require('child_process');
const fs = require('fs');

const cwd = process.cwd()

const l2f = (path, txt) => {
    //log to file
    fs.appendFile(path, txt, (err) => {
        return err;
    });
}




//run npm run scss and npm run frontend_ts in parallel
const runFrontEnd = () => {
    const child = spawn('npm', ['run', 'frontend_ts'], {cwd: cwd, shell: true});
    child.stdout.on('data', (data) => {
        //l2f('tools\\frontend_ts.log', data.toString());
        console.log(data.toString().replace('c', ''));
    });
    child.stderr.on('data', (data) => {
        //l2f('tools\\frontend_ts.log', data.toString());
        console.error(data.toString());
    });
    child.on('exit', (code) => {
        console.log(`child process exited with code ${code.toString()}`);
    });
}

const runScss = () => {
    const child = spawn('npm', ['run', 'scss'], {cwd: cwd, shell: true});
    child.stdout.on('data', (data) => {
        //l2f('tools\\scss.log', data.toString());
        console.log(data.toString().replace('c', ''));
    });
    child.stderr.on('data', (data) => {
        //l2f('tools\\scss.log', data.toString());
        console.error(data.toString());
    });
    child.on('exit', (code) => {
        console.log(`child process exited with code ${code.toString()}`);
    });
}

const runFrontEndAndScss = () => {
    runScss();
    
    setTimeout(() => {
        runFrontEnd();
    }, 500);
}

runFrontEndAndScss();