'use client';

import {Button, Card, Col, Drawer, Progress, Row, Timeline} from "antd";
import React from "react";
import {Activity, Clock, Coffee, Fingerprint} from "../../utils/icons";
import { appColor } from "../../utils/appColor";
import appString from "../../utils/appString";
import {getLocalData} from "../../dataStorage/DataPref";
import appKey from "../../utils/appKey";
import {LoadingOutlined, LoginOutlined, LogoutOutlined, SmileOutlined} from "@ant-design/icons";
import {getAttendanceData, handlePunchBreak, handleScreenShotUpload} from "./trackerUtils";
import {endpoints} from "../../api/apiEndpoints";
import apiCall, {HttpMethod} from "../../api/apiServiceProvider";
import dayjs from "dayjs";

export default function CardTimeLineDrawer({isDrawerOpen, setIsDrawerOpen, attendanceData}) {

    const CommonTimelineIcon = ({icon}) => {
        return (
            <div
                className="flex mt-1 p-1 items-center justify-center rounded-full border-[1px] border-gray-200 bg-white">
                {icon}
            </div>
        );
    };

    const CommonTimelineContent = ({time, content, icon, marginBottom}) => {
        return (
            <div
                className="flex py-[6px] px-[10px] items-center justify-between rounded-lg border-[1px] border-gray-200 bg-gray-50/50"
                style={{marginBottom: marginBottom || "15px"}}>
                <div className="flex flex-col">
                    <div className="text-gray-900 text-[13px] font-medium">{time}</div>
                    <div className="text-gray-500 text-[12px]">{content}</div>
                </div>
                {icon}
            </div>
        );
    };

    const convertToTimeline = (data, appColor) => {
        const timeline = [];

        data?.punchTime?.forEach((item) => {
            // Clock In
            if (item.punchInTime) {
                timeline.push({
                    color: appColor.secondPrimary,
                    dot: (
                        <CommonTimelineIcon icon={<LoginOutlined style={{ fontSize: '16px' }} />} />
                    ),
                    children: (
                        <CommonTimelineContent
                            time={dayjs(item.punchInTime).format('hh:mm A')}
                            content={'Clock In'}
                            icon={<SmileOutlined />}
                        />
                    ),
                });
            }

            // Clock Out
            if (item.punchOutTime) {
                timeline.push({
                    color: appColor.secondPrimary,
                    dot: (
                        <CommonTimelineIcon icon={<LogoutOutlined rotate={180} style={{ fontSize: '16px' }} />} />
                    ),
                    children: (
                        <CommonTimelineContent
                            time={dayjs(item.punchOutTime).format('hh:mm A')}
                            content={'Clock Out'}
                            icon={<SmileOutlined />}
                        />
                    ),
                });
            }
        });

        data?.breakTime?.forEach((item) => {
            // Break In
            if (item.breakInTime) {
                timeline.push({
                    color: appColor.danger,
                    dot: <CommonTimelineIcon icon={<Coffee size={16} />} />,
                    children: (
                        <CommonTimelineContent
                            time={dayjs(item.breakInTime).format('hh:mm A')}
                            content={'Break In'}
                            icon={<SmileOutlined />}
                        />
                    ),
                });
            }

            // Break Out
            if (item.breakOutTime) {
                timeline.push({
                    color: appColor.danger,
                    dot: <CommonTimelineIcon icon={<Coffee size={16} />} />,
                    children: (
                        <CommonTimelineContent
                            time={dayjs(item.breakOutTime).format('hh:mm A')}
                            content={'Break Out'}
                            icon={<SmileOutlined />}
                        />
                    ),
                });
            }
        });

        // Sort timeline items by time
        timeline.sort((a, b) => {
            const getTime = (node) =>
                dayjs(node?.children?.props?.time, 'hh:mm A').valueOf();
            return getTime(a) - getTime(b);
        });

        // Set marginBottom: '0px' for the last item only
        if (timeline.length > 0) {
            const last = timeline.length - 1;
            const lastItem = timeline[last];
            timeline[last] = {
                ...lastItem,
                children: React.cloneElement(lastItem.children, {
                    marginBottom: '0px'
                }),
            };
        }

        return timeline;
    };

    const timelineData = convertToTimeline(attendanceData, appColor);

    console.log("timelineData=>", timelineData)

    return (
        <Drawer
            title="Today Report"
            closable={{ 'aria-label': 'Close Button' }}
            onClose={() => setIsDrawerOpen(false)}
            open={isDrawerOpen}
        >
            <Card title={(
                <div className="flex items-center gap-2">
                    <Activity color={appColor.success}/>
                    <div className="font-[550] text-[15px]">{appString.todayActivity}</div>
                </div>
            )} styles={{ body: { padding: 0 } }}>
                <div className="h-[310px] overflow-y-auto p-[12px]" style={{ scrollbarWidth: "none" }}>
                    <Timeline
                        style={{margin: "10px 5px 0 10px"}}
                        items={timelineData}
                    />
                </div>
            </Card>
        </Drawer>
    );
}