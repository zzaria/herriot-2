const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping'),
  embedProblem: (problemLink) => ipcRenderer.send('problemBrowserView',problemLink),
  closeEmbed: () => ipcRenderer.send('closeBrowserView'),
  // we can also expose variables, not just functions
})