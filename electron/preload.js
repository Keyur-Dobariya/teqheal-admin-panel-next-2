const { contextBridge, ipcRenderer, shell, desktopCapturer  } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    openExternalLink: (url) => shell.openExternal(url),
    captureScreen: () => ipcRenderer.invoke('capture-screen'),
    showScreenshotWindow: (imageData) => ipcRenderer.send('show-screenshot-window', imageData),
    sendLoginData: (data) => ipcRenderer.send('login-data', data),
    sendAttendanceData: (data) => ipcRenderer.send('attendance-data', data),
});