'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getLocalData, isAdmin } from '../dataStorage/DataPref';
import appKeys from '../utils/appKeys';
import pageRoutes from '../utils/pageRoutes';

const publicRoutes = [
    '/',
    pageRoutes.loginPage,
    pageRoutes.signupPage,
    pageRoutes.forgotPasswordPage,
];

const adminOnlyRoutes = [
    pageRoutes.employees,
    pageRoutes.todayReport,
    pageRoutes.basicSalary,
    pageRoutes.dailyUpdate,
    pageRoutes.punchReport,
    pageRoutes.application,
    pageRoutes.settings,
];

const protectedRoutes = [
    pageRoutes.dashboard,
    pageRoutes.tracker,
    pageRoutes.employeeDetail,
    pageRoutes.client,
    pageRoutes.project,
    pageRoutes.tasks,
    pageRoutes.leave,
    pageRoutes.leaveReport,
    pageRoutes.salaryReport,
    pageRoutes.calendar,
    pageRoutes.chatting,
    pageRoutes.myProfile,
];

const getRedirectPath = (path, isLoggedIn, isAdminUser) => {
    if (!isLoggedIn && (protectedRoutes.includes(path) || adminOnlyRoutes.includes(path))) {
        return pageRoutes.loginPage;
    }

    if (isLoggedIn && adminOnlyRoutes.includes(path) && !isAdminUser) {
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
