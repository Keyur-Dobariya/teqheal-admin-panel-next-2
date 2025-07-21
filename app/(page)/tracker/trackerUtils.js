import apiCall, {HttpMethod} from "../../api/apiServiceProvider";
import {endpoints} from "../../api/apiEndpoints";
import appKeys from "../../utils/appKeys";
import {useEffect} from "react";
import {getLocalData} from "../../dataStorage/DataPref";

let timerActive = false;
let randomEventTimeout = null;
let nextCycleTimeout = null;
let screenshotTime = 5;

export const scheduleScreenShot = () => {
    fetchAppSettings((appSettings) => {
        if (appSettings?.isTakeScreenShot) {
            screenshotTime = Number(appSettings?.screenshotTime);

            startTimer(screenshotTime, () => {
                fetchAppSettings((latestSettings) => {
                    if (latestSettings?.isTakeScreenShot) {
                        const newTime = Number(latestSettings?.screenshotTime);

                        if (newTime !== screenshotTime) {
                            console.log("⏱ Screenshot time changed. Restarting timer...");
                            screenshotTime = newTime;
                            stopTimer();
                            scheduleScreenShot();
                        }

                        takeScreenshot(latestSettings?.showScreenShot);
                    } else {
                        stopTimer();
                    }
                }, () => takeScreenshot(false));
            });

        } else {
            stopTimer();
        }
    }, () => takeScreenshot(false));
};

const fetchAppSettings = (onSuccess, onError) => {
    getAppSettingData(
        (res) => onSuccess?.(res?.data?.appSettings),
        onError
    );
};

const takeScreenshot = async (showScreenShot) => {
    const imageData = await window.electronAPI.captureScreen();
    const { imageUrl, mouseEventCount, keyboardKeyPressCount } = imageData;

    const userId = getLocalData(appKeys._id);

    const formData = new FormData();
    formData.append(appKeys.userId, userId);
    formData.append(appKeys.screenshot, imageUrl);
    formData.append(appKeys.keyPressCount, mouseEventCount);
    formData.append(appKeys.mouseEventCount, keyboardKeyPressCount);

    await handleScreenShotUpload(userId, imageUrl, mouseEventCount, keyboardKeyPressCount);

    if (showScreenShot) {
        window.electronAPI.showScreenshotWindow(imageUrl);
    }
};

export function startTimer(intervalMinutes = 5, eventTriggered) {

    if (timerActive) return;

    timerActive = true;

    const scheduleNextEvent = () => {
        if (!timerActive) return;

        const startTime = new Date();
        const endEventTime = new Date(startTime.getTime() + intervalMinutes * 60000);
        const randomTime = new Date(
            startTime.getTime() + Math.random() * (endEventTime.getTime() - startTime.getTime())
        );

        console.log("Start Event:", startTime.toLocaleTimeString("en-IN", { hour12: true }));
        console.log("Random Time:", randomTime.toLocaleTimeString("en-IN", { hour12: true }));
        console.log("End Event:", endEventTime.toLocaleTimeString("en-IN", { hour12: true }));

        randomEventTimeout = setTimeout(async () => {
            if (!timerActive) return;

            console.log("Random Event Triggered at:", new Date().toLocaleTimeString("en-IN", { hour12: true }));
            eventTriggered();
        }, randomTime - startTime);

        nextCycleTimeout = setTimeout(() => {
            if (!timerActive) return;

            console.log("\n--- Starting Next Cycle ---\n");
            scheduleNextEvent();
        }, endEventTime - startTime);
    };

    scheduleNextEvent();
}

export function stopTimer() {
    if (!timerActive) return;

    timerActive = false;
    clearTimeout(randomEventTimeout);
    clearTimeout(nextCycleTimeout);

    console.log("Timer stopped.");
}

export const getAttendanceData = async (userId, setIsLoading, successCallback) => {
    try {
        await apiCall({
            method: HttpMethod.GET,
            url: `${endpoints.getTodayAttendance}/${userId}`,
            showSuccessMessage: false,
            successCallback,
            setIsLoading,
        });
    } catch (error) {
        console.error('Failed to fetch attendance:', error);
    }
};

export const getTodayUpdateApi = async (setIsLoading, successCallback) => {
    try {
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.getTodayUpdate,
            showSuccessMessage: false,
            successCallback,
            setIsLoading,
        });
    } catch (error) {
        console.error('Failed to fetch attendance:', error);
    }
};

export const handlePunchBreak = async (userId, data, setIsLoading, successCallback) => {
    const requestData = {
        userId: userId,
        ...data,
    };
    try {
        await apiCall({
            method: HttpMethod.POST,
            url: endpoints.addAttendance,
            data: requestData,
            showSuccessMessage: false,
            successCallback,
            setIsLoading,
        });
    } catch (error) {
        console.error('Punch in/out failed:', error);
    }
};

export const handleScreenShotUpload = async (userId, imageUrl, mouseEventCount, keyboardKeyPressCount) => {
    const formData = new FormData();

    formData.append(appKeys.userId, userId);
    const blob = base64ToBlob(imageUrl);
    formData.append(appKeys.screenshot, blob, 'screenshot.png');
    formData.append(appKeys.keyPressCount, mouseEventCount);
    formData.append(appKeys.mouseEventCount, keyboardKeyPressCount);

    try {
        await apiCall({
            method: HttpMethod.POST,
            url: endpoints.addAttendance,
            isMultipart: true,
            data: formData,
            showSuccessMessage: false,
            setIsLoading: false,
        });
    } catch (error) {
        console.error('Punch in/out failed:', error);
    }
};

function base64ToBlob(base64Data, contentType = 'image/png') {
    const byteCharacters = atob(base64Data.split(',')[1]);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
}

export const getOfficeUpdateData = async (successCallback) => {
    try {

        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.getOfficeUpdate,
            showSuccessMessage: false,
            successCallback,
            setIsLoading: false,
        });
    } catch (error) {
        console.error('Failed to fetch attendance:', error);
    }
}

export const getAppSettingData = async (successCallback, errorCallback = null) => {
    try {
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.getAppSetting,
            showSuccessMessage: false,
            successCallback,
            errorCallback,
            setIsLoading: false,
        });
    } catch (error) {
        console.error('Failed to fetch attendance:', error);
    }
}

export const liveOfficeUpdateDataStream = async (onOfficeUpdateChange) => {
    const evtSource = new EventSource(endpoints.officeUpdatesStream);

    evtSource.onmessage = async (event) => {
        if (event.data) {
            onOfficeUpdateChange(JSON.parse(event.data));
        }
    };

    evtSource.addEventListener('end', () => {
        evtSource.close();
    });
}

export const liveAppSettingDataStream = async (onSettingDataChange) => {
    const evtAppSettingSource = new EventSource(endpoints.appSettingStream);

    evtAppSettingSource.onmessage = async (event) => {
        if (event.data) {
            const settingData = JSON.parse(event?.data);
            if(settingData?.appSettings) {
                onSettingDataChange(settingData?.appSettings);
            }
        }
    };

    evtAppSettingSource.addEventListener('end', () => {
        evtAppSettingSource.close();
    });
}

export const STATUS = {
    CLOCKED_OUT: 'CLOCKED_OUT',
    CLOCKED_IN: 'CLOCKED_IN',
    ON_BREAK: 'ON_BREAK',
};

export const formatTime = (ms) => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

export const getWorkPercentage = (totalMs) => {
    const nineHoursInMs = 9 * 60 * 60 * 1000;
    return Math.min((totalMs / nineHoursInMs) * 100, 100);
};

export const calculateTotalHours = (punchTime, referenceTime) => {
    return punchTime.reduce((sum, p) => {
        const punchIn = p.punchInTime;
        const punchOut = p.punchOutTime ?? referenceTime;
        return sum + (punchOut - punchIn);
    }, 0);
};

export const calculateBreakHours = (breakTime, referenceTime) => {
    return breakTime.reduce((sum, b) => {
        const breakIn = b.breakInTime;
        const breakOut = b.breakOutTime ?? referenceTime;
        return sum + (breakOut - breakIn);
    }, 0);
};