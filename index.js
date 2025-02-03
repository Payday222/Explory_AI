const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), 
            nodeIntegration: false, // false for security
            contextIsolation: true, 
            webSecurity: false,  // This is still needed for other features but won't fix cookie issue directly
        },
        fullscreen: true,
    });

    mainWindow.loadURL('http://localhost:8080');  // Serving via local server

    mainWindow.webContents.openDevTools();

    // Handle cookie setting via IPC
    ipcMain.handle('set-cookie', async (event, name, value) => {
        await session.defaultSession.cookies.set({
            url: 'http://localhost:8080',  // Use the correct URL
            name: name,
            value: value,
            expirationDate: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
        });
        console.log(`Cookie set: ${name}=${value}`);
    });

    // Handle cookie getting via IPC
    ipcMain.handle('get-cookie', async (event, name) => {
        const cookies = await session.defaultSession.cookies.get({
            url: 'http://localhost:8080'  // Use the correct URL here too
        });
        const cookie = cookies.find(cookie => cookie.name === name);
        return cookie ? cookie.value : null;
    });
});
