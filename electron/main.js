const { app, BrowserWindow, ipcMain, Menu, desktopCapturer, screen, Tray} = require('electron');
const path = require('path');
const { GlobalKeyboardListener } = require("node-global-key-listener");

let mainWindow;
let screenshotWindow;

const keyboard = new GlobalKeyboardListener();

const isDevMode = false;

const webBaseUrl = isDevMode ? 'http://192.168.0.104:4000' : 'https://teqheal-admin-panel-next-2.vercel.app';
const dailyReportEndPoint = '/tracker/daily-update';

let attendanceData = {};
let mouseEventCount = 0;
let keyboardKeyPressCount = 0;
const isForTest = false;
const appIcon = "../app/favicon.ico";
let tray = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 370,
        height: 510,
        resizable: isForTest,
        autoHideMenuBar: true,
        fullscreen: false,
        icon: path.join(__dirname, appIcon),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    if(!isForTest) {
        Menu.setApplicationMenu(null);
    }
    // mainWindow.webContents.openDevTools();

    mainWindow.loadURL(webBaseUrl);

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

    tray = new Tray(path.join(__dirname, appIcon)); // .ico for Windows, .png for others

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
    createWindow();
});

app.on('window-all-closed', () => {
    // Do nothing here so app keeps running in background
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    } else {
        mainWindow.show();
    }
});

let scheduledWindows = [];
let loginData;

// function scheduleWindowsFromData(dataArray) {
//     const now = new Date();
//
//     dataArray.forEach(item => {
//         const alreadyScheduled = scheduledWindows.some(s => s.id === item._id);
//         if (alreadyScheduled) {
//             console.log(`Event "${item.title}" with ID ${item._id} is already scheduled. Skipping...`);
//             return;
//         }
//
//         const showTime = new Date(item.showTime);
//         const delay = showTime - now;
//
//         if (delay > 0) {
//             console.log(`Scheduling window for "${item.title}" in ${delay / 1000} seconds`);
//
//             const timer = setTimeout(() => {
//                 openScheduledWindow(item.windowLink, item.title);
//                 scheduledWindows.splice(scheduledWindows.findIndex(s => s.id === item._id), 1);
//             }, delay);
//
//             scheduledWindows.push({ id: item._id, timer });
//         } else {
//             console.log(`Skipped "${item.title}" — showTime already passed`);
//         }
//     });
// }

function scheduleWindowsFromData(dataArray) {
    const now = new Date();

    dataArray.forEach(item => {
        const alreadyScheduled = scheduledWindows.some(s => s.id === item._id);
        if (alreadyScheduled && !item.isDaily) {
            console.log(`"${item.title}" already scheduled. Skipping...`);
            return;
        }

        if (item.isDaily) {
            const [hour, minute, second] = new Date(item.showTime).toTimeString().split(':');
            const nextTime = new Date();

            nextTime.setHours(parseInt(hour));
            nextTime.setMinutes(parseInt(minute));
            nextTime.setSeconds(parseInt(second));
            nextTime.setMilliseconds(0);

            if (nextTime <= now) {
                nextTime.setDate(nextTime.getDate() + 1); // schedule for tomorrow
            }

            const delay = nextTime - now;
            console.log(`Scheduling DAILY "${item.title}" in ${delay / 1000}s`);

            // Clear existing timer if re-scheduling
            const existing = scheduledWindows.find(s => s.id === item._id);
            if (existing) {
                clearTimeout(existing.timer);
                scheduledWindows = scheduledWindows.filter(s => s.id !== item._id);
            }

            const timer = setTimeout(() => {
                launchWindow(item);

                // Re-schedule for next day
                scheduleWindowsFromData([item]);
            }, delay);

            scheduledWindows.push({ id: item._id, timer });
        } else {
            const showTime = new Date(item.showTime);
            const delay = showTime - now;

            if (delay > 0) {
                console.log(`Scheduling ONCE "${item.title}" in ${delay / 1000}s`);

                const timer = setTimeout(() => {
                    launchWindow(item);
                }, delay);

                scheduledWindows.push({ id: item._id, timer });
            } else {
                console.log(`Skipped "${item.title}" — showTime already passed`);
            }
        }
    });
}

function launchWindow(item) {
    if (item.isForDailyUpdate && (!item.windowLink || item.windowLink.trim() === '')) {
        console.log(`Opening fallback daily update window for "${item.title}"`);
        openDailyUpdateWindow();
    } else {
        openScheduledWindow(item.windowLink, item.title);
    }
}

let isDailyUpdateWindowOpen = false;

function openDailyUpdateWindow() {
    if (isDailyUpdateWindowOpen) return;

    isDailyUpdateWindowOpen = true;

    const win = new BrowserWindow({
        width: 400,
        height: 500,
        alwaysOnTop: true,
        resizable: isForTest,
        autoHideMenuBar: true,
        fullscreen: false,
        closable: false,
        icon: path.join(__dirname, appIcon),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    if(!isForTest) {
        Menu.setApplicationMenu(null);
    }
    // win.webContents.openDevTools();

    const signupUrl = `${webBaseUrl}${dailyReportEndPoint}?user=${loginData?._id}`;
    win.loadURL(signupUrl);

    ipcMain.handle('daily-update-complete', async () => {
        win.close();
    });

    win.on('closed', () => {
        isDailyUpdateWindowOpen = false;
    });
}

function openScheduledWindow(url, title = 'Scheduled Window') {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        title,
        resizable: true,
        autoHideMenuBar: true,
        fullscreen: false,
        alwaysOnTop: true,
        icon: path.join(__dirname, appIcon),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    if(!isForTest) {
        Menu.setApplicationMenu(null);
    }
    // win.webContents.openDevTools();

    win.loadURL(url);
}

ipcMain.on('login-data', (event, data) => {
    loginData = data;
});

ipcMain.on('attendance-data', (event, data) => {
    attendanceData = data;
});

ipcMain.on('office-update-data', (event, data) => {
    scheduleWindowsFromData(data);
});

keyboard.addListener((event) => {
    if (
        attendanceData &&
        attendanceData.isPunchIn === true &&
        attendanceData.isBreakIn === false
    ) {
        if (event.state === "UP") {
            if (event.name.includes("MOUSE")) {
                mouseEventCount = mouseEventCount + 1;
            } else {
                keyboardKeyPressCount = keyboardKeyPressCount + 1;
            }
        }
    }
});

ipcMain.handle('capture-screen', async () => {
    const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1920, height: 1080 },
    });

    const screen = sources[0];

    const imageData = {
        imageUrl: screen.thumbnail.toDataURL(),
        mouseEventCount: mouseEventCount,
        keyboardKeyPressCount: keyboardKeyPressCount,
    };

    mouseEventCount = 0;
    keyboardKeyPressCount = 0;

    return imageData;
});

ipcMain.on('show-screenshot-window', (event, imageDataUrl) => {
    screenshotWindow = new BrowserWindow({
        width: 210,
        height: 170,
        frame: true,
        movable: false,
        show: true,
        resizable: false,
        closable: true,
        titleBarStyle: "hidden",
        transparent: true,
        alwaysOnTop: true,
        fullscreen: false,
        skipTaskbar: true,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    Menu.setApplicationMenu(null);
    // win.webContents.openDevTools();

    const { width } = screen.getPrimaryDisplay().workAreaSize;
    screenshotWindow.setBounds({ x: width - 260, y: 50 });

    const htmlContent = getScreenshotHtml(imageDataUrl);
    screenshotWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent));
});

function getScreenshotHtml(imageDataUrl) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Screenshot Preview</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/feather-icons"></script>
    <style>
        body {
            margin: 0;
            font-family: 'Outfit', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            overflow: hidden;
        }

        .container {
            background: #fff;
            border-radius: 5px;
            border: 1px solid #ddd;
            width: 320px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .header {
            background: #fbfcff;
            padding: 5px 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
            color: #444;
            font-weight: 450;
            border-bottom: 1px solid #ededed;
        }

        .close-btn {
            height: 17px;
            width: 17px;
            cursor: pointer;
            border-radius: 4px;
            transition: background 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .close-btn:hover {
            background: #e0e0e0;
        }

        .close-btn i {
            width: 18px;
            height: 18px;
            color: #888;
        }

        .image-wrapper {
            padding: 5px;
            background: #fff;
            text-align: center;
        }

        .image-wrapper img {
            width: 100%;
            object-fit: contain;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <div class="status">Close after <span id="count">5 s</span></div>
        <div class="close-btn" onclick="window.close()">
            <i data-feather="x"></i>
        </div>
    </div>

    <div class="image-wrapper">
        <img src="${imageDataUrl}" alt="Screenshot Preview"/>
    </div>
</div>

<script>
    let seconds = 5;
    const countEl = document.getElementById('count');
    const interval = setInterval(() => {
        seconds--;
        if (seconds <= 0) {
            clearInterval(interval);
            window.close();
        } else {
            countEl.textContent = seconds + ' s';
        }
    }, 1000);

    feather.replace();
</script>
</body>
</html>
`;
}
