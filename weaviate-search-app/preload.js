// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  searchWeaviate: (query) => ipcRenderer.invoke('search-weaviate', query),
});
