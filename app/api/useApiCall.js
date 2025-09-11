import axios from "axios";
import { showToast } from "../components/CommonComponents";
import { pageRoutes } from "../utils/pageRoutes";
import { redirect } from "next/navigation";
import appKeys from "../utils/appKeys";
import { useActionLoading } from "../hooks/useActionLoading";

export function useApiCall() {
    const { runWithLoading, isLoading } = useActionLoading();

    const apiCall = async ({
                               method = httpMethode.GET,
                               url,
                               data,
                               isMultipart = false,
                               showSuccessMessage = true,
                               showErrorMessage = true,
                               successCallback,
                               errorCallback,
                               headers = {},
                           }) => {

        return runWithLoading(url, async () => {
            const token =
                typeof window !== "undefined"
                    ? localStorage.getItem(appKeys.jwtToken) ?? ""
                    : "";

            const defaultHeaders = {
                Authorization: token ? `Bearer ${token}` : "",
                "Content-Type": isMultipart ? "multipart/form-data" : "application/json",
                ...headers,
            };

            try {
                const response = await axios({
                    method,
                    url,
                    data,
                    headers: defaultHeaders,
                });

                successCallback?.(response.data);

                if (showSuccessMessage) {
                    showToast("success", response.data?.message || "Request successful");
                }

                return response.data;
            } catch (error) {
                const errorMessage =
                    error.response?.data?.message ||
                    error.message ||
                    "Something went wrong";

                errorCallback?.(error.response?.data);

                if (showErrorMessage && error.response?.status !== 403) {
                    showToast("error", errorMessage);
                }

                if (error.response?.status === 403) {
                    redirect(pageRoutes.loginPage);
                }

                console.error("API Call Error:", errorMessage, error);
                throw error;
            }
        });
    };

    const httpMethode = {
        GET: "GET",
        POST: "POST",
        PUT: "PUT",
        DELETE: "DELETE",
        PATCH: "PATCH",
        HEAD: "HEAD",
        OPTIONS: "OPTIONS",
    };

    return { apiCall, isLoading, httpMethode };
}