
<p align="center">
    <image src="assets/Polished.png">
    <h1>Granite</h1>
</p>

<br>

## What is Granite?

Granite is an open-source minecraft server manager designed to be selfhostable and easy to use.

## Features

- Easy to use
- Multiple servers
- Console access
- Plugin disabling, removal, and installation
- `server.properties` editing
- World downloading
- Vanilla and PaperMC support
- **Coming soon:** Extensions

## Installation

1. To start, by making a server on Granite, you agree to the Minecraft EULA. You can find it [here](https://account.mojang.com/documents/minecraft_eula).
2. Before installing Granite, you must have the following installed:
    - [Node.js](https://nodejs.org/en/)
    - [npm](https://www.npmjs.com/)
    - [Git](https://git-scm.com/)
3. Clone the repository using `git clone https://github.com/GraniteMC/Granite.git`
4. Install the dependencies and compile frontend using `npm run setup && npm run build`

## Running Granite

1. Run the server using `npm run dev`
2. You can now access Granite at `localhost:4444`
    - You will have a default server called `Default` running Vanilla 1.19.4
      - This can't be deleted, but you can make a new server by pressing `+ New Server` at the top and filling in the options and then pressing `Create Server`.
      - You can then change the server by clicking on the server name at the top and selecting the server you want to switch to.
    - You can access the console by clicking on the Terminal icon on the left side of the screen.
    - You can upload, remove and disable plugins by clicking on the Plugins icon on the left side of the screen if you're running PaperMC.
    - You can download the world[s] by clicking on the World icon on the left side of the screen.
    - You can edit the `server.properties` file by clicking on the Settings icon on the left side of the screen.
    - You can turn the server on/off by clicking on the Power icon on the top left side of the screen.
3. You can stop the server by pressing `Ctrl + C` in the terminal.
4. If you want to change the default `4444` port, you can do so by changing the `frontend_port` field in `config.json` to the port you want to use. (Make sure the server is stopped before doing this)
