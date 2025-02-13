const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    getCookie: (name) => ipcRenderer.invoke("get-cookie", name),
    setCookie: (name, value) => ipcRenderer.invoke("set-cookie", name, value),
    openWindow: (url) => ipcRenderer.send("open-window", url),
    sendDataToMain: (data) => ipcRenderer.send('send-data', data),  // Send data to main process
    receiveDataFromMain: (callback) => ipcRenderer.on('receive-data', (event, data) => callback(data))  // Receive data in host
});
