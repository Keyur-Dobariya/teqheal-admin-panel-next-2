'use client';

import {Avatar, Card} from "antd";
import {getDarkColor} from "../../../utils/appColor";
import appKeys from "../../../utils/appKeys";
import imagePaths from "../../../utils/imagesPath";
import appString from "../../../utils/appString";
import {getLocalData} from "../../../dataStorage/DataPref";
import SafeAvatar from "../../../components/SafeAvatar";
import React from "react";

export default function CardGreeting({loginUserData}) {
    return (
        <Card>
            <div className="flex items-center gap-3 p-4">
                <div className="rounded-full p-[1px] shadow-md"
                     style={{border: `1px solid ${getDarkColor(loginUserData?.userName)}`}}>
                    <SafeAvatar
                        userData={loginUserData}
                        size={50}
                    />
                </div>
                <div className="flex flex-col flex-1 min-w-0 gap-1">
                    <div className="flex items-center text-[17px] font-medium gap-2">
                        <div>{appString.hey}, {loginUserData?.userName} ({loginUserData?.role?.roleName})</div>
                        <img src={imagePaths.heyWaveHand} alt="hey" width={22} height={22}/>
                    </div>
                    <div className="text-[13px] text-gray-500 truncate">{appString.motiveLine}</div>
                </div>
            </div>
        </Card>
    );
}