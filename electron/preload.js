const { contextBridge, ipcRenderer, shell, desktopCapturer  } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    openExternalLink: (url) => shell.openExternal(url),
    captureScreen: () => ipcRenderer.invoke('capture-screen'),
    showScreenshotWindow: (imageData) => ipcRenderer.send('show-screenshot-window', imageData),
    sendLoginData: (data) => ipcRenderer.send('login-data', data),
    sendLogout: () => ipcRenderer.send('logout'),
    getLoginData: () => ipcRenderer.invoke('get-login-data'),
    onLoginData: (callback) => {
        ipcRenderer.on('login-data-fetch', (event, data) => {
            console.log('[preload] Received login-data-fetch:', data);
            callback(data);
        });
    },
    sendAttendanceData: (data) => ipcRenderer.send('attendance-data', data),
    sendOfficeUpdateData: (data) => ipcRenderer.send('office-update-data', data),
    onCompleteFillDailyUpdate: (data) => ipcRenderer.send('daily-update-complete', data),
});