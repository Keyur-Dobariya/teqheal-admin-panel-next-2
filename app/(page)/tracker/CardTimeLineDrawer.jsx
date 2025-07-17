'use client';

import {Card, Drawer, Timeline} from "antd";
import React from "react";
import {Activity} from "../../utils/icons";
import {appColor} from "../../utils/appColor";
import appString from "../../utils/appString";
import {convertToTimeline} from "../../utils/reportTimelineGenerate";

export default function CardTimeLineDrawer({isDrawerOpen, setIsDrawerOpen, attendanceData}) {

    const timelineData = convertToTimeline(attendanceData, appColor);

    return (
        <Drawer
            title={appString.todayReport}
            onClose={() => setIsDrawerOpen(false)}
            open={isDrawerOpen}
        >
            <Card
                title={(
                    <div className="flex items-center gap-2">
                        <Activity color={appColor.success}/>
                        <div className="font-[550] text-[15px]">{appString.todayActivity}</div>
                    </div>
                )}
                styles={{body: {padding: 0}}}>
                <div className="h-[310px] overflow-y-auto p-[12px]" style={{scrollbarWidth: "none"}}>
                    <Timeline
                        style={{margin: "10px 5px 0 10px"}}
                        items={timelineData}
                    />
                </div>
            </Card>
        </Drawer>
    );
}