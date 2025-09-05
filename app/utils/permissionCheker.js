export function hasModulePermission(modulePermissions, permissionAction, byName = true) {
    if (!Array.isArray(modulePermissions) || !permissionAction) {
        return false;
    }

    const currentPath = window.location.pathname.toLowerCase();

    const matchedModule = modulePermissions.find(mod => {
        const moduleName = (typeof mod.moduleName === "string")
            ? mod.moduleName.toLowerCase()
            : mod.moduleId?.moduleName?.toLowerCase() || "";
        return moduleName.includes(currentPath);
    });

    return !!matchedModule;
}

export function hasActionPermission(modulePermissions, permissionAction, byName = true) {
    if (!Array.isArray(modulePermissions) || !permissionAction) {
        return false;
    }

    // Find module whose moduleName includes current pathname
    const currentPath = window.location.pathname.toLowerCase();

    // Try find module where moduleName includes current path segment
    const matchedModule = modulePermissions.find(mod => {
        const moduleName = (typeof mod.moduleName === "string")
            ? mod.moduleName.toLowerCase()
            : mod.moduleId?.moduleName?.toLowerCase() || "";
        return moduleName.includes(currentPath);
    });

    if (!matchedModule) {
        // No matching module found, no permission
        return false;
    }

    // Get resolved moduleId string (could be string or object with _id)
    const moduleId = (typeof matchedModule.moduleId === "string") ? matchedModule.moduleId : matchedModule.moduleId?._id;

    if (!Array.isArray(matchedModule.permissions)) {
        return false;
    }

    return matchedModule.permissions.some(permission => {
        if (byName) {
            const actionName = (typeof permission === 'string') ? null : permission.actionName;
            return actionName === permissionAction;
        } else {
            const actionId = (typeof permission === 'string') ? permission : permission._id;
            return actionId === permissionAction;
        }
    });
}