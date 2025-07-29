'use client';

import {Card, Timeline} from "antd";
import {appColor} from "../../../utils/appColor";
import appString from "../../../utils/appString";
import {Activity} from "../../../utils/icons";
import {convertToTimeline} from "../../../utils/reportTimelineGenerate";
import React from "react";

export default function CardTodayActivity({todayRecords}) {

    const timelineData = convertToTimeline(todayRecords, appColor);

    return (
        <Card title={(
            <div className="flex items-center gap-2">
                <Activity color={appColor.success}/>
                <div className="font-[550] text-[15px]">{appString.todayActivity}</div>
            </div>
        )} styles={{ body: { padding: 0 } }}>
            <div className="h-[300px] overflow-y-auto p-[12px]" style={{scrollbarWidth: "none"}}>
                <Timeline
                    style={{margin: "10px 5px 0 10px"}}
                    items={timelineData}
                />
            </div>
        </Card>
    );
}