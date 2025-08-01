import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints";

export const addApp = async (data, setIsLoading, successCallback) => {
    await apiCall({
        method: HttpMethod.POST,
        url: `${endpoints.addApp}`,
        data,
        setIsLoading,
        showSuccessMessage: true,
        successCallback
    });
};

export const updateApp = async (id, data, setIsLoading, successCallback) => {
    await apiCall({
        method: HttpMethod.POST,
        url: `${endpoints.updateApp}/${id}`,
        data,
        setIsLoading,
        showSuccessMessage: true,
        successCallback
    });
};

export const addAppVersion = async (id, data, setIsLoading, successCallback) => {
    await apiCall({
        method: HttpMethod.POST,
        url: `${endpoints.addAppVersion}/${id}`,
        data,
        setIsLoading,
        showSuccessMessage: true,
        successCallback
    });
};