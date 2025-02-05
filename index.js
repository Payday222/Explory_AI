const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

let mainWindow;

app.whenReady().then(() => {
    console.log("App is ready, creating main window...");

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        fullscreen: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true, 
            enableRemoteModule: false,
            nodeIntegration: false
        },
    });
    

    const url = 'http://localhost:8080';

    console.log(`Loading URL: ${url}`);
    mainWindow.loadURL(url).catch((err) => {
        console.error("Failed to load URL:", err);
    });

    mainWindow.webContents.openDevTools();

    ipcMain.handle("set-cookie", async (event, name, value) => {
        try {
            await session.defaultSession.cookies.set({
                url: "http://localhost", // Use correct domain
                name: name,
                value: value,
                expirationDate: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
                secure: false, // Set to true for HTTPS
            });
            console.log(`Cookie set: ${name}=${value}`);
        } catch (error) {
            console.error("Failed to set cookie:", error);
        }
    });

    ipcMain.handle("get-cookie", async (event, name) => {
        try {
            const cookies = await session.defaultSession.cookies.get({ url: "http://localhost" });
            const cookie = cookies.find(cookie => cookie.name === name);
            return cookie ? cookie.value : null;
        } catch (error) {
            console.error("Failed to get cookie:", error);
            return null;
        }
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
