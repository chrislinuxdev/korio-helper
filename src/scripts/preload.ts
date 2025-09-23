import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,

  // External link opener
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // Token management
  storeToken: (key, token) => ipcRenderer.invoke('store-token', key, token),
  getToken: (key) => ipcRenderer.invoke('get-token', key),
  deleteToken: (key) => ipcRenderer.invoke('delete-token', key),
});
