const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

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

    // IPC: Handle setting cookies
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

    // IPC: Handle getting cookies
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

    // Listen for save-data-before-quit event from the server
    ipcMain.on('save-data-before-quit', () => {
        console.log("Received quit signal from server. Saving data...");
        saveFinalArray();  // Call the function to save the data
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

function saveFinalArray() {
    const filePath = path.join(__dirname, 'history.json');
    const tempFilePath = path.join(__dirname, 'temp.txt');
    let stringArray = [];

    if (fs.existsSync(filePath)) {
        try {
            stringArray = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (error) {
            console.error("Error reading JSON file:", error);
        }
    }

    if (fs.existsSync(tempFilePath)) {
        const lines = fs.readFileSync(tempFilePath, 'utf8').split('\n').filter(Boolean);
        stringArray.push(...lines);

        fs.writeFileSync(filePath, JSON.stringify(stringArray, null, 2));
        fs.unlinkSync(tempFilePath);
        console.log("Final array saved:", stringArray);
    }
}
