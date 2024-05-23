import { ServerProcess } from './src/ServerProcess';
import * as versions from './src/VersionData';
import * as cfg from './src/Config';
import * as ph from './src/PropertiesHandler';
import * as bck from './src/Backups'
import { PluginManager, Plugin as PluginType } from './src/PluginManager';
import { Server } from './src/ServerRunner';
import * as fs from 'fs';

import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'node:path'

const app: express.Application = express();

app.use('/public',express.static('public'));
app.use('/assets',express.static('assets'));
app.use(bodyParser.json());

if (!fs.existsSync('./server')) fs.mkdirSync('./server');

let server: Server = new Server(versions.getNumericalVersionFromSoftVersion(cfg.current_server_choice!.version),
    cfg.current_server_choice!.software ?? 'paper', 
    cfg.current_server_choice!.server_name ?? 'Granite');
let plugins: PluginManager = new PluginManager(server);
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })

let props: any = {};
try {
    ph.loadProperties(server.JarFolder + '/server.properties');
} catch (e) {
    server.Ready.then(() => {
        props = ph.loadProperties(server.JarFolder + '/server.properties');
    })
}
//console.log(props);

//props['max-players'] = 100;
//console.log(ph.saveProperties(server.JarFolder + '/server.properties', props));



const changeServer = (name: string) => {
    server.stop();
    cfg.plusWSport();
    let newConf = {
        ...cfg.Config,
    }
    newConf.current_server_choice = newConf.servers.find(s => s.server_name === name);

    if (!newConf.current_server_choice) 
        return;
    

    cfg.updateConfig(newConf);

    const serverConstructorArgs = [
        newConf.current_server_choice.version.split('-')[1],
        newConf.current_server_choice.software as any,
        newConf.current_server_choice.server_name,
    ];

    //server = new Server('1.18', 'paper', '2myepicserver');
    server = new Server(serverConstructorArgs[0], serverConstructorArgs[1], serverConstructorArgs[2]);
    plugins = new PluginManager(server);
    server.Ready.then(() => {
        props = ph.loadProperties(server.JarFolder + '/server.properties');
    })
}


app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.redirect(301, '/dashboard')
})

app.get('/dashboard', (req, res) => {
    let data = {
        ws_port: cfg.getSocketPort(),
        ...cfg.getConfig(),
        props: JSON.stringify(props),
        plugins: plugins.getString(),
        servers: cfg.Config.servers,
        versions: JSON.stringify(versions.Versions),

        is_server_online: server.isOnline()
    }
    res.render('dashboard.ejs', data); 
});

app.post('/server/change', (req, res) => {
    let servername = req.body.name;

    changeServer(servername);

    res.sendStatus(200);
})

app.post('/server/new', (req, res) => {
    let servername = req.body.name;
    let version = req.body.version;
    let software = req.body.software;
    let port = req.body.port;

    cfg.addNewServer({
        server_name: servername,
        version: version,
        software: software,
        port: port
    })

    res.sendStatus(200);

})



app.post('/server/plugin/upload', upload.single('file'), (req, res) => {
    // console.log(req.file, req.body, req.body.name);
    let b64 = req.file?.buffer.toString('base64') || ''
    plugins.addPlugin(req.body.name, b64);

    res.sendStatus(200)
});

app.post('/server/plugin/delete/:name', (req, res) => {
    if (server.isOnline()) 
        return res.sendStatus(400);

    const name = req.params.name;

    console.log(name);

    plugins.removePlugin(name);

    res.sendStatus(200);
})

app.post('/server/plugin/enable/:name', (req, res) => {
    if (server.isOnline())
        return res.sendStatus(400);

    const name = req.params.name;

    console.log(name);

    plugins.enablePlugin(name);
})

app.post('/server/plugin/disable/:name', (req, res) => {
    if (server.isOnline())
        return res.sendStatus(400);

    const name = req.params.name;

    plugins.disablePlugin(name);
})

app.post('/server/info', (req, res) => {
    let data = {
        version: server.Version,
        software: server.Software,
        name: server.Name,
        
        is_online: server.isOnline()
    }
    res.json(data);
})

app.post('/server/property', (req, res) => {
    if (!req.body) {
        console.log(req.body)
        res.sendStatus(400);
        return;
    }

    const property = req.body.name;
    const value = req.body.value;

    props[property] = value;

    ph.saveProperties(server.JarFolder + '/server.properties', props);

    res.sendStatus(200);
})

app.get('/server/download/:dimension', (req, res) => {

    const dimension = req.params.dimension;
    let name = `world${dimension === 'overworld' ? '' : '_' + dimension}`;
    if (name === 'world_end') name = 'world_the_end';

    if (dimension === 'full-server') name = '' // download the full server directory, instead of a subdirectory

    console.log(`Downloading ${name} (${dimension})...`);

    server.downloadWorld(name).then((path) => {
        console.log(`Downloaded ${name} to ${path}`);
        res.download(path);
    })  
});


app.post('/server/start', (req, res) => {
    if (bck.eligible(cfg.Config)) {
        bck.backup({
            serverDetails: {
                name: server.Name,
                version: `${server.Software}-${server.Version}`,
            },
            destfolder: path.join(__dirname, cfg.Config.backups.location, `${server.Name} ${server.Software}-${server.Version}`)
        })
        cfg.updateBackupTime()
    }
    server.start();
    res.sendStatus(200);
});

app.post('/server/stop', (req, res) => {
    server.stop();
    res.sendStatus(200);
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(__dirname + '/assets/Polished.ico');
    res.sendStatus(200);
});






app.listen(cfg.frontend_port, () => {
    console.log('Granite started on port ' + cfg.frontend_port);
});