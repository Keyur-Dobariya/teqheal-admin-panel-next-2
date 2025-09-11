import {useMemo} from "react";
import {useAppData} from "../masterData/AppDataContext";
import {usePathname} from "next/navigation";
import {getKeyFromRoutePath} from "../utils/pageRoutes";

export function usePermission() {
    const {loginUserData} = useAppData();
    const pathname = usePathname();

    const permissionMap = useMemo(() => {
        const map = {};
        if (loginUserData && loginUserData?.modulePermissions.length > 0) {
            loginUserData?.modulePermissions.forEach((item) => {
                const moduleName = item?.moduleId?.moduleName;
                if (!map[moduleName]) {
                    map[moduleName] = new Set(item.permissions.map((p) => p.actionKey));
                }
            });
        }
        // console.log("map=>", map)
        return map;
    }, [loginUserData]);

    function hasPermission(action, module = getKeyFromRoutePath(pathname)) {
        if (!permissionMap[module]) return false;
        return permissionMap[module].has(action);
    }

    function hasAnyPermission(actions = [], module = getKeyFromRoutePath(pathname)) {
        if (!permissionMap[module]) return false;
        return actions.some((a) => permissionMap[module].has(a));
    }

    return {hasPermission, hasAnyPermission};
}
