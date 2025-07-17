'use client'

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {LoadingComponent} from "./components/LoadingComponent";
import pageRoutes from "./utils/pageRoutes";
import {getLocalData, storeLoginData} from "./dataStorage/DataPref";
import appKeys from "./utils/appKeys";
import {detectPlatform} from "./utils/utils";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const userAgent = navigator.userAgent;
        const detected = detectPlatform(userAgent);
        const redirectToPage = async () => {
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
        };

        redirectToPage();
    }, []);

    return null;
}
