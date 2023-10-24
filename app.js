const { app, BrowserWindow, ipcMain } = require('electron');
const url = require("url");
const path = require("path");
// const io = require('socket.io-client');
// let socket = io.connect('http://localhost:8000/');
let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1024, height: 768,
        frame: false,
        resizable: false,
        fullscreen: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: true,
        }
    })

    urlObject = {
        pathname: path.join(__dirname, `app/index.html`),
        protocol: "file:",
        slashes: true
    }
    mainWindow.loadURL(
        url.format(urlObject)
    );

    ipcMain.on('set-title', (event, title) => {
        const webContents = event.sender
        const win = BrowserWindow.fromWebContents(webContents)
        win.setTitle(title);
    })

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})