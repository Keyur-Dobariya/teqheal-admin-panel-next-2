'use client'

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {LoadingComponent} from "./components/LoadingComponent";
import pageRoutes from "./utils/pageRoutes";
import {getLocalData} from "./dataStorage/DataPref";
import appKey from "./utils/appKey";
import {detectPlatform} from "./utils/utils";

export default function Home() {
    // const router = useRouter();

    // useEffect(() => {
    //     const userAgent = navigator.userAgent;
    //     const detected = detectPlatform(userAgent);
    //     const token = getLocalData(appKey.jwtToken);
    //     if (token) {
    //         if(!detected.isElectron) {
    //             router.push(pageRoutes.dashboard);
    //         }
    //     } else {
    //         router.push(pageRoutes.loginPage);
    //     }
    // }, []);

    return (
        <div className="w-full h-full flex justify-center items-center">
            {/*<LoadingComponent />*/}
        </div>
    );
}
