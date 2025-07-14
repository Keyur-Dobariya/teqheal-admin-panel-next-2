const { app, BrowserWindow, ipcMain, Menu, Tray} = require('electron');
const path = require('path');
const {setupActivityTracking} = require('./activityTracker');
const {setupScreenshotHandling} = require('./screenshotHandler');
const {electronEnvironment, electronCommon} = require("./electronEndpoints");
const {loadUserData, saveUserData, deleteUserData} = require("./localStorage");
const {scheduleWindowsFromData} = require("./windowManager");

let mainWindow;
let tray = null;

function createMainWindow() {
    if (mainWindow) {
        mainWindow.show();
        return;
    }

    mainWindow = new BrowserWindow({
        width: 370,
        height: 515,
        resizable: electronCommon.isForTest,
        autoHideMenuBar: true,
        fullscreen: false,
        icon: path.join(__dirname, electronCommon.appIcon),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    if (!electronCommon.isForTest) {
        Menu.setApplicationMenu(null);
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

ipcMain.handle('get-login-data', async () => {
    return loadUserData();
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