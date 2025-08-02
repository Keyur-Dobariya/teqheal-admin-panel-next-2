'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getLocalData, isAdmin } from '../dataStorage/DataPref';
import appKeys from '../utils/appKeys';
import pageRoutes from '../utils/pageRoutes';
import { isAdminRoute, isPublicRoute, isProtectedRoute } from '../utils/routeConfig';
import { LoadingComponent } from './LoadingComponent';

const RouteGuard = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    console.log('RouteGuard mounted for path:', pathname);

    useEffect(() => {
        const checkRouteAccess = () => {
            const token = getLocalData(appKeys.token);
            const isLogin = getLocalData(appKeys.isLogin);
            const userIsAdmin = isAdmin();

            console.log('RouteGuard Check:', { 
                pathname, 
                token: !!token, 
                isLogin, 
                userIsAdmin,
                isPublic: isPublicRoute(pathname),
                isAdminRoute: isAdminRoute(pathname)
            });

            // Allow public routes without authentication
            if (isPublicRoute(pathname)) {
                // If already logged in and trying to access auth pages, redirect to dashboard
                if ((token || isLogin === 'true') && (pathname === pageRoutes.loginPage || pathname === pageRoutes.signupPage)) {
                    router.push(pageRoutes.dashboard);
                    return;
                }
                setIsAuthorized(true);
                setIsLoading(false);
                return;
            }

            // For protected routes, let the nested layout handle authentication
            // Just check admin access here
            if (isAdminRoute(pathname) && token && isLogin === 'true' && !userIsAdmin) {
                console.log('Admin route but user is not admin, redirecting to dashboard');
                router.push(pageRoutes.dashboard);
                return;
            }

            // Allow access (authentication will be checked by nested layout)
            setIsAuthorized(true);
            setIsLoading(false);
        };

        checkRouteAccess();
    }, [pathname, router]);

    if (isLoading) {
        return (
            <div className="w-full h-screen flex justify-center items-center">
                <LoadingComponent />
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return children;
};

export default RouteGuard;