'use client';

import { useState, useEffect } from 'react';
import { getLocalData, isAdmin } from '../dataStorage/DataPref';
import appKeys from '../utils/appKeys';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const token = getLocalData(appKeys.jwtToken);
            const userData = {
                token,
                fullName: getLocalData(appKeys.fullName),
                email: getLocalData(appKeys.emailAddress),
                role: getLocalData(appKeys.role),
                isAdmin: isAdmin(),
            };

            setUser(token ? userData : null);
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const logout = () => {
        localStorage.clear();
        setUser(null);
        window.location.href = '/login';
    };

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
        logout,
    };
};

export default useAuth;