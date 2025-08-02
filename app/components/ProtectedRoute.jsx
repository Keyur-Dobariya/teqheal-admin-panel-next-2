'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLocalData, isAdmin } from '../dataStorage/DataPref';
import appKeys from '../utils/appKeys';
import pageRoutes from '../utils/pageRoutes';
import { LoadingComponent } from './LoadingComponent';

const ProtectedRoute = ({ children, adminOnly = false, redirectTo = null }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            // Check if user is logged in
            const token = getLocalData(appKeys.token);
            const userRole = getLocalData(appKeys.role);
            
            if (!token) {
                // Not logged in, redirect to login
                router.push(pageRoutes.loginPage);
                return;
            }

            // Check admin access if required
            if (adminOnly && !isAdmin()) {
                // Not admin, redirect to dashboard or specified route
                router.push(redirectTo || pageRoutes.dashboard);
                return;
            }

            // User is authorized
            setIsAuthorized(true);
            setIsLoading(false);
        };

        checkAuth();
    }, [router, adminOnly, redirectTo]);

    if (isLoading) {
        return (
            <div className="w-screen h-screen flex justify-center items-center">
                <LoadingComponent />
            </div>
        );
    }

    if (!isAuthorized) {
        return null; // Will redirect, so don't render anything
    }

    return children;
};

export default ProtectedRoute;