const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

let mainWindow;

app.whenReady().then(() => {
    console.log("App is ready, creating main window...");

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        fullscreen: true, // Keep fullscreen as per your request
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false, // Better security
            contextIsolation: true,
            webSecurity: true, // Keep enabled unless you have CORS issues
        },
    });


    const indexPath = path.join(__dirname, 'index.html');

    console.log(`Loading local HTML file: ${indexPath}`);
    mainWindow.loadFile(indexPath).catch((err) => {
        console.error("Failed to load file:", err);
    });

    mainWindow.webContents.openDevTools();

 
    ipcMain.handle('set-cookie', async (event, name, value) => {
        try {
            await session.defaultSession.cookies.set({
                url: 'http://188.127.1.110', // Use the appropriate URL or remove this for local files
                name: name,
                value: value,
                expirationDate: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
                secure: false, // Change to true if using HTTPS
                sameSite: 'Lax' 
            });
            console.log(`Cookie set: ${name}=${value}`);
        } catch (error) {
            console.error("Failed to set cookie:", error);
        }
    });


    ipcMain.handle('get-cookie', async (event, name) => {
        try {
            const cookies = await session.defaultSession.cookies.get({ url: 'http://188.127.1.110' });
            const cookie = cookies.find(cookie => cookie.name === name);
            return cookie ? cookie.value : null;
        } catch (error) {
            console.error("Failed to get cookie:", error);
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
