'use client';

import { Button, Card, Col, Progress, Row } from "antd";
import { appColor } from "../../../utils/appColor";
import {
    LogoutOutlined,
    LoginOutlined,
} from "@ant-design/icons";
import appString from "../../../utils/appString";
import { useState, useEffect } from "react";
import { Clock, Coffee, Fingerprint } from "../../../utils/icons";

const STATUS = {
    CLOCKED_OUT: 'CLOCKED_OUT',
    CLOCKED_IN: 'CLOCKED_IN',
    ON_BREAK: 'ON_BREAK',
};

const formatTime = (ms) => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

export default function CardClockInOut() {
    const [status, setStatus] = useState(STATUS.CLOCKED_OUT);
    const [clockInTime, setClockInTime] = useState(null);
    const [breakStartTime, setBreakStartTime] = useState(null);

    const [totalBreakTime, setTotalBreakTime] = useState(0); // Stores completed break durations
    const [, setTicker] = useState(0); // A state to force re-renders every second

    useEffect(() => {
        if (status === STATUS.CLOCKED_OUT) return;

        const timer = setInterval(() => {
            setTicker(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [status]);

    const handleClockIn = () => {
        setStatus(STATUS.CLOCKED_IN);
        setClockInTime(Date.now());
        setTotalBreakTime(0);
    };

    const handleClockOut = () => {
        setStatus(STATUS.CLOCKED_OUT);
    };

    const handleBreakIn = () => {
        setBreakStartTime(Date.now());
        setStatus(STATUS.ON_BREAK);
    };

    const handleBreakOut = () => {
        const breakDuration = Date.now() - breakStartTime;
        setTotalBreakTime(prev => prev + breakDuration);
        setStatus(STATUS.CLOCKED_IN);
    };

    const isClockedIn = status === STATUS.CLOCKED_IN || status === STATUS.ON_BREAK;
    const isOnBreak = status === STATUS.ON_BREAK;

    const totalElapsedMs = isClockedIn ? Date.now() - clockInTime : 0;

    const currentBreakDuration = isOnBreak ? Date.now() - breakStartTime : 0;
    const liveTotalBreakMs = totalBreakTime + currentBreakDuration;

    const liveTotalWorkMs = totalElapsedMs - liveTotalBreakMs;

    const nineHoursInMs = 9 * 60 * 60 * 1000;
    const progressPercent = isClockedIn ? Math.min((liveTotalWorkMs / nineHoursInMs) * 100, 100) : 0;

    return (
        <Card title={(
            <div className="flex items-center gap-2">
                <Clock color={appColor.secondPrimary}/>
                <div className="flex-1 font-[550] text-[15px]">{appString.clockInOut}</div>
                {isClockedIn && (
                    <div className="rounded-md flex items-center gap-[5px]" style={{ backgroundColor: appColor.secondPrimary, padding: "2px 5px" }}>
                        <Fingerprint size={12} color={appColor.white}/>
                        <div className="font-light text-[12px] text-white">
                            {new Date(clockInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
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
                                {formatTime(totalElapsedMs)}
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
                        <div className="font-[550] text-[15px]">{formatTime(liveTotalBreakMs)}</div>
                        <div className="text-[13px] font-medium text-gray-500">{appString.breakTime}</div>
                    </div>
                </div>
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Button className="w-full" color="danger"
                                variant={isOnBreak ? "solid" : "outlined"}
                                disabled={!isClockedIn}
                                icon={<Coffee size={16} />}
                                onClick={isOnBreak ? handleBreakOut : handleBreakIn}>
                            {isOnBreak ? appString.breakOut : appString.breakIn}
                        </Button>
                    </Col>
                    <Col span={12}>
                        <Button className="w-full" color="primary"
                                variant={isClockedIn ? "solid" : "outlined"}
                                disabled={isOnBreak}
                                icon={isClockedIn ? <LogoutOutlined rotate={180}/> : <LoginOutlined/>}
                                onClick={isClockedIn ? handleClockOut : handleClockIn}>
                            {isClockedIn ? appString.clockOut : appString.clockIn}
                        </Button>
                    </Col>
                </Row>
            </div>
        </Card>
    );
}