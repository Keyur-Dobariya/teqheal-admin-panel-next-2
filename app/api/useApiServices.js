import {useApiCall} from "./useApiCall";
import {endpoints} from "./apiEndpoints";

export function useApiServices() {
    const {apiCall, HttpMethod, isLoading} = useApiCall();

    // 🔹 Module APIs
    const getAllModules = () =>
        apiCall({
            method: HttpMethod.GET,
            url: endpoints.getAllModules,
            showSuccessMessage: false,
        });

    const addUpdateModule = async (id, data, successCallback) =>
        apiCall({
            method: HttpMethod.POST,
            url: endpoints.addUpdateModule(id),
            data,
            showSuccessMessage: true,
            successCallback,
        });

    const deleteModule = (id) =>
        apiCall({
            method: HttpMethod.DELETE,
            url: endpoints.deleteModule(id),
        });

    return {
        modules: {
            getAllModules,
            addUpdateModule,
            deleteModule,
        },
        isLoading,
    };
}
