'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {
    Avatar,
    Button, Card, DatePicker,
    Grid,
    Input,
    Popconfirm,
    Space ,
    Table,
    Tooltip,
} from 'antd';
import {Search, User} from '../../../utils/icons';
import {UserPlus, Edit, Trash2, Eye, XCircle, CheckCircle} from '../../../utils/icons';
import {useAppData, AppDataFields} from '../../../masterData/AppDataContext';
import apiCall, {HttpMethod} from '../../../api/apiServiceProvider';
import {endpoints} from '../../../api/apiEndpoints';
import appString from '../../../utils/appString';
import {ApprovalStatus, DateTimeFormat, mActions} from '../../../utils/enum';
import {appColor} from '../../../utils/appColor';
import dayjs from 'dayjs';
import {formatMilliseconds} from "../../../utils/utils";
import {DeleteOutlined, EditOutlined, EyeOutlined, LoadingOutlined, UserOutlined} from "@ant-design/icons";
import {useRouter} from "next/navigation";
import {pageRoutes, routeConfig} from "../../../utils/pageRoutes";
import appKeys from "../../../utils/appKeys";
import {timeTag} from "../../../components/CommonComponents";
import EmpScreenshotModel from "../../../models/EmpScreenshotModel";
import AttendanceDetailModel from "../../../models/AttendanceDetailModel";
import SafeAvatar from "../../../components/SafeAvatar";
import {usePermission} from "../../../hooks/usePermission";
import CommonActionButton from "../(panelCommonUtils)/CommonActionButton";

export default function CardTodayReportPage() {
    const {hasPermission} = usePermission();
    const canScreenshotView = !!hasPermission(mActions.screenshotView, routeConfig.todayReport.key);
    const canMouseKeyboardEventView = !!hasPermission(mActions.mouseKeyboardEventView, routeConfig.todayReport.key);
    const canViewDetail = !!hasPermission(mActions.viewDetail, routeConfig.todayReport.key);

    const {attendancesData} = useAppData();

    const router = useRouter();

    const baseUrl = endpoints.getTodayAttendance;
    const [allData, setAllData] = useState(attendancesData);
    const [isSsModelOpen, setSsModelOpen] = useState(false);
    const [isAttendanceModelOpen, setIsAttendanceModelOpen] = useState(false);
    const [screenshots, setScreenshots] = useState([]);
    const [selectedAttend, setSelectedAttend] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData()
    }, []);

    const filteredData = useMemo(() => {
        if (!allData) return [];
        const query = searchText.toLowerCase();
        return allData.filter(
            data =>
                (
                    data?.userData?.fullName?.toLowerCase().includes(query)
                )
        );
    }, [allData, searchText]);

    const showScreenshotModel = ({screenshots, id}) => {
        setSsModelOpen(true);
        setScreenshots([...screenshots]);
        setSelectedId(id)
    };

    const timeFormater = (time) => {
        return time ? formatMilliseconds(time) : "00:00:00";
    }

    const columns = [
        {
            title: appString.userName,
            dataIndex: appKeys.userData,
            key: 'userData.fullName',
            render: (text, record) => record?.userData ? (
                <div className="flex items-center gap-2">
                    <SafeAvatar
                        userData={record?.userData}
                        size="default"
                    />
                    <div className="flex-1 font-medium">{record.userData.fullName}</div>
                </div>
            ) : null,
        },
        {
            title: appString.totalHours,
            dataIndex: appKeys.totalHours,
            key: appKeys.totalHours,
            render: (totalHours) => {
                return timeTag(timeFormater(totalHours), 'geekblue');
            },
        },
        {
            title: appString.workingHours,
            dataIndex: appKeys.workingHours,
            key: appKeys.workingHours,
            render: (workingHours) => {
                return timeTag(timeFormater(workingHours), 'green');
            },
        },
        {
            title: appString.breakHours,
            dataIndex: appKeys.breakHours,
            key: appKeys.breakHours,
            render: (breakHours) => {
                return timeTag(timeFormater(breakHours), 'red');
            },
        },
        {
            title: appString.lateArrival,
            dataIndex: appKeys.lateArrival,
            key: appKeys.lateArrival,
            render: (lateArrival) => {
                return timeTag(timeFormater(lateArrival), 'orange');
            },
        },
        {
            title: appString.overtime,
            dataIndex: appKeys.overtime,
            key: appKeys.overtime,
            render: (overtime) => {
                return timeTag(timeFormater(overtime), 'purple');
            },
        },
        {
            title: appString.screenshots,
            key: appKeys.screenshots,
            hidden: !canScreenshotView,
            render: (_, record) => {
                let screenshots = record?.screenshots;
                let attendanceID = record?._id;

                return (
                    <>
                        <Avatar.Group size="default" max={{count: 4}}>
                            {screenshots && screenshots.length > 0 ? (
                                screenshots.slice(0, 4).map((image, index) => (
                                        <>
                                            <Avatar key={index} src={image?.image} onClick={() => showScreenshotModel({
                                                screenshots: screenshots,
                                                id: attendanceID
                                            })}
                                                    style={{cursor: "pointer"}}/>
                                        </>
                                    )
                                )
                            ) : (
                                <Tooltip title="No screenshots available">
                                    <Avatar
                                        size="default"
                                        style={{
                                            backgroundColor: "#f56a00",
                                        }}
                                    >
                                        N/A
                                    </Avatar>
                                </Tooltip>
                            )}
                        </Avatar.Group>
                    </>
                )
            },
        },
        {
            title: appString.eventCount,
            dataIndex: appKeys.keyPressCount,
            key: appKeys.keyPressCount,
            hidden: !canMouseKeyboardEventView,
            render: (_, record) => {
                return (
                    <div className="min-w-40 font-medium text-blue-900">
                        {`${record?.keyPressCount ?? 0} keyboard hits  •  ${record?.mouseEventCount ?? 0} mouse clicks`}
                    </div>
                );
            },
        },
        {
            title: appString.view,
            align: "center",
            hidden: !canViewDetail,
            fixed: 'right',
            render: (_, record) => (
                <CommonActionButton
                    record={record}
                    handleDetailView={handleAttendViewClick}
                    handleUserDetailView={handleEmpViewClick}
                />
            ),
        },
    ];

    // const openModalWithLoading = (isEditMode, record = null) => {
    //     const loadingId = isEditMode ? record._id : 'add';
    //     setActionLoading(loadingId);
    //
    //     setSelectedEmp(record);
    //     setIsEditing(isEditMode);
    //
    //     setTimeout(() => {
    //         setIsModelOpen(true);
    //         setActionLoading(null);
    //     }, 100);
    // };

    const handleAttendViewClick = (record) => {
        setIsAttendanceModelOpen(true);
        setSelectedAttend(record);
    };

    const handleEmpViewClick = (record) => {
        router.push(`${pageRoutes.employeeDetail}?user=${record?.userData?.employeeCode}`);
    };

    const onChange = async (date, dateString) => {
        let queryParams = [];

        if (dateString) {
            queryParams.push(`date=${dateString}`);
        }

        const finalUrl =
            queryParams.length > 0
                ? `${baseUrl}?${queryParams.join("&")}`
                : baseUrl;

        await fetchData(finalUrl);
    };

    const fetchData = async (finalUrl = null) => {
        try {
            await apiCall({
                method: HttpMethod.GET,
                url: finalUrl ? finalUrl : baseUrl,
                setIsLoading: setLoading,
                showSuccessMessage: false,
                successCallback: (data) => {
                    setAllData(data.data);
                },
            });
        } catch (error) {
            console.error("API Call Failed:", error);
        }
    }

    return (
        <>
            <EmpScreenshotModel open={isSsModelOpen} loading={false} setSsModelOpen={setSsModelOpen} screenshots={screenshots}
                                setScreenshots={setScreenshots} empID={selectedId}/>
            {isAttendanceModelOpen && <AttendanceDetailModel selectedAttendance={selectedAttend} isModelOpen={isAttendanceModelOpen}
                                                             setIsModelOpen={setIsAttendanceModelOpen}/>}
            <Card>
                <Table
                    rowKey={(record) => record._id}
                    loading={loading}
                    columns={columns}
                    dataSource={filteredData}
                    scroll={{ x: "max-content" }}
                    title={() => (
                        <div className="flex justify-between items-center gap-2 flex-wrap">
                            <Input
                                placeholder={appString.attReportSearchHint}
                                prefix={<Search/>}
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                className="w-full flex-1 max-w-90"
                            />
                            <Space direction="vertical">
                                <DatePicker
                                    onChange={onChange}
                                    defaultValue={dayjs()}
                                    allowClear={false}
                                    disabledDate={(current) => {
                                        return current && current > dayjs().endOf('day');
                                    }}
                                />
                            </Space>
                        </div>
                    )}
                />
            </Card>
        </>
    );
}