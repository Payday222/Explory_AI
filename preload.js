const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    getCookie: (name) => ipcRenderer.invoke("get-cookie", name),
    setCookie: (name, value) => ipcRenderer.invoke("set-cookie", name, value),
});

contextBridge.exposeInMainWorld('electronAPI', {
    openNewWindow: () => ipcRenderer.send('open-new-window')
});
