'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getLocalData, isAdmin } from '../dataStorage/DataPref';
import appKeys from '../utils/appKeys';
import {adminRoutes, pageRoutes, protectedRoutes, publicRoutes} from '../utils/pageRoutes';

const getRedirectPath = (path, isLoggedIn, isAdminUser) => {
    if (!isLoggedIn && (protectedRoutes.includes(path) || adminRoutes.includes(path))) {
        return pageRoutes.loginPage;
    }

    if (isLoggedIn && adminRoutes.includes(path) && !isAdminUser) {
        return pageRoutes.dashboard;
    }

    if (isLoggedIn && publicRoutes.includes(path)) {
        return pageRoutes.dashboard;
    }

    return null;
};

export const useProtectedRouter = () => {
    const router = useRouter();
    const pathname = usePathname();

    const jwtToken = getLocalData(appKeys.jwtToken);
    const isLoggedIn = Boolean(jwtToken);
    const userIsAdmin = isAdmin();

    useEffect(() => {
        const redirectPath = getRedirectPath(pathname, isLoggedIn, userIsAdmin);
        if (redirectPath && redirectPath !== pathname) {
            router.push(redirectPath);
        }
    }, [pathname]);

    const push = (targetPath) => {
        const redirectPath = getRedirectPath(targetPath, isLoggedIn, userIsAdmin);
        router.push(redirectPath || targetPath);
    };

    return { push };
};
