const { BrowserWindow, Menu, ipcMain, screen, app} = require('electron');
const path = require('path');
const {electronEndpoints, electronCommon} = require("./electronEndpoints");

let dailyUpdateWindow;
let isDailyUpdateWindowOpen = false;
let isAllowClose = false;

let scheduledWindows = [];

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

function openDailyUpdateWindow() {
    if (isDailyUpdateWindowOpen) return;

    isDailyUpdateWindowOpen = true;

    dailyUpdateWindow = new BrowserWindow({
        width: 400,
        height: 550,
        resizable: electronCommon.isForTest,
        autoHideMenuBar: true,
        fullscreen: false,
        closable: true,
        alwaysOnTop: true,
        icon: path.join(__dirname, electronCommon.appIcon),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    if (!electronCommon.isForTest) {
        Menu.setApplicationMenu(null);
    }

    const signupUrl = electronEndpoints.dailyReportEndPoint;
    dailyUpdateWindow.loadURL(signupUrl);

    dailyUpdateWindow.on('closed', () => {
        isDailyUpdateWindowOpen = false;
        dailyUpdateWindow = null;
    });

    dailyUpdateWindow.on('close', (event) => {
        if (!isAllowClose) {
            event.preventDefault();
        }
    });

}

ipcMain.on('daily-update-complete', (event, data) => {
    isAllowClose = true;
    if (dailyUpdateWindow) {
        dailyUpdateWindow.close();
    }
});

function openScheduledWindow(url, title = 'Scheduled Window') {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        title,
        resizable: true,
        autoHideMenuBar: true,
        fullscreen: false,
        alwaysOnTop: true,
        icon: path.join(__dirname, electronCommon.appIcon),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    if (!electronCommon.isForTest) {
        Menu.setApplicationMenu(null);
    }

    win.loadURL(url);
}

module.exports = { scheduleWindowsFromData };