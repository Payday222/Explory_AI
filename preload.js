const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    getCookie: (name) => ipcRenderer.invoke("get-cookie", name),
    setCookie: (name, value) => ipcRenderer.invoke("set-cookie", name, value),
    sendData: (data) => ipcRenderer.send('send-data', data),
    onDataReceived: (callback) => ipcRenderer.on('receive-data', (_, data) => callback(data))
});
