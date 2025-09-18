'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {
    Avatar,
    Button, Card, DatePicker,
    Grid,
    Input,
    Popconfirm, Row,
    Space,
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
import {approvalStatusColor, capitalizeLastPathSegment, formatMilliseconds} from "../../../utils/utils";
import {DeleteOutlined, EditOutlined, EyeOutlined, LoadingOutlined, UserOutlined} from "@ant-design/icons";
import {useRouter} from "next/navigation";
import {pageRoutes, routeConfig} from "../../../utils/pageRoutes";
import appKeys from "../../../utils/appKeys";
import {TableExtraData, timeTag} from "../../../components/CommonComponents";
import EmpScreenshotModel from "../../../models/EmpScreenshotModel";
import AttendanceDetailModel from "../../../models/AttendanceDetailModel";
import SafeAvatar from "../../../components/SafeAvatar";
import {usePermission} from "../../../hooks/usePermission";
import {CommonActionButton} from "../(panelCommonUtils)/CommonAction";
import {useApiServices} from "../../../api/useApiServices";
import {useRunOnce} from "../../../hooks/useRunOnce";
import {useActionLoading} from "../../../hooks/useActionLoading";
import {format} from "date-fns";

export default function CardTodayReportPage() {
    const {attendance: callApi} = useApiServices();
    const {withLoading} = useActionLoading();
    const fetchLoading = withLoading();

    const {hasPermission} = usePermission();
    const canScreenshotView = !!hasPermission(mActions.screenshotView, routeConfig.todayReport.key);
    const canMouseKeyboardEventView = !!hasPermission(mActions.mouseKeyboardEventView, routeConfig.todayReport.key);
    const canViewDetail = !!hasPermission(mActions.viewDetail, routeConfig.todayReport.key);

    const router = useRouter();

    const [allData, setAllData] = useState([]);
    const [isSsModelOpen, setSsModelOpen] = useState(false);
    const [isAttendanceModelOpen, setIsAttendanceModelOpen] = useState(false);
    const [screenshots, setScreenshots] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [searchText, setSearchText] = useState('');

    const fetchData = async (query) => {
        await fetchLoading.run(async () => {
            const data = await callApi.getTodayAttendance(query);
            setAllData(data || []);
        });
    };

    useRunOnce(fetchData);

    const filteredData = useMemo(() => {
        if (!allData) return [];
        const query = searchText.toLowerCase();
        return allData.filter(
            data =>
                (
                    data?.userData?.userName?.toLowerCase().includes(query)
                )
        );
    }, [allData, searchText]);

    const showScreenshotModel = async (record) => {
        await withLoading(record._id).run(async () => {
            setSelectedRecord(record);
            setSsModelOpen(true);
        });
    };

    const timeFormater = (time) => {
        return time ? formatMilliseconds(time) : "00:00:00";
    }

    const columns = [
        Table.EXPAND_COLUMN,
        {
            title: appString.userName,
            render: (text, record) => record?.userData ? (
                <div className="flex items-center gap-2">
                    <SafeAvatar
                        userData={record?.userData}
                        size="default"
                    />
                    <div className="flex-1 font-medium">{record.userData.userName}</div>
                </div>
            ) : null,
        },
        {
            title: appString.punchInAt,
            dataIndex: appKeys.punchInAt,
            key: appKeys.punchInAt,
            render: (punchInAt) => {
                return timeTag(format(new Date(punchInAt), 'hh:mm a'), 'purple');
            },
        },
        {
            title: appString.screenshots,
            key: appKeys.screenshots,
            hidden: !canScreenshotView,
            render: (_, record) => {
                let screenshots = record?.screenshots;
                return (
                    <>
                        {withLoading(record._id).loading ?
                            <div className="flex items-center justify-center"><LoadingOutlined className="text-lg"/></div> :
                            <Avatar.Group size="default" max={{
                                count: 5,
                                style: {color: '#f56a00', backgroundColor: '#fde3cf'},
                            }}>
                                {screenshots && screenshots.length > 0 ? (
                                    screenshots.slice(0, 5).map((image, index) => (
                                            <>
                                                <Avatar key={index} src={image?.image}
                                                        onClick={() => showScreenshotModel(record)}
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
                            </Avatar.Group>}
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

    const handleAttendViewClick = (record) => {
        setIsAttendanceModelOpen(true);
        setSelectedRecord(record);
    };

    const handleEmpViewClick = (record) => {
        router.push(`${pageRoutes.employeeDetail}?user=${record?.userData?.employeeCode}`);
    };

    const onChange = async (_, dateString) => {
        const query = dateString ? `date=${dateString}` : "";
        await fetchData(query);
    };

    const tableExpandRows = (record) => {
        return (
            <Row gutter={[16, 25]}>
                <TableExtraData title={appString.punchInAt}
                                value={timeTag(format(new Date(record?.punchInAt), 'hh:mm a'), 'purple')}/>
                <TableExtraData title={appString.totalHours}
                                value={timeTag(timeFormater(record?.totalHours), 'geekblue')}/>
                <TableExtraData title={appString.workingHours}
                                value={timeTag(timeFormater(record?.workingHours), 'green')}/>
                <TableExtraData title={appString.breakHours} value={timeTag(timeFormater(record?.breakHours), 'red')}/>
                <TableExtraData title={appString.lateArrival}
                                value={timeTag(timeFormater(record?.lateArrival), 'orange')}/>
                <TableExtraData title={appString.overtime} value={timeTag(timeFormater(record?.overtime), 'purple')}/>
            </Row>
        );
    }

    return (
        <>
            {isSsModelOpen && <EmpScreenshotModel open={isSsModelOpen} setSsModelOpen={setSsModelOpen} selectedRecord={selectedRecord}/>}
            {isAttendanceModelOpen &&
                <AttendanceDetailModel selectedRecord={selectedRecord} isModelOpen={isAttendanceModelOpen}
                                       setIsModelOpen={setIsAttendanceModelOpen}/>}
            <Card>
                <Table
                    rowKey={(record) => record._id}
                    loading={fetchLoading.loading}
                    columns={columns}
                    dataSource={filteredData}
                    scroll={{x: "max-content"}}
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
                    expandable={{
                        expandedRowRender: record => (
                            tableExpandRows(record)
                        ),
                    }}
                />
            </Card>
        </>
    );
}