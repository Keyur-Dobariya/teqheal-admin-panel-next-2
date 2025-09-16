import axios from "axios";
import { showToast } from "../components/CommonComponents";
import { pageRoutes } from "../utils/pageRoutes";
import { redirect } from "next/navigation";
import appKeys from "../utils/appKeys";
import { useActionLoading } from "../hooks/useActionLoading";

export function useApiCall() {
    const {withLoading} = useActionLoading();
    const apiLoading = withLoading();

    const apiCall = async ({
                               method,
                               url,
                               data,
                               isMultipart = false,
                               showSuccessMessage = true,
                               showErrorMessage = true,
                               successCallback,
                               errorCallback,
                               headers = {},
                           }) => {

        const token = localStorage.getItem(appKeys.jwtToken) ?? "";
        const defaultHeaders = {
            Authorization: `Bearer ${token}`,
            'Content-Type': isMultipart ? 'multipart/form-data' : 'application/json',
            ...headers,
        };

        return await apiLoading.run(async () => {
            try {
                const response = await axios({
                    method,
                    url,
                    data,
                    headers: defaultHeaders,
                });

                successCallback?.(response.data?.data);

                if (showSuccessMessage) {
                    showToast("success", response.data?.message || "Request was successful");
                }

                return response.data?.data;
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || "Something went wrong";

                errorCallback?.(error.response?.data);

                if (showErrorMessage && error.response?.status !== 403) {
                    showToast("error", errorMessage);
                }

                if (error.response?.status === 403) {
                    redirect(pageRoutes.loginPage);
                }

                console.error("API Call Error:", error);
                throw error;
            }
        });
    };

    const HttpMethod = {
        GET: "GET",
        POST: "POST",
        PUT: "PUT",
        DELETE: "DELETE",
        PATCH: "PATCH",
        HEAD: "HEAD",
        OPTIONS: "OPTIONS",
    };

    return { apiCall, isLoading: apiLoading.loading, HttpMethod };
}