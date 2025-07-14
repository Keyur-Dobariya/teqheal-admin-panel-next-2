const { BrowserWindow, ipcMain, desktopCapturer, screen } = require('electron');
const path = require('path');
const {getActivityData} = require("./activityTracker");

function setupScreenshotHandling() {
    ipcMain.handle('capture-screen', async () => {
        console.log("capture-screen")
        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: { width: 1920, height: 1080 },
        });

        const screenSource = sources[0];
        const { mouseEventCount, keyboardKeyPressCount } = getActivityData();

        const imageData = {
            imageUrl: screenSource.thumbnail.toDataURL(),
            mouseEventCount: mouseEventCount,
            keyboardKeyPressCount: keyboardKeyPressCount,
        };

        return imageData;
    });

    ipcMain.on('show-screenshot-window', (event, imageDataUrl) => {
        const screenshotWindow = new BrowserWindow({
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

        const { width } = screen.getPrimaryDisplay().workAreaSize;
        screenshotWindow.setBounds({ x: width - 260, y: 50 });

        const htmlContent = getScreenshotHtml(imageDataUrl);
        screenshotWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent));
    });
}

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

module.exports = { setupScreenshotHandling };