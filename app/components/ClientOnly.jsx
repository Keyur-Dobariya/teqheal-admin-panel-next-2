'use client';

import {useEffect, useRef, useState} from 'react';
import {getLocalData, storeLoginData} from "../dataStorage/DataPref";
import appKeys from "../utils/appKeys";
import apiCall, {HttpMethod} from "../api/apiServiceProvider";
import {endpoints} from "../api/apiEndpoints";
import {useAppData} from "../masterData/AppDataContext";

export default function ClientOnly({children, fallback = null}) {
    const appDataContext = useAppData();
    const [hasMounted, setHasMounted] = useState(false);
    const isApiCalledRef = useRef(false);

    useEffect(() => {
        if (getLocalData(appKeys.jwtToken) !== null) {
            if (!isApiCalledRef.current) {
                isApiCalledRef.current = true;
                fetchMasterData().then(() => setHasMounted(true));
            } else {
                setHasMounted(true);
            }
        } else {
            setHasMounted(true);
        }
    }, []);

    const fetchMasterData = async () => {
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.getMasterData,
            setIsLoading: setHasMounted,
            successCallback: (data) => {
                if(data?.data) {
                    appDataContext.setAllMasterData(data.data);
                    storeLoginData(data?.data?.loginUserData, false);
                    setHasMounted(true);
                } else {
                    setHasMounted(true);
                }
            },
            errorCallback: () => {
                setHasMounted(true);
            },
            showSuccessMessage: false,
        });
    };

    if (hasMounted && getLocalData(appKeys.jwtToken) !== null) {
        return children;
    }

    return fallback;
}