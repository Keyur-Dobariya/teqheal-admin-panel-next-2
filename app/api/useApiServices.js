import {useApiCall} from "./useApiCall";
import {endpoints} from "./apiEndpoints";
import {useActionLoading} from "../hooks/useActionLoading";
import apiCall, {HttpMethod} from "./apiServiceProvider";

export function useApiServices() {
    const {apiCall, HttpMethod, isLoading} = useApiCall();
    const {withLoading} = useActionLoading();

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
            successCallback,
        });

    const deleteModule = (id) =>
        apiCall({
            method: HttpMethod.DELETE,
            url: endpoints.deleteModule(id),
        });

    // 🔹 Actions APIs
    const getAllActions = () =>
        apiCall({
            method: HttpMethod.GET,
            url: endpoints.getAllActions,
            showSuccessMessage: false,
        });

    const addUpdateAction = async (id, data, successCallback) =>
        apiCall({
            method: HttpMethod.POST,
            url: endpoints.addUpdateAction(id),
            data,
            successCallback,
        });

    const deleteAction = (id) =>
        apiCall({
            method: HttpMethod.DELETE,
            url: endpoints.deleteAction(id),
        });

    // 🔹 Role-Permissions APIs
    const getRolePermission = () =>
        apiCall({
            method: HttpMethod.GET,
            url: endpoints.getRolePermission,
            showSuccessMessage: false,
        });

    const modifyRolePermission = async (data, successCallback) =>
        apiCall({
            method: HttpMethod.POST,
            url: endpoints.modifyRolePermission,
            data,
            successCallback,
        });

    // 🔹 Companies APIs
    const getAllCompanies = () =>
        apiCall({
            method: HttpMethod.GET,
            url: endpoints.getAllCompanies,
            showSuccessMessage: false,
        });

    const addUpdateCompany = async (id, data, successCallback) =>
        apiCall({
            method: HttpMethod.POST,
            url: endpoints.addUpdateCompany(id),
            isMultipart: true,
            data,
            successCallback,
        });

    const deleteCompany = (id) =>
        apiCall({
            method: HttpMethod.DELETE,
            url: endpoints.deleteCompany(id),
        });

    // 🔹 Roles APIs
    const getAllRoles = () =>
        apiCall({
            method: HttpMethod.GET,
            url: endpoints.getAllRoles,
            showSuccessMessage: false,
        });

    const addUpdateRole = async (id, data, successCallback) =>
        apiCall({
            method: HttpMethod.POST,
            url: endpoints.addUpdateRole(id),
            data,
            successCallback,
        });

    const deleteRole = (id) =>
        apiCall({
            method: HttpMethod.DELETE,
            url: endpoints.deleteRole(id),
        });

    // 🔹 Users APIs
    const getAllUsers = () =>
        apiCall({
            method: HttpMethod.GET,
            url: endpoints.getAllUsers,
            showSuccessMessage: false,
        });

    const addUpdateUser = async (id, data, successCallback) =>
        apiCall({
            method: HttpMethod.POST,
            url: endpoints.addUpdateUser(id),
            isMultipart: true,
            data,
            successCallback,
        });

    const changeUserStatus = async (id, data, successCallback) =>
        apiCall({
            method: HttpMethod.POST,
            url: endpoints.changeUserStatus(id),
            data,
            successCallback,
        });

    const deleteUser = (id) =>
        apiCall({
            method: HttpMethod.DELETE,
            url: endpoints.deleteUser(id),
        });

    // 🔹 Invitation APIs
    const inviteUser = async (data, successCallback) =>
        await apiCall({
            method: HttpMethod.POST,
            url: endpoints.inviteUser,
            data,
            showSuccessMessage: true,
            successCallback,
        });

    return {
        users: {
            getAllUsers,
            addUpdateUser,
            changeUserStatus,
            deleteUser,
        },
        modules: {
            getAllModules,
            addUpdateModule,
            deleteModule,
        },
        actions: {
            getAllActions,
            addUpdateAction,
            deleteAction,
        },
        rolePermission: {
            getRolePermission,
            modifyRolePermission,
        },
        companies: {
            getAllCompanies,
            addUpdateCompany,
            deleteCompany,
        },
        roles: {
            getAllRoles,
            addUpdateRole,
            deleteRole,
        },
        invite: {
            inviteUser,
        },
        isLoading,
    };
}
