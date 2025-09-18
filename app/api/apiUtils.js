import apiCall, {HttpMethod} from "./apiServiceProvider";
import {endpoints} from "./apiEndpoints";

export const reorderTasksOnServer = async (reorderedTasks) => {
    await apiCall({
        method: HttpMethod.PATCH,
        url: endpoints.taskReorder,
        data: {updates: reorderedTasks},
        setIsLoading: false,
        showSuccessMessage: false,
    });
};