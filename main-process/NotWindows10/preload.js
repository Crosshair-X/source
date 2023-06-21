const { contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('myAPI', {
    quit: () => ipcRenderer.invoke('quit-app')
})