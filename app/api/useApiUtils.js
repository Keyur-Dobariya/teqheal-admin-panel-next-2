import { useActionLoading } from "../hooks/useActionLoading";
import apiCall, { HttpMethod } from "./apiServiceProvider";

export function useApiUtils() {
    const { withLoading } = useActionLoading();
    const apiLoading = withLoading("api");

    const runApi = async (action) => {
        try {
            let result;
            await apiLoading.run(async () => {
                result = await action();
            });
            return result;
        } catch (err) {
            throw err;
        }
    };

    const fetchApi = async ({
                                url,
                                onSuccess,
                                showMsg = false,
                            }) => {
        return runApi(() =>
            apiCall({
                method: HttpMethod.GET,
                url,
                showSuccessMessage: showMsg,
                successCallback: onSuccess,
            })
        );
    };

    const addUpdateApi = async ({
                                    url,
                                    data,
                                    onSuccess,
                                    isMultipart = false,
                                    showMsg = true,
                                }) => {
        return runApi(() =>
            apiCall({
                method: HttpMethod.POST,
                url,
                data,
                isMultipart,
                showSuccessMessage: showMsg,
                successCallback: onSuccess,
            })
        );
    };

    const deleteApi = async ({
                                 url,
                                 onSuccess,
                                 showMsg = true,
                             }) => {
        return runApi(() =>
            apiCall({
                method: HttpMethod.DELETE,
                url,
                showSuccessMessage: showMsg,
                successCallback: onSuccess,
            })
        );
    };

    return {
        fetchApi,
        addUpdateApi,
        deleteApi,
        apiLoading
    };
}
