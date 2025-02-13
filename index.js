const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

let mainWindow;

app.whenReady().then(() => {
    console.log("✅ App is ready, creating main window...");

    const preloadPath = path.join(__dirname, 'preload.js');
    console.log(`Using preload script: ${preloadPath}`);

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        fullscreen: true,
        webPreferences: {
            preload: preloadPath, // ✅ Debugging preload path
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
            partition: 'persist:no-cache',
        },
    });

    const indexPath = path.join(__dirname, 'index.html');
    console.log(`Loading local HTML file: ${indexPath}`);

    mainWindow.loadFile(indexPath).catch((err) => {
        console.error("❌ Failed to load file:", err);
    });

    mainWindow.webContents.openDevTools();

    // ✅ Fix: IPC for sending & receiving data
    ipcMain.on('send-data', (event, data) => {
        console.log("📩 Received data in main:", data);
        mainWindow.webContents.send('receive-data', data);
    });

    // ✅ Fix: Cookies Handling
    ipcMain.handle('set-cookie', async (event, name, value) => {
        try {
            await session.defaultSession.cookies.set({
                url: 'http://188.127.1.110',
                name: name,
                value: value,
                expirationDate: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
                secure: false,
                sameSite: 'Lax' 
            });
            console.log(`🍪 Cookie set: ${name}=${value}`);
        } catch (error) {
            console.error("❌ Failed to set cookie:", error);
        }
    });

    ipcMain.handle('get-cookie', async (event, name) => {
        try {
            const cookies = await session.defaultSession.cookies.get({ url: 'http://188.127.1.110' });
            const cookie = cookies.find(cookie => cookie.name === name);
            return cookie ? cookie.value : null;
        } catch (error) {
            console.error("❌ Failed to get cookie:", error);
            return null;
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
