'use client'

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {LoadingComponent} from "./components/LoadingComponent";
import { pageRoutes } from "./utils/pageRoutes";
import {getLocalData, storeLoginData} from "./dataStorage/DataPref";
import appKeys from "./utils/appKeys";
import {detectPlatform} from "./utils/utils";

export default function Home() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const userAgent = navigator.userAgent;
        const detected = detectPlatform(userAgent);
        const redirectToPage = async () => {
            try {
                if (detected.isElectron) {
                    try {
                        const loginData = await window.electronAPI.getLoginData();
                        if(loginData) {
                            storeLoginData(loginData, true);
                        }
                        console.log("loginData=>", loginData);
                        if (loginData && loginData.jwtToken) {
                            router.push(pageRoutes.tracker);
                        } else {
                            router.push(pageRoutes.loginPage);
                        }
                    } catch (error) {
                        console.error("Failed to fetch login data:", error);
                        router.push(pageRoutes.loginPage);
                    }
                } else {
                    const isLogin = getLocalData(appKeys.isLogin);
                    if (isLogin === 'true') {
                        router.push(pageRoutes.dashboard);
                    } else {
                        router.push(pageRoutes.loginPage);
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };

        redirectToPage();
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center w-screen h-screen">
                <LoadingComponent />
            </div>
        );
    }

    return null;
}
