import { useMemo } from "react";
import {useAppData} from "../masterData/AppDataContext";

export function useModulePermissions() {
    const { loginUserData } = useAppData();

    const currentPath = useMemo(() => {
        return window.location.pathname.toLowerCase();
    }, []);

    const findMatchedModule = (modulePath = currentPath) => {
        if (!loginUserData?.modulePermissions) return null;

        return loginUserData.modulePermissions.find(mod => {
            const moduleName = (typeof mod.moduleName === "string")
                ? mod.moduleName.toLowerCase()
                : mod.moduleId?.moduleName?.toLowerCase() || "";
            console.log("moduleName=>", moduleName, modulePath)
            // return !mod.isForSuperAdmin && moduleName.includes(modulePath);
            return moduleName.includes(modulePath);
        });
    };

    const hasModulePermission = (modulePath) => {
        return !!findMatchedModule(modulePath);
    };

    const hasActionPermission = (permissionAction, byName = true) => {
        const matchedModule = findMatchedModule();
        if (!matchedModule) return false;

        if (!Array.isArray(matchedModule.permissions)) return false;

        return matchedModule.permissions.some(permission => {
            if (byName) {
                const actionName = (typeof permission === 'string') ? null : permission.actionName;
                return actionName === permissionAction;
            } else {
                const actionId = (typeof permission === 'string') ? permission : permission._id;
                return actionId === permissionAction;
            }
        });
    };

    return {
        hasModulePermission,
        hasActionPermission,
    };
}
