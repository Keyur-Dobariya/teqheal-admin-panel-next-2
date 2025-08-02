'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getLocalData, isAdmin } from '../dataStorage/DataPref';
import appKeys from '../utils/appKeys';
import pageRoutes from '../utils/pageRoutes';

export const useProtectedRouter = () => {
    const router = useRouter();
    const pathname = usePathname();

    const jwtToken = getLocalData(appKeys.jwtToken);
    const userIsAdmin = isAdmin();

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

    useEffect(() => {
        const isPublic = publicRoutes.includes(pathname);
        const isProtected = protectedRoutes.includes(pathname);
        const isAdminOnly = adminOnlyRoutes.includes(pathname);

        if (!jwtToken && (isProtected || isAdminOnly)) {
            router.push(pageRoutes.loginPage);
        } else if (jwtToken && isAdminOnly && !userIsAdmin) {
            router.push(pageRoutes.dashboard);
        } else if (jwtToken && isPublic) {
            router.push(pageRoutes.dashboard);
        }
    }, [pathname]);

    const push = (targetPath) => {
        const isPublic = publicRoutes.includes(targetPath);
        const isProtected = protectedRoutes.includes(targetPath);
        const isAdminOnly = adminOnlyRoutes.includes(targetPath);

        if (!jwtToken && (isProtected || isAdminOnly)) {
            router.push(pageRoutes.loginPage);
            return;
        }

        if (jwtToken && isAdminOnly && !userIsAdmin) {
            router.push(pageRoutes.dashboard);
            return;
        }

        router.push(targetPath);
    };

    return { push };
};
