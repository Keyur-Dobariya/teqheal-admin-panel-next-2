const { contextBridge, ipcRenderer, shell, desktopCapturer  } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // openExternalLink: (url) => shell.openExternal(url),
    // captureScreen: () => ipcRenderer.invoke('capture-screen'),
    // showScreenshotWindow: (imageData) => ipcRenderer.send('show-screenshot-window', imageData),
    // sendLoginData: (data) => ipcRenderer.send('login-data', data),
    // getLoginData: () => ipcRenderer.invoke('get-login-data'),
    // sendSettingData: (data) => ipcRenderer.send('setting-data', data),
    // getSettingData: () => ipcRenderer.invoke('get-setting-data'),
    // sendLogout: () => ipcRenderer.send('logout'),
    // sendAttendanceData: (data) => ipcRenderer.send('attendance-data', data),
    // sendOfficeUpdateData: (data) => ipcRenderer.send('office-update-data', data),
    // onCompleteFillDailyUpdate: (data) => ipcRenderer.send('daily-update-complete', data),
});