const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    setCookie: (name, value) => ipcRenderer.invoke('set-cookie', name, value),
    getCookie: (name) => ipcRenderer.invoke('get-cookie', name)
});
