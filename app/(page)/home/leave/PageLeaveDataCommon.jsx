'use client';

import {capitalizeLastPathSegment, convertCamelCase, profilePhotoManager} from "../../../utils/utils";
import pageRoutes from "../../../utils/pageRoutes";
import appString from "../../../utils/appString";
import {
    ApprovalStatus,
    dayTypeLabel,
    getLabelByKey,
    leaveCategoryLabel, leaveCategoryNewLabel,
    leaveHalfDayTypeLabel,
    leaveLabelKeys,
    leaveTypeLabel
} from "../../../utils/enum";
import dayjs from "dayjs";
import appKeys from "../../../utils/appKeys";
import {antTag, UserSelect} from "../../../components/CommonComponents";
import {getLocalData, isAdmin} from "../../../dataStorage/DataPref";
import {
    Avatar,
    Button,
    Card,
    Col,
    DatePicker,
    Grid,
    Input,
    Popconfirm,
    Row,
    Select,
    Switch,
    Table,
    Tooltip
} from "antd";
import {
    Box, Clock,
    Edit,
    FileMinus,
    FilePlus,
    PenTool,
    PieChart,
    Search,
    ToggleRight,
    Trash2,
    Map
} from "../../../utils/icons";
import {AppDataFields, useAppData} from "../../../masterData/AppDataContext";
import React, {useEffect, useMemo, useState} from "react";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints";
import {
    GithubOutlined,
    LoadingOutlined,
    SmileOutlined,
    UserAddOutlined,
    UserDeleteOutlined,
    UserOutlined
} from "@ant-design/icons";
import appColor, {getDarkColor, getTransColor} from "../../../utils/appColor";
import imagePaths from "../../../utils/imagesPath";
import LeaveAddUpdateModel from "../../../models/LeaveAddUpdateModel";

const {Option} = Select;

const {useBreakpoint} = Grid;

export default function PageLeaveDataCommon({isReportPage}) {

    const {activeUsersData} = useAppData();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [allData, setAllData] = useState([]);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const [isLeaveStatusChange, setIsLeaveStatusChange] = useState(false);
    const [loadingLeaveId, setLoadingLeaveId] = useState(null);
    const [leaveRecordCount, setLeaveRecordCount] = useState([]);

    const now = new Date();
    const prevMonth = now.getMonth();
    const defaultMonth = prevMonth === 0 ? 12 : prevMonth;
    const defaultYear = prevMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();

    const defaultMonthDayjs = dayjs(`${defaultYear}-${String(defaultMonth).padStart(2, '0')}`, 'YYYY-MM');

    const [filters, setFilters] = useState({
        user: isAdmin() ? null : getLocalData(appKeys._id),
        leaveCategory: null,
        year: defaultYear,
        month: defaultMonth,
    });

    const getQueryParams = () => {
        const params = new URLSearchParams();
        if (filters.user) params.append('user', filters.user);
        if (filters.leaveCategory) params.append('leaveCategory', filters.leaveCategory);
        if (filters.year) params.append('year', filters.year);
        if (filters.month) params.append('month', filters.month);
        return params.toString();
    };

    useEffect(() => {
        const query = getQueryParams();
        // if (isReportPage) {
        getLeaveReportData(query);
        // }
    }, [filters]);

    const getLeaveReportData = async (query) => {
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.allLeaveLength + query,
            setIsLoading,
            showSuccessMessage: false,
            successCallback: handleUpdatedData,
        });
    };

    const filteredData = useMemo(() => {
        if (!allData) return [];
        const roleWiseData = isAdmin() ? allData : allData.filter((leave) => leave.user._id === getLocalData(appKeys._id));
        const query = searchText.toLowerCase();
        return roleWiseData.filter(
            data =>
                (
                    data?.user?.fullName.toLowerCase().includes(query) ||
                    data?.leaveType?.toLowerCase().includes(query) ||
                    data?.leaveCategory?.toLowerCase().includes(query) ||
                    data?.reason?.toLowerCase().includes(query) ||
                    data?.rejectedReason?.toLowerCase().includes(query)
                )
        );
    }, [allData, searchText]);

    const handleUpdatedData = (data) => {
        setLeaveRecordCount(data.count);
        setAllData(data.data);
    };

    const conditionWiseData = (isUnexpected) => {
        const leaveRecord = filteredData.filter((leave) => leave.isUnexpected !== true);
        const unexpectedRecord = filteredData.filter((leave) => leave.isUnexpected === true);
        return isUnexpected ? unexpectedRecord : leaveRecord;
    };

    const handleAddUpdateLeaveApi = async (_id, data) => {
        try {
            await apiCall({
                method: HttpMethod.POST,
                url: `${endpoints.addLeave}/${_id}`,
                data: data,
                setIsLoading: false,
                successCallback: (data) => {
                    setAllData(data.data, false);
                },
            });
        } catch (error) {
            console.error("API Call Failed:", error);
        } finally {
            setLoadingLeaveId(null);
        }
    };

    const openModalWithLoading = (isEditMode, record = null) => {
        const loadingId = isEditMode ? record._id : 'add';
        setActionLoading(loadingId);

        setSelectedRecord(record);

        setTimeout(() => {
            setIsModelOpen(true);
            setActionLoading(null);
        }, 100);
    };

    const handleAddClick = () => {
        openModalWithLoading(false);
    };

    const handleLeaveStatusChange = (record, checked) => {
        const body = {
            sandwichLeave: checked,
            user: record.user?.userId
        };

        setLoadingLeaveId(record._id);

        handleAddUpdateLeaveApi(record._id, body);
    }

    const handleEditClick = (record) => {
        openModalWithLoading(true, record);
    };

    const deleteRecord = async (record) => {
        await apiCall({
            method: HttpMethod.DELETE,
            url: `${endpoints.deleteLeave}${record._id}`,
            setIsLoading,
            successCallback: handleUpdatedData,
        });
    };

    const columns = [
        Table.EXPAND_COLUMN,
        {
            title: appString.fullName,
            dataIndex: appKeys.user,
            key: 'user.fullName',
            render: (text, record) => (
                <div className="flex items-center gap-2">
                    <Avatar src={profilePhotoManager({url: record?.user?.profilePhoto, gender: record?.user?.gender})}
                            size="default"/>
                    <div className="flex-1 font-medium">{record?.user?.fullName}</div>
                </div>
            ),
        },
        {
            title: appString.leaveType,
            dataIndex: appKeys.leaveType,
            key: appKeys.leaveType,
            render: (leaveType) => {
                return antTag(
                    getLabelByKey(leaveType, leaveTypeLabel),
                    leaveType === leaveLabelKeys.fullDay ? "red" : leaveType === leaveLabelKeys.halfDay ? "blue" : "purple"
                );
            },
        },
        {
            title: appString.leaveHours,
            dataIndex: appKeys.hours,
            key: appKeys.hours,
        },
        {
            title: appString.startDate,
            dataIndex: appKeys.startDate,
            key: appKeys.startDate,
            render: (startDate) => {
                return startDate ? dayjs(startDate).format("YYYY-MM-DD") : '-';
            },
        },
        {
            title: appString.endDate,
            dataIndex: appKeys.endDate,
            key: appKeys.endDate,
            render: (endDate) => {
                return endDate ? dayjs(endDate).format("YYYY-MM-DD") : '-';
            },
        },
        {
            title: appString.leaveCategory,
            dataIndex: appKeys.leaveCategory,
            key: appKeys.leaveCategory,
            render: (leaveCategory) => {
                return antTag(
                    getLabelByKey(leaveCategory, leaveCategoryLabel({disabledValues: []})),
                    leaveCategory === leaveLabelKeys.paid ? "red" : "green"
                );
            },
        },
        {
            title: appString.isUnexpected,
            dataIndex: appKeys.isUnexpected,
            key: appKeys.isUnexpected,
            render: (isUnexpected) => {
                return antTag(
                    isUnexpected ? 'Yes' : 'No',
                    isUnexpected ? "red" : "green"
                );
            },
        },
        {
            title: appString.status,
            dataIndex: appKeys.status,
            key: appKeys.status,
            render: (status) => {
                return antTag(
                    convertCamelCase(status),
                    status === leaveLabelKeys.rejected ? "red" : status === leaveLabelKeys.approved ? "green" : "gold"
                );
            },
        },
        {
            title: appString.sandwichLeave,
            dataIndex: appKeys.sandwichLeave,
            key: appKeys.sandwichLeave,
            render: (sandwichLeave) => {
                return antTag(
                    sandwichLeave ? 'Yes' : 'No',
                    sandwichLeave ? "red" : "green"
                );
            },
        },
        {
            title: "Sandwich Button",
            dataIndex: appKeys.sandwichLeave,
            key: appKeys.sandwichLeave,
            width: 120,
            hidden: !isAdmin() || isReportPage,
            render: (_, record) => {
                return (
                    <Switch
                        loading={loadingLeaveId === record._id}
                        checked={record.sandwichLeave}
                        onChange={(checked) => handleLeaveStatusChange(record, checked)}
                    />
                );
            },
        },
        {
            title: appString.action,
            dataIndex: appKeys.operation,
            fixed: "right",
            width: 50,
            hidden: isReportPage,
            render: (_, record) => {
                return (
                    <>
                        <div className="flex justify-center items-center gap-5">
                            {
                                isAdmin() ? <div className="cursor-pointer"
                                                 onClick={() => {
                                                     setIsLeaveStatusChange(true);
                                                     handleEditClick(record)
                                                 }}
                                >
                                    <Tooltip title={appString.changeStatus}>
                                        <ToggleRight color={appColor.success} size={20}/>
                                    </Tooltip>
                                </div> : null
                            }
                            {
                                isAdmin() || record.status === leaveLabelKeys.pending ? <Tooltip title={appString.edit}>
                                    {actionLoading === record._id ? (
                                        <LoadingOutlined/>
                                    ) : (
                                        <div className="cursor-pointer" onClick={() => handleEditClick(record)}
                                             style={{cursor: 'pointer'}}>
                                            <Edit color={appColor.secondPrimary}/>
                                        </div>
                                    )}
                                </Tooltip> : null
                            }
                            {
                                isAdmin() ? <Popconfirm title={appString.deleteConfirmation}
                                                        onConfirm={() => deleteRecord(record)}>
                                    <Tooltip title={appString.delete}>
                                        <Trash2 color={appColor.danger} style={{cursor: 'pointer'}}/>
                                    </Tooltip>
                                </Popconfirm> : null
                            }
                        </div>
                    </>
                );
            },
        },
    ];

    const extraFieldCommon = (title, value) => {
        return value && true ? <div className="flex items-center text-[14px] gap-2 my-1">
            <div className="text-gray-600 text-[13px]">{title}:</div>
            <div className="text-gray-950">{value}</div>
        </div> : null;
    }

    const tableExpandRows = (record) => {
        return (
            <div>
                {extraFieldCommon(appString.createdAt, dayjs(record.createdAt).format("DD, MMM YYYY [at] hh:mm a"))}
                {extraFieldCommon(appString.leaveType, record.leaveType ? getLabelByKey(record.leaveType, leaveTypeLabel) : null)}
                {extraFieldCommon(appString.dayType, record.dayType ? getLabelByKey(record.dayType, dayTypeLabel) : null)}
                {extraFieldCommon(appString.leaveHalfDayType, record.leaveHalfDayType ? getLabelByKey(record.leaveHalfDayType, leaveHalfDayTypeLabel) : null)}
                {extraFieldCommon(appString.startTime, record.startTime)}
                {extraFieldCommon(appString.endTime, record.endTime)}
                {extraFieldCommon(appString.reason, record.reason)}
                {extraFieldCommon(appString.rejectedReason, record.rejectedReason)}
            </div>
        );
    }

    const TableFilterHeader = () => {
        return (
            <Row gutter={[16, 16]} align="middle" justify="end" wrap>
                {isAdmin() && (
                    <Col xs={24} sm={8} md={8} lg={8} xl={7} xxl={5}>
                        <UserSelect users={activeUsersData} value={filters.user} onChange={(key) =>
                            setFilters((prev) => ({...prev, user: key}))
                        }/>
                    </Col>
                )}
                <Col xs={24} sm={6} md={6} lg={6} xl={5} xxl={4}>
                    <Select
                        allowClear
                        placeholder={appString.leaveCategory}
                        value={filters.leaveCategory}
                        style={{width: "100%"}}
                        onChange={(value) =>
                            setFilters((prev) => ({...prev, leaveCategory: value}))
                        }
                    >
                        {leaveCategoryNewLabel.map((item) => (
                            <Option key={item.value} value={item.value}>
                                {item.label}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={12} sm={5} md={5} lg={5} xl={4} xxl={3}>
                    <DatePicker
                        allowClear={false}
                        picker="year"
                        value={dayjs().year(filters.year)}
                        onChange={(date) =>
                            setFilters((prev) => ({...prev, year: date ? date.year() : null}))
                        }
                        style={{width: "100%"}}
                    />
                </Col>
                <Col xs={12} sm={5} md={5} lg={5} xl={4} xxl={3}>
                    <DatePicker
                        allowClear={false}
                        picker="month"
                        format="MMMM"
                        value={dayjs(`${filters.year}-${String(filters.month).padStart(2, '0')}`, 'YYYY-MM')}
                        onChange={(date) =>
                            setFilters((prev) => ({
                                ...prev,
                                month: date ? date.month() + 1 : null,
                            }))
                        }
                        style={{width: "100%"}}
                    />
                </Col>
            </Row>
        );
    };

    const CommonGridBox = ({title, value, color, icon}) => {
        return (
            <Col xs={24} sm={12} md={12} lg={8} xl={4}>
                <Card hoverable>
                    <div className="flex items-center gap-3 p-4">
                        <div className="w-9 h-9 min-w-9 min-h-9 rounded-full flex justify-center items-center"
                             style={{backgroundColor: getTransColor(color)}}>
                            {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[17px] font-medium" style={{color: appColor.primary}}>{value}</div>
                            <div className="text-[13px] text-gray-500 truncate" title={title}>{title}</div>
                        </div>
                    </div>
                </Card>
            </Col>
        );
    }

    return (
        <>
            <Card>
                <div className="flex justify-between items-center gap-2 flex-wrap p-3">
                    <Input
                        placeholder={appString.searchHint}
                        prefix={<Search/>}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        className="w-full flex-1 max-w-90"
                    />
                    {!isReportPage && <Button
                        type="primary"
                        icon={<FilePlus/>}
                        onClick={handleAddClick}
                        loading={actionLoading === 'add'}
                    >
                        {!isMobile && appString.addLeave}
                    </Button>}
                </div>
            </Card>
            <div className="m-4"/>
            {isReportPage && (<>
                <Row gutter={[16, 16]}>
                    <CommonGridBox
                        title="Leave Time"
                        value={`${leaveRecordCount?.totalLeaveHours || 0} h`}
                        color="A"
                        icon={<Clock style={{color: getDarkColor("A"), fontSize: 18}}/>}/>
                    <CommonGridBox
                        title="Total Leave"
                        value={leaveRecordCount?.totalLeave || 0}
                        color="V"
                        icon={<FileMinus style={{color: getDarkColor("V"), fontSize: 18}}/>}/>
                    <CommonGridBox
                        title="Unexpected"
                        value={leaveRecordCount?.unexpectedLeave || 0}
                        color="C"
                        icon={<PieChart style={{color: getDarkColor("C"), fontSize: 18}}/>}/>
                    <CommonGridBox
                        title="Total Unexpected"
                        value={0}
                        color="D"
                        icon={<PenTool style={{color: getDarkColor("D"), fontSize: 18}}/>}/>
                    <CommonGridBox
                        title="Paid Leave"
                        value={leaveRecordCount?.totalPaidLeave || 0}
                        color="E"
                        icon={<Box style={{color: getDarkColor("E"), fontSize: 18}}/>}/>
                    <CommonGridBox
                        title="Sandwich"
                        value={leaveRecordCount?.sandwichLeaves || 0}
                        color="F"
                        icon={<Map style={{color: getDarkColor("F"), fontSize: 18}}/>}/>
                </Row>
                <div className="m-4"/>
            </>)}
            <Card>
                <Table
                    rowKey={(record) => record._id}
                    columns={columns}
                    expandable={{
                        expandedRowRender: record => (
                            tableExpandRows(record)
                        ),
                    }}
                    title={() => (
                        <TableFilterHeader/>
                    )}
                    scroll={{x: "max-content"}}
                    dataSource={conditionWiseData(false)}
                    loading={isLoading}
                />
            </Card>
            <div className="m-4"/>
            <Card>
                <Table
                    rowKey={(record) => record._id}
                    columns={columns}
                    expandable={{
                        expandedRowRender: record => (
                            tableExpandRows(record)
                        ),
                    }}
                    title={() => (
                        <div className="text-base font-medium">{appString.unexpectedLeaves}</div>
                    )}
                    scroll={{x: "max-content"}}
                    dataSource={conditionWiseData(true)}
                    loading={isLoading}
                />
            </Card>
            <LeaveAddUpdateModel
                setIsModelOpen={setIsModelOpen}
                isModelOpen={isModelOpen}
                selectedRecord={selectedRecord}
                setIsLeaveStatusChange={setIsLeaveStatusChange}
                isLeaveStatusChange={isLeaveStatusChange}
                activeUsersData={activeUsersData}
                onSuccessCallback={(data) => {
                    handleUpdatedData(data);
                }}/>
        </>
    );
}