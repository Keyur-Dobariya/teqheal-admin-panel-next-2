const { app, BrowserWindow, ipcMain, Menu, Tray} = require('electron');
const path = require('path');
const {setupActivityTracking} = require('./activityTracker');
const {setupScreenshotHandling} = require('./screenshotHandler');
const {electronEnvironment, electronCommon} = require("./electronEndpoints");
const {loadUserData, saveUserData, deleteUserData, saveSettingData, loadSettingData} = require("./localStorage");
const {scheduleWindowsFromData} = require("./windowManager");

let mainWindow;
let tray = null;
const isShowTest = true;

function createMainWindow() {
    if (mainWindow) {
        mainWindow.show();
        return;
    }

    mainWindow = new BrowserWindow({
        // width: 370,
        // height: 510,
        width: 1000,
        height: 700,
        resizable: isShowTest,
        autoHideMenuBar: true,
        fullscreen: false,
        icon: path.join(__dirname, electronCommon.appIcon),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    if (!isShowTest) {
        Menu.setApplicationMenu(null);
    } else {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadURL(electronEnvironment.webUrl);

    mainWindow.on('close', (event) => {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });

    createTray();
}

function createTray() {
    if (tray) return;

    tray = new Tray(path.join(__dirname, electronCommon.appIcon));

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                mainWindow.show();
            },
        },
        {
            label: 'Quit',
            click: () => {
                app.isQuiting = true;
                app.quit();
            },
        },
    ]);

    tray.setToolTip('Teqheal Solution');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        mainWindow.show();
    });
}

app.whenReady().then(() => {
    createMainWindow();
    setupScreenshotHandling();
    setupActivityTracking();
});

app.on('window-all-closed', () => {

});

ipcMain.on('login-data', (event, data) => {
    if (data) {
        saveUserData(data);
    }
});

ipcMain.on('setting-data', (event, data) => {
    if (data) {
        saveSettingData(data);
    }
});

ipcMain.handle('get-login-data', async () => {
    return loadUserData();
});

ipcMain.handle('get-setting-data', async () => {
    return loadSettingData();
});

ipcMain.on('logout', () => {
    deleteUserData();
});

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow();
    } else {
        mainWindow.show();
    }
});

ipcMain.on('office-update-data', (event, data) => {
    scheduleWindowsFromData(data);
});