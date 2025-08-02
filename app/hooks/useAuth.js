'use client';

import { useState, useEffect } from 'react';
import { getLocalData, isAdmin } from '../dataStorage/DataPref';
import appKeys from '../utils/appKeys';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkAuth = () => {
            try {
                const token = getLocalData(appKeys.jwtToken);
                const userData = {
                    token,
                    fullName: getLocalData(appKeys.fullName),
                    email: getLocalData(appKeys.emailAddress),
                    role: getLocalData(appKeys.role),
                    isAdmin: isAdmin(),
                };

                setUser(token ? userData : null);
            } catch (error) {
                console.error('Auth check failed:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        if (mounted) {
            checkAuth();
        }
    }, [mounted]);

    const logout = () => {
        localStorage.clear();
        setUser(null);
        window.location.href = '/login';
    };

    return {
        user,
        isLoading: isLoading || !mounted,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
        logout,
    };
};

export default useAuth;