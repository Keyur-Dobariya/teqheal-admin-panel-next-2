const { ipcMain } = require('electron');
const { GlobalKeyboardListener } = require("node-global-key-listener");

const keyboard = new GlobalKeyboardListener();
let attendanceData = {};
let mouseEventCount = 0;
let keyboardKeyPressCount = 0;

function setupActivityTracking() {
    ipcMain.on('attendance-data', (event, data) => {
        attendanceData = data;
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
}

module.exports = { setupActivityTracking, getActivityData: () => ({ mouseEventCount, keyboardKeyPressCount }) };