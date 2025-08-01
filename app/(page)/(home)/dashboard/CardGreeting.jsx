'use client';

import {Avatar, Card} from "antd";
import {getDarkColor} from "../../../utils/appColor";
import appKeys from "../../../utils/appKeys";
import imagePaths from "../../../utils/imagesPath";
import appString from "../../../utils/appString";
import {getLocalData} from "../../../dataStorage/DataPref";
import SafeAvatar from "../../../components/SafeAvatar";
import React from "react";

export default function CardGreeting() {
    return (
        <Card>
            <div className="flex items-center gap-3 p-4">
                <div className="rounded-full p-[1px] shadow-md"
                     style={{border: `1px solid ${getDarkColor(getLocalData(appKeys.fullName))}`}}>
                    <SafeAvatar
                        // userData={{
                        //     profilePhoto: getLocalData(appKeys.profilePhoto),
                        //     gender: getLocalData(appKeys.gender),
                        //     fullName: getLocalData(appKeys.fullName),
                        // }}
                        isMyData={true}
                        size={50}
                    />
                </div>
                <div className="flex flex-col flex-1 min-w-0 gap-1">
                    <div className="flex items-center text-[17px] font-medium gap-2">
                        <div>{appString.hey},</div>
                        <div>{getLocalData(appKeys.fullName)}</div>
                        <img src={imagePaths.heyWaveHand} alt="hey" width={22} height={22}/>
                    </div>
                    <div className="text-[13px] text-gray-500 truncate">{appString.motiveLine}</div>
                </div>
            </div>
        </Card>
    );
}