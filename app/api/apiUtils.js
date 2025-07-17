import apiCall, {HttpMethod} from "./apiServiceProvider";
import {endpoints} from "./apiEndpoints";

export const deleteScreenShot = async (uId, ssId, setIsLoading, successCallback) => {
    await apiCall({
        method: HttpMethod.DELETE,
        url: `${endpoints.deleteScreenshot}?id=${uId}&ssid=${ssId}`,
        setIsLoading,
        successCallback,
    });
}