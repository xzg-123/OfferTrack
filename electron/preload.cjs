const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("offertrack", {
  desktop: true,
  data: {
    exportBackup: () => ipcRenderer.invoke("data:export-backup"),
    importBackup: () => ipcRenderer.invoke("data:import-backup"),
    openFolder: () => ipcRenderer.invoke("data:open-folder"),
  },
});
