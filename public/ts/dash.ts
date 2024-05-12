const starterBtn1 = document.querySelector('.starter');
const starterBtn2 = document.querySelector('.starter2');

type _data_props_type = {
    "allow-flight": string,
    difficulty: string,
    "enable-command-block": string,
    "enforce-whitelist": string,
    gamemode: string,
    "max-players": string,
    motd: string,
    "online-mode": string,
    pvp: string,
    "server-port": string,
    "spawn-npcs": string,
    "spawn-protection": string,
}

type _plugins_type = {
    name: string,
    path: string,
    enabled: boolean
}

type _data_type = {
    server_name: string,
    frontend_port: number,
    ws_port: number,
    is_server_online: boolean,
    server_software: string,
    mc_port: number,
    server_version: string,
    props: _data_props_type,
    plugins: _plugins_type[],
    versions: string[],
    host: string
}

type pages = 'server' | 'console' | 'plugins' | 'settings' | 'download' | 'extensions';

let openTab: pages = 'server';

let validServerNameRegexp = /^[a-zA-Z0-9_-]+$/;

const startServer = (ev) => {
    fetch('/server/start', {
        method: 'POST'
    }).then(res => {
        console.log(res);
        if (document.querySelector(".fa-solid.fa-toggle-on.hide")) {
            document.querySelector(".fa-solid.fa-toggle-on.hide")?.classList.remove('hide');
            document.querySelector(".fa-solid.fa-toggle-off")?.classList.add('hide');
        } else {
            document.querySelector(".fa-solid.fa-toggle-on")?.classList.add('hide');
            document.querySelector(".fa-solid.fa-toggle-off")?.classList.remove('hide');
        }
    })
}

const stopServer = (ev) => {
    fetch('/server/stop', {
        method: 'POST'
    }).then(res => {
        console.log(res);
        if (document.querySelector(".fa-solid.fa-toggle-on.hide")) {
            document.querySelector(".fa-solid.fa-toggle-on.hide")?.classList.remove('hide');
            document.querySelector(".fa-solid.fa-toggle-off")?.classList.add('hide');
        } else {
            document.querySelector(".fa-solid.fa-toggle-on")?.classList.add('hide');
            document.querySelector(".fa-solid.fa-toggle-off")?.classList.remove('hide');
        }
    })
}

// @ts-ignore
let _DATA: _data_type = __DATA;
// @ts-check

let serverOn = _DATA.is_server_online;

const initialiseConsoleWebSocket = () => {
    const ConsoleWebsocket = new WebSocket(`ws://${_DATA.host}:${_DATA.ws_port}/console`);

    const consoleInput = document.querySelector('.console-input') as HTMLInputElement;
    const sendConsoleCommandBtn = document.querySelector('.console-input-btn');
    const consoleOutput = document.querySelector('.console-output') as HTMLDivElement;

    const sendConsoleInput = () => {
        ConsoleWebsocket.send(consoleInput.value);
        consoleInput.value = '';
    }

    const sendConsoleCommand = (ev) => {
        if (ev.key === 'Enter') {
            sendConsoleInput();
        }
    }

    ConsoleWebsocket.addEventListener('message', (ev) => {
        let newEl = document.createElement('p');
        newEl.innerText = ev.data;
        consoleOutput.appendChild(newEl);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;

        if (ev.data =='Granite Server stopped.' || ev.data == '+Server stopped.') {
            document.querySelector(".fa-solid.fa-toggle-on")?.classList.add('hide');
            document.querySelector(".fa-solid.fa-toggle-off")?.classList.remove('hide');
            document.querySelector('#server-bar-info')?.classList.toggle('green');
            document.querySelector('#server-bar-info')?.classList.toggle('red');
        }
    });


    consoleInput.addEventListener('keydown', sendConsoleCommand);
    sendConsoleCommandBtn?.addEventListener('click', sendConsoleInput);

    return () => {
        ConsoleWebsocket.close()
    }
}

let _closews = initialiseConsoleWebSocket()

const toggleOnOff = (ev) => {

    if (serverOn) {
        stopServer(ev);
        _closews()
        //swap .server-switch.hide to .server-switch.show and vice versa
        /*document.querySelectorAll('.starter i').forEach(el => {
            if (el.classList.contains('hide')) el.classList.remove('hide');
            else el.classList.add('hide');
        });*/
        serverOn = false;
    } else {
        /*document.querySelectorAll('.starter i').forEach(el => {
            if (el.classList.contains('hide')) el.classList.remove('hide');
            else el.classList.add('hide');
        });*/
        serverOn = true;
        startServer(ev);
        _closews = initialiseConsoleWebSocket()

    }

    document.querySelector('#server-bar-info')?.classList.toggle('green');
    document.querySelector('#server-bar-info')?.classList.toggle('red');
}


starterBtn1?.addEventListener('click', toggleOnOff);
starterBtn2?.addEventListener('click', toggleOnOff);

const tabSwapper = (ev) => {
    console.log(ev);
    let target = ev.target as HTMLLIElement;
    let target_tab: pages = target.parentElement?.getAttribute('data-tab-name') as pages;  
    console.log(target_tab);

    if (target_tab === openTab) return;

    document.querySelector(`.page[data-tab-name=${openTab}]`)?.classList.add('hide');
    document.querySelector(`.page[data-tab-name=${target_tab}]`)?.classList.remove('hide');

    
    openTab = target_tab;

}

document.querySelectorAll('.tab[data-tab-name]').forEach(el => {
    console.log(el);
    el.addEventListener('click', tabSwapper);
});

document.querySelectorAll(`.download-option[data-option-dimensions]`).forEach(el => {
    el.addEventListener('click', (ev) => {
        //download /server/download/${el.getAttribute('data-option-dimensions')} (which is a GET, maybe open it in a new tab?)
        window.open(`/server/download/${el.getAttribute('data-option-dimensions')}`, '_blank');
        

    });
});

document.querySelector('#info-starder-btn')?.addEventListener('click', (ev) => {
    let event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    starterBtn1?.dispatchEvent(event);

    //do the swapping display stuff
    let target = document.querySelector('#info-starder-btn') as HTMLDivElement;
    /*
    run 
    target.firstElementChild?.classList.toggle('hide');
    target.lastElementChild?.classList.toggle('hide');
    but toggle EVEN IF they aren't on by default
    */

    setTimeout(() => {
        let html = document.querySelector('.starter') || { innerHTML: ''}
        let inner = html.innerHTML;
        target.innerHTML = inner.toString();
    }, 100);
});

document.querySelector('.save-props-btn')?.addEventListener('click', (ev) => {
    let properties = document.querySelectorAll('[data-property-input-name]') as NodeListOf<HTMLInputElement>;
    let btn = ev.target as HTMLButtonElement;

    let changed: { name: string, value: string }[] = [];

    properties.forEach(el => {
        if (el.value !== el.getAttribute('data-property-input-value')) {
            changed.push({
                name: el.getAttribute('data-property-input-name') as string || '',
                value: el.value || ''
            });

            _DATA.props[el.getAttribute('data-property-input-name') as string] = el.value;

            el.setAttribute('data-property-input-value', el.value);
        }    
    });

    console.log(changed);

    btn.classList.add('green_fade_btn');
    setTimeout(() => {
        btn.classList.remove('green_fade_btn');
    }, 1000);

    for (const change of changed) {
        console.log(change)
        let body = {
            name: change.name,
            value: change.value
        }
        console.log(body);

        fetch(`/server/property`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }

        }).then(res => {
            console.log(res);
        });
        
    }
});

document.querySelector('#plugin_dropzone')?.addEventListener('dragover', (ev) => {
    let target = ev.target as HTMLDivElement;
    ev.preventDefault();

    target.classList.add('dragover');
});

document.querySelector('#plugin_dropzone')?.addEventListener('dragleave', (ev) => {
    let target = ev.target as HTMLDivElement;
    ev.preventDefault();
    target.classList.remove('dragover');
});

document.querySelector('#plugin_dropzone')?.addEventListener('drop', (ev: any) => {
    let dropzone = ev.target as HTMLDivElement;

    if (dropzone.classList.contains('dragover')) dropzone.classList.remove('dragover');

    ev.preventDefault();

    //let file = ev.dataTransfer.files[0];
    for (let file of ev.dataTransfer.files) {
        let type = file.type;
        let name = file.name;
        let size = file.size;

        if (type !== 'application/java-archive') return console.log('not a jar file');
        
        const form = new FormData();
        form.append('file', file);
        form.append('name', name);

        console.log(form);

        fetch('/server/plugin/upload', {
            method: 'POST',
            body: form,
            // headers: {
            //     'Content-Type': 'multipart/form-data'
            // }
        }).then(res => {
            console.log(res);

            setTimeout(() => {
                window.location.reload();
            }, 200);
        })
    } 

    // let reader = new FileReader();
    // reader.readAsDataURL(file);
    
    // reader.onload = () => {
    //     let base64 = reader.result;

    //     console.log(base64, name, type);

        
    // }


});

document.querySelectorAll('.plugin_li_action_btn').forEach(el => {
    el.addEventListener('click', (ev) => {
        let plugin_name = el.getAttribute('data-plugin-name') as string;

        fetch(`/server/plugin/delete/${plugin_name}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        let li = document.querySelector(`li[data-plugin-name="${plugin_name}"]`) as HTMLLIElement;
        li.remove();
    });
});

document.querySelectorAll('.plugin_li_enabled_checkbox').forEach(el => {
    el.addEventListener('click', (ev) => {
        let check = el as HTMLInputElement;
        let plugin_name = check.getAttribute('data-plugin-name') as string;
        let checked = check.checked;

        console.log(plugin_name, checked);

        fetch(`/server/plugin/${checked ? 'enable' : 'disable'}/${plugin_name}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
    })
})

document.querySelector('#server-select')?.addEventListener('change', (ev) => {
    let select = ev.target as HTMLSelectElement;

    let value = select.value;

    fetch(`/server/change`, {
        method: 'POST',
        body: JSON.stringify({ name: value }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        console.log(res);
        window.location.reload();
    })
})

document.querySelector('#new-server-btn')?.addEventListener('click', (ev) => {
    let btn = ev.target as HTMLButtonElement;

    let btn_x = btn.getBoundingClientRect().x;
    let btn_x_center = btn_x + (btn.getBoundingClientRect().width / 2);
    let btn_y = btn.getBoundingClientRect().y;

    let mod = document.querySelector('#server-creation-modal') as HTMLDivElement;
    mod.style.display = 'block';
    mod.style.top = `${btn_y + 50}px`;
    mod.style.left = `${btn_x_center - 200}px`;

})

document.querySelector('#server-creation-modal-exit')?.addEventListener('click', (ev) => {
    let mod = document.querySelector('#server-creation-modal') as HTMLDivElement;
    mod.style.display = 'none';
})

document.querySelector('#server-creation-software-select')?.addEventListener('change', (ev) => {
    let elm = ev.target as HTMLSelectElement;

    let paper_version_select = document.querySelector('#server-creation-paper-version-select') as HTMLSelectElement;
    let vanilla_version_select = document.querySelector('#server-creation-vanilla-version-select') as HTMLSelectElement;
    if (elm.value === 'paper') {
        paper_version_select.style.display = '';
        vanilla_version_select.style.display = 'none';
    } else {
        paper_version_select.style.display = 'none';
        vanilla_version_select.style.display = '';
    }
})

document.querySelector('#server-creation-modal-create')?.addEventListener('click', (ev) => {
    let servName = (document.querySelector('#server-creation-modal-name') as HTMLInputElement).value;
    let servSoftware = (document.querySelector('#server-creation-software-select') as HTMLSelectElement).value;
    let servVersion = (document.querySelector(`#server-creation-${servSoftware}-version-select`) as HTMLSelectElement).value;
    let servPort = (document.querySelector('#server-creation-modal-port') as HTMLInputElement).value;

    let body = {
        name: servName,
        software: servSoftware,
        version: servVersion,
        port: servPort
    }

    if (
        servName === '' || 
        servSoftware === '' || 
        servVersion === '' || 
        servPort === '' ||
        //check if the regex matches
        validServerNameRegexp.test(servName) === false
    ) return

    console.log(body);


    fetch('/server/new', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        setTimeout(() => {
            window.location.reload();
        }, 400);
    })



})