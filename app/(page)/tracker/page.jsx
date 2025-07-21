'use client';

import CardTrackerClockInOut from "./CardTrackerClockInOut";
import CardTrackerAppBar from "./CardTrackerAppBar";
import {useEffect, useState} from "react";
import {LoadingComponent} from "../../components/LoadingComponent";

export default function Page() {
    const [userData, setUserData] = useState(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    useEffect(() => {
        const getUserData = async () => {
            const userData = await window.electronAPI.getLoginData();
            console.log("userData=>", userData)
            if (userData?.data) {
                setUserData(userData?.data);
            }
        }

        getUserData();
    }, []);

    if(!userData) {
        return (
            <div className="w-screen h-screen flex justify-center items-center"><LoadingComponent /></div>
        )
    }

    return (
        <div className="flex flex-col h-screen p-4 gap-4">
            <CardTrackerAppBar userData={userData} isUpdateModalOpen={isUpdateModalOpen} setIsUpdateModalOpen={setIsUpdateModalOpen} />
            <div className="flex-1 overflow-auto">
                <CardTrackerClockInOut isUpdateModalOpen={isUpdateModalOpen} setIsUpdateModalOpen={setIsUpdateModalOpen} />
            </div>
        </div>
    );
}