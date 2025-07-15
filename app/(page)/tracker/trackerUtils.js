import apiCall, {HttpMethod} from "../../api/apiServiceProvider";
import {endpoints} from "../../api/apiEndpoints";
import appKey from "../../utils/appKey";
import {useEffect} from "react";

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

    formData.append(appKey.userId, userId);
    const blob = base64ToBlob(imageUrl);
    formData.append(appKey.screenshot, blob, 'screenshot.png');
    formData.append(appKey.keyPressCount, mouseEventCount);
    formData.append(appKey.mouseEventCount, keyboardKeyPressCount);

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
            successCallback: async (data) => {
                if(data?.data) {
                    if (window.electronAPI) {
                        await window.electronAPI.sendOfficeUpdateData(data?.data);
                    }
                    successCallback(data?.data);
                }
            },
            setIsLoading: false,
        });
    } catch (error) {
        console.error('Failed to fetch attendance:', error);
    }
}

export const getAppSettingData = async (successCallback) => {
    try {
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.getAppSetting,
            showSuccessMessage: false,
            successCallback: async (data) => {
                if(data?.data?.appSettings) {
                    if (window.electronAPI) {
                        await window.electronAPI.sendSettingData(data?.data?.appSettings);
                    }
                    successCallback(data?.data?.appSettings);
                }
            },
            setIsLoading: false,
        });
    } catch (error) {
        console.error('Failed to fetch attendance:', error);
    }
}

export const liveDataStream = async (onOfficeUpdateChange, onSettingDataChange) => {
    const evtSource = new EventSource(endpoints.officeUpdatesStream);

    evtSource.onmessage = async (event) => {
        if (event.data) {
            if (window.electronAPI) {
                await window.electronAPI.sendOfficeUpdateData(event?.data);
            }
            onOfficeUpdateChange(JSON.parse(event.data));
        }
    };

    evtSource.addEventListener('end', () => {
        evtSource.close();
    });

    const evtAppSettingSource = new EventSource(endpoints.appSettingStream);

    evtAppSettingSource.onmessage = async (event) => {
        if (event.data) {
            const settingData = JSON.parse(event?.data);
            if(settingData?.appSettings) {
                if (window.electronAPI) {
                    await window.electronAPI.sendSettingData(settingData?.appSettings);
                }
                onSettingDataChange(settingData?.appSettings);
            }
        }
    };

    evtAppSettingSource.addEventListener('end', () => {
        evtAppSettingSource.close();
    });
}