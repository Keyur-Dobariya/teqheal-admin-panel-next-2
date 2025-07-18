'use client';

import {capitalizeLastPathSegment, convertCamelCase} from "../../../utils/utils";
import pageRoutes from "../../../utils/pageRoutes";
import appString from "../../../utils/appString";
import {
    dayTypeLabel,
    getLabelByKey,
    leaveCategoryLabel,
    leaveHalfDayTypeLabel,
    leaveLabelKeys,
    leaveTypeLabel
} from "../../../utils/enum";
import dayjs from "dayjs";
import appKeys from "../../../utils/appKeys";
import {antTag} from "../../../components/CommonComponents";
import {getLocalData, isAdmin} from "../../../dataStorage/DataPref";
import {Button, Card, Input, Popconfirm, Switch, Table, Tooltip} from "antd";
import {Edit, Search, ToggleRight, Trash2, UserPlus} from "../../../utils/icons";
import {useAppData} from "../../../masterData/AppDataContext";
import {useState} from "react";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints";
import {LoadingOutlined} from "@ant-design/icons";
import appColor from "../../../utils/appColor";

export default function PageLeaveDataCommon({isReportPage}) {

    const {activeUsersData} = useAppData();

    const [isModelOpen, setIsModelOpen] = useState(false);
    const [isLeaveEditing, setIsLeaveEditing] = useState(false);
    const [isLeaveStatusChange, setIsLeaveStatusChange] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingLeaveId, setLoadingLeaveId] = useState(null);
    const [leaveRecord, setLeaveRecord] = useState([]);
    const [leaveRecordCount, setLeaveRecordCount] = useState([]);
    const [unexpectedLeaveRecord, setUnexpectedLeaveRecord] = useState([]);
    const [leaveFullRecord, setLeaveFullRecord] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState({});
    const [actionLoading, setActionLoading] = useState(null);

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

    React.useEffect(() => {
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
            successCallback: (data) => {
                setLeaveRecordCount(data.count);
                handleDataConditionWise(data.data, false);
            },
        });
    };

    const handleDataConditionWise = (data, isSearchField) => {
        const filteredLeave = isAdmin() ? data : data.filter((leave) => leave.user._id === getLocalData(loginDataKeys._id));
        const filterLeaveRecord = filteredLeave.filter((leave) => leave.isUnexpected !== true);
        const filterUnexpectedLeaveRecord = filteredLeave.filter((leave) => leave.isUnexpected === true);
        setLeaveRecord(filterLeaveRecord);
        setUnexpectedLeaveRecord(filterUnexpectedLeaveRecord);
        if (!isSearchField) {
            setLeaveFullRecord(data);
        }
    };

    const handleAddUpdateLeaveApi = async (_id, data) => {
        try {
            await apiCall({
                method: HttpMethod.POST,
                url: `${endpoints.addLeave}/${_id}`,
                data: data,
                setIsLoading: false,
                successCallback: (data) => {
                    handleDataConditionWise(data.data, false);
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
            successCallback: (data) => {
                handleDataConditionWise(data.data, false);
            },
        });
    };

    const columns = [
        Table.EXPAND_COLUMN,
        {
            title: appString.fullName,
            dataIndex: appKeys.user,
            key: 'user.fullName',
            render: (text, record) => record.user ? record.user.fullName : '',
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
                                        <ToggleRight className="successIconStyle"/>
                                    </Tooltip>
                                </div> : null
                            }
                            {
                                isAdmin() || record.status === leaveLabelKeys.pending ? <Tooltip title={appString.edit}>
                                    {actionLoading === record._id ? (
                                        <LoadingOutlined />
                                    ) : (
                                        <div className="cursor-pointer" onClick={() => handleEditClick(record)} style={{cursor: 'pointer'}}>
                                            <Edit color={appColor.secondPrimary} />
                                        </div>
                                    )}
                                </Tooltip> : null
                            }
                            {
                                isAdmin() ? <Popconfirm title={appString.deleteConfirmation} onConfirm={() => deleteRecord(record)}>
                                    <Tooltip title={appString.delete}>
                                        <Trash2 color={appColor.danger} style={{cursor: 'pointer'}}/>
                                    </Tooltip>
                                </Popconfirm> : null
                            }
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            {
                                isAdmin() ? <div
                                    style={{marginRight: 25, cursor: "pointer"}}
                                    onClick={() => {
                                        setIsLeaveStatusChange(true);
                                        handleEditClick(record)
                                    }}
                                >
                                    <Tooltip title={appString.changeStatus}>
                                        <ToggleRight className="successIconStyle"/>
                                    </Tooltip>
                                </div> : null
                            }
                            {
                                isAdmin() ? <div
                                    style={{marginRight: 25, cursor: "pointer"}}
                                    onClick={() => handleEditClick(record)}
                                >
                                    <Tooltip title={appString.edit}>
                                        <Edit className="commonIconStyle"/>
                                    </Tooltip>
                                </div> : record.status === leaveLabelKeys.pending ? <div
                                    style={{marginRight: 25, cursor: "pointer"}}
                                    onClick={() => handleEditClick(record)}
                                >
                                    <Tooltip title={appString.edit}>
                                        <Edit className="commonIconStyle"/>
                                    </Tooltip>
                                </div> : null
                            }
                            {
                                isAdmin() ? <Popconfirm
                                    title={appString.deleteConfirmation}
                                    onConfirm={() => deleteRecord(record)}
                                    style={{margin: "0"}}
                                >
                                    <div style={{marginRight: 25, cursor: "pointer"}}>
                                        <Tooltip title={appString.delete} placement="bottom">
                                            <Trash2 className="deleteIconStyle"/>
                                        </Tooltip>
                                    </div>
                                </Popconfirm> : null
                            }
                        </div>
                    </>
                );
            },
        },
    ];

    const extraFieldCommon = (title, value) => {
        return value && true ? <div className="extraFieldRow">
            <div className="extraFieldRowTitle">{title}:</div>
            <div className="extraFieldRowValue">{value}</div>
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
    return (
        <>
            <Card>
                {/*<Table*/}
                {/*    rowKey={(record) => record._id}*/}
                {/*    loading={isLoading}*/}
                {/*    columns={columns}*/}
                {/*    dataSource={filteredData}*/}
                {/*    title={() => (*/}
                {/*        <div className="flex justify-between items-center gap-2 flex-wrap">*/}
                {/*            <Input*/}
                {/*                placeholder={appString.searchHint}*/}
                {/*                prefix={<Search/>}*/}
                {/*                value={searchText}*/}
                {/*                onChange={e => setSearchText(e.target.value)}*/}
                {/*                className="w-full flex-1 max-w-90"*/}
                {/*            />*/}
                {/*            <Button*/}
                {/*                type="primary"*/}
                {/*                icon={<UserPlus/>}*/}
                {/*                onClick={handleAddClick}*/}
                {/*                loading={actionLoading === 'add'}*/}
                {/*            >*/}
                {/*                {!isMobile && appString.addClient}*/}
                {/*            </Button>*/}
                {/*        </div>*/}
                {/*    )}*/}
                {/*/>*/}
            </Card>
        </>
    );
}