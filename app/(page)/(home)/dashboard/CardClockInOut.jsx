'use client';

import {Card, Progress} from "antd";
import {useState, useEffect} from "react";
import {Clock, Fingerprint} from "../../../utils/icons";
import {appColor} from "../../../utils/appColor";
import appString from "../../../utils/appString";
import {
    formatTime,
    getWorkPercentage,
    calculateTotalHours,
    calculateBreakHours,
} from "../../tracker/trackerUtils";
import {format} from "date-fns";

export default function CardClockInOut({todayRecords}) {
    const [attendanceData, setAttendanceData] = useState({
        punchTime: [],
        breakTime: [],
        isPunchIn: false,
        isBreakIn: false,
        lastPunchInTime: null,
        lastBreakInTime: null,
        punchInAt: null,
    });

    const [totalHoursMs, setTotalHoursMs] = useState(0);
    const [breakHoursMs, setBreakHoursMs] = useState(0);
    const [, setTicker] = useState(0);
    const currentDateFormat = "hh:mm a - MMM dd, yyyy";
    const [currentDateTime, setCurrentDateTime] = useState(null);

    const setApiData = (newAttendanceData) => {
        setAttendanceData(newAttendanceData);
        const referenceTime = Date.now();
        setTotalHoursMs(calculateTotalHours(newAttendanceData.punchTime || [], referenceTime));
        setBreakHoursMs(calculateBreakHours(newAttendanceData.breakTime || [], referenceTime));
    }

    useEffect(() => {
        if(todayRecords !== null) {
            setApiData(todayRecords || {});
        }
    }, [todayRecords]);

    useEffect(() => {
        if (!attendanceData.isPunchIn) return;

        const timer = setInterval(() => {
            setCurrentDateTime(format(Date.now(), currentDateFormat));
            setTicker(prev => prev + 1);

            const referenceTime = Date.now();
            if (attendanceData.isPunchIn) {
                setTotalHoursMs(calculateTotalHours(attendanceData.punchTime || [], referenceTime));
            }
            if (attendanceData.isBreakIn) {
                setBreakHoursMs(calculateBreakHours(attendanceData.breakTime || [], referenceTime));
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [attendanceData.isPunchIn, attendanceData.isBreakIn, attendanceData.punchTime, attendanceData.breakTime]);

    const liveTotalWorkMs = totalHoursMs - breakHoursMs;
    const progressPercent = getWorkPercentage(liveTotalWorkMs);

    return (
        <>
            <Card
                title={(
                    <div className="flex items-center gap-2">
                        <Clock color={appColor.secondPrimary}/>
                        <div className="flex-1 font-[550] text-[15px]">{appString.clockInOut}</div>
                        {attendanceData.punchInAt && (
                            <div className="rounded-md flex items-center gap-[5px]"
                                 style={{backgroundColor: appColor.secondPrimary, padding: "2px 5px"}}>
                                <Fingerprint size={12} color={appColor.white}/>
                                <div className="font-light text-[12px] text-white">
                                    {new Date(attendanceData.punchInAt).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}>
                <div className={`flex justify-between flex-col gap-6 p-4 h-[300px]`}>
                    <div className="text-center font-medium text-[15px]">{currentDateTime}</div>
                    <Progress
                        className="place-self-center mt-2"
                        percent={progressPercent}
                        type="circle"
                        size={110}
                        strokeWidth={8}
                        strokeColor={attendanceData.isBreakIn ? appColor.danger : appColor.secondPrimary}
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
                </div>
            </Card>
        </>
    );
}