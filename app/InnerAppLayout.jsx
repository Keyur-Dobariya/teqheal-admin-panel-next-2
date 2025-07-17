'use client';

import {Suspense, useEffect, useRef} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import { useAppData } from './masterData/AppDataContext';
import { getLocalData, storeLoginData } from './dataStorage/DataPref';
import appKeys from './utils/appKeys';
import apiCall, { HttpMethod } from './api/apiServiceProvider';
import { endpoints } from './api/apiEndpoints';
import pageRoutes from './utils/pageRoutes';
import {LoadingComponent} from "./components/LoadingComponent";
import {detectPlatform} from "./utils/utils";

export default function InnerAppLayout({ children }) {
    const appDataContext = useAppData();
    const {isLoading, setIsLoading} = useRef(false);
    const router = useRouter();

    const fetchMasterData = async () => {
        try {
            const pathname = usePathname();
            const response = await apiCall({
                method: HttpMethod.GET,
                url: endpoints.getMasterData,
                setIsLoading,
                showSuccessMessage: false,
            });

            if (response?.data) {
                appDataContext.setAllMasterData(response.data);
                storeLoginData(response?.data?.loginUserData, false);

                if(pathname === '/') {
                    const token = getLocalData(appKeys.jwtToken);
                    if (token) {
                        router.push(pageRoutes.dashboard);
                    } else {
                        router.push(pageRoutes.loginPage);
                    }
                } else {
                    router.push(pathname);
                }
            }
        } catch (error) {
            console.error('Failed to fetch master data:', error);
        }
    };

    useEffect(() => {
        const userAgent = navigator.userAgent;
        const detected = detectPlatform(userAgent);

        if(detected.isElectron) {
            router.push(pageRoutes.tracker);
        } else {
            const isLoggedIn = getLocalData(appKeys.isLogin) === 'true';
            if (isLoggedIn) {
                fetchMasterData();
            }
        }
    }, []);

    return children;
}
