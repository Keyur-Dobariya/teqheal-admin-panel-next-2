'use client';

import { Button, Card, Col, Progress, Row } from "antd";
import { useState, useEffect } from "react";
import { Clock, Coffee, Fingerprint } from "../../utils/icons";
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

    const showDrawer = () => {
        setOpen(true);
    };
    const onClose = () => {
        setOpen(false);
    };

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

        data?.punchTime?.forEach((item, index) => {
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

            // Clock Out (if exists)
            if (item.punchOutTime) {
                timeline.push({
                    color: appColor.secondPrimary,
                    dot: (
                        <CommonTimelineIcon
                            icon={<LogoutOutlined rotate={180} style={{ fontSize: '16px' }} />}
                        />
                    ),
                    children: (
                        <CommonTimelineContent
                            time={dayjs(item.punchOutTime).format('hh:mm A')}
                            content={'Clock Out'}
                            icon={<SmileOutlined />}
                            marginBottom={'0px'}
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
                    dot: (
                        <CommonTimelineIcon icon={<Coffee size={16} />} />
                    ),
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
                    dot: (
                        <CommonTimelineIcon icon={<Coffee size={16} />} />
                    ),
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

        // Optional: sort the timeline by timestamp if needed
        timeline.sort((a, b) => {
            const getTime = (node) =>
                dayjs(
                    node?.children?.props?.time,
                    'hh:mm A'
                ).valueOf();
            return getTime(a) - getTime(b);
        });

        return timeline;
    };

    const timelineData = convertToTimeline(attendanceData, appColor);

    return (
        <Card title={(
            <div className="flex items-center gap-2">
                <Clock color={appColor.secondPrimary}/>
                <div className="flex-1 font-[550] text-[15px]">{appString.clockInOut}<LoadingOutlined className="ml-3" hidden={!isLoading && attendanceData} style={{ color: appColor.secondPrimary }} /></div>
                {attendanceData.punchInAt && (
                    <div className="rounded-md flex items-center gap-[5px]" style={{ backgroundColor: appColor.secondPrimary, padding: "2px 5px" }}>
                        <Fingerprint size={12} color={appColor.white}/>
                        <div className="font-light text-[12px] text-white">
                            {new Date(attendanceData.punchInAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </div>
                    </div>
                )}
            </div>
        )}>
            <div className="flex flex-col gap-6 p-4">
                <Progress
                    className="place-self-center mt-2"
                    percent={progressPercent}
                    type="circle"
                    size={110}
                    strokeWidth={8}
                    strokeColor={isOnBreak ? appColor.danger : appColor.secondPrimary}
                    format={() => (
                        <div className="flex flex-col justify-center items-center gap-2">
                            <div className="font-[550] text-[14px]">
                                {formatTime(totalHoursMs)}
                            </div>
                            <div className="text-[12px] font-medium text-gray-500">{appString.totalTime}</div>
                        </div>
                    )}
                />
                <div className="p-3 flex items-center bg-blue-50/50 border-[1px] rounded-lg border-blue-100">
                    <div className="flex-1 flex flex-col justify-center items-center">
                        <div className="font-[550] text-[15px]">{formatTime(liveTotalWorkMs)}</div>
                        <div className="text-[13px] font-medium text-gray-500">{appString.workingTime}</div>
                    </div>
                    <div className="w-[1px] h-10 bg-blue-100"/>
                    <div className="flex-1 flex flex-col justify-center items-center">
                        <div className="font-[550] text-[15px]">{formatTime(breakHoursMs)}</div>
                        <div className="text-[13px] font-medium text-gray-500">{appString.breakTime}</div>
                    </div>
                </div>
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Button
                            className="w-full"
                            color="danger"
                            variant={isOnBreak ? "solid" : "outlined"}
                            disabled={isLoading && !isClockedIn}
                            icon={<Coffee size={16} />}
                            onClick={handleBreak}
                            loading={isBreakLoading}
                        >
                            {isOnBreak ? appString.breakOut : appString.breakIn}
                        </Button>
                    </Col>
                    <Col span={12}>
                        <Button
                            className="w-full"
                            color="primary"
                            variant={isClockedIn ? "solid" : "outlined"}
                            disabled={isLoading && isOnBreak}
                            icon={isClockedIn ? <LogoutOutlined rotate={180}/> : <LoginOutlined/>}
                            onClick={handlePunch}
                            loading={isClockLoading}
                        >
                            {isClockedIn ? appString.clockOut : appString.clockIn}
                        </Button>
                    </Col>
                </Row>
            </div>
        </Card>
    );
}