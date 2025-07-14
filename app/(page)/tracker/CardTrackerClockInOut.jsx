'use client';

import {Button, Card, Col, Progress, Row, Tooltip} from "antd";
import {useState, useEffect} from "react";
import {Clock, Coffee, Fingerprint, Info} from "../../utils/icons";
import {appColor} from "../../utils/appColor";
import appString from "../../utils/appString";
import {getLocalData} from "../../dataStorage/DataPref";
import appKey from "../../utils/appKey";
import {LoadingOutlined, LoginOutlined, LogoutOutlined, SmileOutlined} from "@ant-design/icons";
import {getAttendanceData, handlePunchBreak, handleScreenShotUpload} from "./trackerUtils";
import {endpoints} from "../../api/apiEndpoints";
import apiCall, {HttpMethod} from "../../api/apiServiceProvider";
import dayjs from "dayjs";

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

const getWorkPercentage = (totalMs) => {
    const nineHoursInMs = 9 * 60 * 60 * 1000;
    return Math.min((totalMs / nineHoursInMs) * 100, 100);
};

const calculateTotalHours = (punchTime, referenceTime) => {
    return punchTime.reduce((sum, p) => {
        const punchIn = p.punchInTime;
        const punchOut = p.punchOutTime ?? referenceTime;
        return sum + (punchOut - punchIn);
    }, 0);
};

const calculateBreakHours = (breakTime, referenceTime) => {
    return breakTime.reduce((sum, b) => {
        const breakIn = b.breakInTime;
        const breakOut = b.breakOutTime ?? referenceTime;
        return sum + (breakOut - breakIn);
    }, 0);
};

export default function CardTrackerClockInOut() {
    const [status, setStatus] = useState(STATUS.CLOCKED_OUT);
    const [attendanceData, setAttendanceData] = useState({
        punchTime: [],
        breakTime: [],
        isPunchIn: false,
        isBreakIn: false,
        lastPunchInTime: null,
        lastBreakInTime: null,
        punchInAt: null,
    });
    const [appSettingData, setAppSettingData] = useState(null);
    const [officeUpdates, setOfficeUpdates] = useState([]);
    const [totalHoursMs, setTotalHoursMs] = useState(0);
    const [breakHoursMs, setBreakHoursMs] = useState(0);
    const [isClockLoading, setIsClockLoading] = useState(false);
    const [isBreakLoading, setIsBreakLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [, setTicker] = useState(0);

    useEffect(() => {
        sendOfficeUpdateToExe(officeUpdates);
    }, [officeUpdates]);

    const sendOfficeUpdateToExe = async (data) => {
        if (window.electronAPI) {
            await window.electronAPI.sendOfficeUpdateData(data);
        }
    }

    const getOfficeUpdateData = async () => {
        try {

            await apiCall({
                method: HttpMethod.GET,
                url: endpoints.getOfficeUpdate,
                showSuccessMessage: false,
                successCallback: (data) => {
                    setOfficeUpdates(data.data);
                },
                setIsLoading,
            });
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        }
    }

    const getAppSettingData = async () => {
        try {
            await apiCall({
                method: HttpMethod.GET,
                url: endpoints.getAppSetting,
                showSuccessMessage: false,
                successCallback: (data) => {
                    console.log('Fetched App Setting:', data?.data?.appSettings);
                    setAppSettingData(data?.data?.appSettings);
                },
                setIsLoading,
            });
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        }
    }

    useEffect(() => {
        getOfficeUpdateData();
        getAppSettingData();

        const evtSource = new EventSource(endpoints.officeUpdatesStream);

        evtSource.onmessage = async (event) => {
            if (event.data) {
                setOfficeUpdates(JSON.parse(event.data));
            }
        };

        evtSource.addEventListener('end', () => {
            console.log('Stream ended');
            evtSource.close();
        });

        const evtAppSettingSource = new EventSource(endpoints.appSettingStream);

        evtAppSettingSource.onmessage = async (event) => {
            if (event.data) {
                const appSetting = JSON.parse(event?.data?.appSettings);
                if(appSetting) {
                    setAppSettingData({
                        showScreenShot: appSetting?.showScreenShot,
                        isTakeScreenShot: appSetting?.isTakeScreenShot,
                        screenshotTime: appSetting?.screenshotTime,
                    });
                }
            }
        };

        evtAppSettingSource.addEventListener('end', () => {
            console.log('Stream ended');
            evtAppSettingSource.close();
        });
    }, []);

    const fetchAttendanceData = async () => {
        await getAttendanceData(getLocalData(appKey._id), setIsLoading, (data) => {
            const newAttendanceData = data.data || {};
            setAttendanceData(newAttendanceData);
            setStatus(
                newAttendanceData.isBreakIn
                    ? STATUS.ON_BREAK
                    : newAttendanceData.isPunchIn
                        ? STATUS.CLOCKED_IN
                        : STATUS.CLOCKED_OUT
            );
            const referenceTime = Date.now();
            setTotalHoursMs(calculateTotalHours(newAttendanceData.punchTime || [], referenceTime));
            setBreakHoursMs(calculateBreakHours(newAttendanceData.breakTime || [], referenceTime));
        });
    };

    useEffect(() => {
        sendDataToExe(attendanceData);
    }, [attendanceData]);

    const sendDataToExe = async (data) => {
        if (window.electronAPI) {
            await window.electronAPI.sendAttendanceData(data);
        }
    }

    useEffect(() => {
        fetchAttendanceData();
    }, []);

    useEffect(() => {
        if (status === STATUS.CLOCKED_OUT && !attendanceData.isPunchIn) return;

        const timer = setInterval(() => {
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
    }, [status, attendanceData.isPunchIn, attendanceData.isBreakIn, attendanceData.punchTime, attendanceData.breakTime]);

    const handlePunch = async () => {
        const postData = attendanceData.isPunchIn
            ? {punchOutTime: Date.now()}
            : {punchInTime: Date.now()};

        await handlePunchBreak(getLocalData(appKey._id), postData, setIsClockLoading, (data) => {
            const newAttendanceData = data.data;
            setAttendanceData(newAttendanceData);
            setStatus(newAttendanceData.isPunchIn ? STATUS.CLOCKED_IN : STATUS.CLOCKED_OUT);
            const referenceTime = Date.now();
            setTotalHoursMs(calculateTotalHours(newAttendanceData.punchTime || [], referenceTime));
            setBreakHoursMs(calculateBreakHours(newAttendanceData.breakTime || [], referenceTime));
        });
    };

    const handleBreak = async () => {
        const postData = attendanceData.isBreakIn
            ? {breakOutTime: Date.now()}
            : {breakInTime: Date.now()};

        await handlePunchBreak(getLocalData(appKey._id), postData, setIsBreakLoading, (data) => {
            const newAttendanceData = data.data;
            setAttendanceData(newAttendanceData);
            setStatus(newAttendanceData.isBreakIn ? STATUS.ON_BREAK : STATUS.CLOCKED_IN);
            const referenceTime = Date.now();
            setTotalHoursMs(calculateTotalHours(newAttendanceData.punchTime || [], referenceTime));
            setBreakHoursMs(calculateBreakHours(newAttendanceData.breakTime || [], referenceTime));
        });
    };

    const isClockedIn = status === STATUS.CLOCKED_IN || status === STATUS.ON_BREAK;

    const isOnBreak = status === STATUS.ON_BREAK;
    const liveTotalWorkMs = totalHoursMs - breakHoursMs;
    const progressPercent = getWorkPercentage(liveTotalWorkMs);

    const takeScreenshot = async () => {
        const imageData = await window.electronAPI.captureScreen();
        const imageUrl = imageData.imageUrl;
        const mouseEventCount = imageData.mouseEventCount;
        const keyboardKeyPressCount = imageData.keyboardKeyPressCount;

        const formData = new FormData();

        formData.append(appKey.userId, getLocalData(appKey._id));
        formData.append(appKey.screenshot, imageUrl);
        formData.append(appKey.keyPressCount, mouseEventCount);
        formData.append(appKey.mouseEventCount, keyboardKeyPressCount);

        await handleScreenShotUpload(getLocalData(appKey._id), imageUrl, mouseEventCount, keyboardKeyPressCount);

        if (appSettingData?.showScreenShot === true) {
            window.electronAPI.showScreenshotWindow(imageUrl);
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (appSettingData?.isTakeScreenShot === true && attendanceData.isPunchIn && !attendanceData.isBreakIn) {
                takeScreenshot();
            }
        }, Number(appSettingData?.screenshotTime || 15) * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [appSettingData, attendanceData]);

    return (
        <>
            <Card title={(
                <div className="flex items-center gap-2">
                    <Clock color={appColor.secondPrimary}/>
                    <div className="flex-1 font-[550] text-[15px]">{appString.clockInOut}<LoadingOutlined
                        className="ml-3" hidden={!isLoading && attendanceData} style={{color: appColor.secondPrimary}}/>
                    </div>
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
                    {/*<Tooltip title="Timeline">*/}
                    {/*    <div className="cursor-pointer" onClick={() => setIsDrawerOpen(true)}><Info color={appColor.secondPrimary}/></div>*/}
                    {/*</Tooltip>*/}
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
                                icon={<Coffee size={16}/>}
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
        </>
    );
}