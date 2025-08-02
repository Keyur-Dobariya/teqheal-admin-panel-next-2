'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getLocalData } from '../dataStorage/DataPref';
import appKeys from '../utils/appKeys';
import pageRoutes from '../utils/pageRoutes';

const AuthWrapper = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        console.log('AuthWrapper: Checking route:', pathname);
        
        // Define public routes that don't need authentication
        const publicRoutes = ['/', '/login', '/signup', '/forgot-password'];
        
        // Check if current route is public
        const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));
        
        console.log('AuthWrapper: Is public route?', isPublicRoute);
        
        if (!isPublicRoute) {
            // Check authentication
            const token = getLocalData(appKeys.jwtToken);
            const isLogin = getLocalData(appKeys.isLogin);
            
            console.log('AuthWrapper: Auth check:', { 
                pathname, 
                token: !!token, 
                tokenValue: token?.substring(0, 20) + '...', 
                isLogin,
                localStorage: Object.keys(localStorage)
            });
            
            if (!token && isLogin !== 'true') {
                console.log('AuthWrapper: No authentication found, redirecting to login');
                router.replace(pageRoutes.loginPage);
                return;
            } else {
                console.log('AuthWrapper: Authentication found, allowing access');
            }
        } else {
            console.log('AuthWrapper: Public route, allowing access');
        }
        
        setIsChecking(false);
    }, [pathname, router]);

    // Show loading while checking
    if (isChecking) {
        return <div>Checking authentication...</div>;
    }

    return children;
};

export default AuthWrapper;