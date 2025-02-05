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

    const url = 'http://localhost:8080';

    // Ensure server is actually running before loading
    console.log(`Loading URL: ${url}`);
    mainWindow.loadURL(url).catch((err) => {
        console.error("Failed to load URL:", err);
    });

    mainWindow.webContents.openDevTools();

    // IPC: Handle setting cookies
    ipcMain.handle('set-cookie', async (event, name, value) => {
        try {
            await session.defaultSession.cookies.set({
                url: url, 
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

    // IPC: Handle getting cookies
    ipcMain.handle('get-cookie', async (event, name) => {
        try {
            const cookies = await session.defaultSession.cookies.get({ url: url });
            const cookie = cookies.find(cookie => cookie.name === name);
            return cookie ? cookie.value : null;
        } catch (error) {
            console.error("Failed to get cookie:", error);
            return null;
        }
    });

    // Handle window closed event
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});

// Ensure app quits properly (except macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
