'use client';

import {capitalizeLastPathSegment} from "../../../utils/utils";
import pageRoutes from "../../../utils/pageRoutes";
import {AppDataFields, useAppData} from "../../../masterData/AppDataContext";
import {useEffect, useState} from "react";
import {Pagination, Popconfirm, Switch, Table, Tag, Tooltip} from "antd";
import {LineChartOutlined} from "@ant-design/icons";
import {appColor, colorMap} from "../../../utils/appColor";
import appString from "../../../utils/appString";
import appKeys from "../../../utils/appKey";
import dayjs from "dayjs";
import {ApprovalStatus, DateTimeFormat} from "../../../utils/enum";
import {CheckCircle, Edit, Eye, Trash2, XCircle} from "../../../utils/icons";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints";

export default function Page() {
    const {usersData, updateAppDataField} = useAppData();
    const [employeesData, setEmployeesData] = useState(usersData);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState({});

    useEffect(() => {
        setEmployeesData(usersData);
    }, [usersData]);

    const dataUpdateApi = async (id, setIsLoading, data) => {
        try {
            await apiCall({
                method: HttpMethod.POST,
                url: `${endpoints.addUpdateUser}${id}`,
                data,
                setIsLoading,
                successCallback: (data) => {
                    updateAppDataField(AppDataFields.usersData, data?.data);
                },
            });
        } catch (error) {
            console.error("API Call Failed:", error);
        }
    }

    const handleEditClick = (value) => {
        // setIsEditing(true);
        // setEditingRecord(value);
        // setIsEditModalOpen(true);
    };

    const handleDeleteUserApi = async (event) => {
        // await deleteUserApi({
        //     id: event._id,
        //     setIsLoading: setIsLoading,
        //     successCallback: (data) => {
        //         setIsEditModalOpen(false);
        //         updateAppDataField(AppDataFields.usersData, data?.data);
        //     },
        // });
    };

    const handleApproveUserApi = async (event) => {
        await dataUpdateApi(event._id, setIsLoading, {
            approvalStatus: ApprovalStatus.Approved,
        });
    };

    const handleRejectUserApi = async (event) => {
        await dataUpdateApi(event._id, setIsLoading, {
            approvalStatus: ApprovalStatus.Rejected,
        });
    };

    const handleUserStatusChange = async (user, checked) => {
        setLoadingUsers(prev => ({ ...prev, [user._id]: true }));
        await dataUpdateApi(user._id, null, { isActive: checked });
        setLoadingUsers(prev => ({ ...prev, [user._id]: false }));
    };


    const handleViewClick = async (event) => {
        // setEditingRecord(event);
        // navigate(pageRoutes.employeeDetails, { state: { employeeDetails: event } });
    };

    const employeeTableColumn = ({
                                     hiddenColumns = [],
                                 }) => [
        {
            title: appString.empCode,
            dataIndex: appKeys.employeeCode,
            key: appKeys.employeeCode,
            width: 100,
        },
        {
            title: appString.fullName,
            dataIndex: appKeys.fullName,
            key: appKeys.fullName,
            sorter: (a, b) => {
                if (a.fullName > b.fullName) return 1;
                if (a.fullName < b.fullName) return -1;
                return 0;
            },
            sortDirections: [appKeys.ascend, appKeys.descend],
        },
        {
            title: appString.emailAddress,
            dataIndex: appKeys.emailAddress,
            key: appKeys.emailAddress,
            sorter: (a, b) => {
                if (a.emailAddress > b.emailAddress) return 1;
                if (a.emailAddress < b.emailAddress) return -1;
                return 0;
            },
            sortDirections: [appKeys.ascend, appKeys.descend],
        },
        {
            title: appString.mobileNumber,
            dataIndex: appKeys.mobileNumber,
            key: appKeys.mobileNumber,
        },
        {
            title: appString.dateOfBirth,
            dataIndex: appKeys.dateOfBirth,
            key: appKeys.dateOfBirth,
            render: (dateOfBirth) => {
                if (!dateOfBirth) return "";
                return dayjs(dateOfBirth).format(DateTimeFormat.DDMMMMYYYY);
            },
        },
        {
            title: appString.role,
            dataIndex: appKeys.role,
            key: appKeys.role,
            sorter: (a, b) => {
                if (a.userRole > b.userRole) return 1;
                if (a.userRole < b.userRole) return -1;
                return 0;
            },
            sortDirections: [appKeys.ascend, appKeys.descend],
        },
        {
            title: appString.status,
            dataIndex: appKeys.approvalStatus,
            key: appKeys.approvalStatus,
            width: 120,
            sorter: (a, b) => {
                if (a.approvalStatus > b.approvalStatus) return 1;
                if (a.approvalStatus < b.approvalStatus) return -1;
                return 0;
            },
            sortDirections: [appKeys.ascend, appKeys.descend],
            hidden: hiddenColumns.includes(appKeys.approvalStatus),
            render: (_, record) => {
                let color;
                if (record.approvalStatus === ApprovalStatus.Approved) {
                    color = appColor.success;
                } else if (record.approvalStatus === ApprovalStatus.Pending) {
                    color = appColor.warning;
                } else if (record.approvalStatus === ApprovalStatus.Rejected) {
                    color = appColor.danger;
                } else {
                    color = appColor.transparant;
                }
                return (
                    <>
                        {record.approvalStatus === ApprovalStatus.Approved ? (
                            <Switch
                                loading={!!loadingUsers[record._id]}
                                checked={record.isActive}
                                onChange={(checked) => handleUserStatusChange(record, checked)}
                            />
                        ) : record.approvalStatus === ApprovalStatus.Pending ? (
                            <div
                                style={{
                                    display: "flex",
                                }}
                            >
                                <Popconfirm
                                    title={appString.rejectConfirmation}
                                    onConfirm={() => handleRejectUserApi(record)}
                                    style={{ marginRight: 35 }}
                                >
                                    <div style={{ marginRight: 35, cursor: "pointer" }}>
                                        <Tooltip title={appString.reject}>
                                            <XCircle className="deleteIconStyle" />
                                        </Tooltip>
                                    </div>
                                </Popconfirm>
                                <Popconfirm
                                    title={appString.approveConfirmation}
                                    onConfirm={() => handleApproveUserApi(record)}
                                    style={{ margin: 0 }}
                                >
                                    <div style={{ cursor: "pointer" }}>
                                        <Tooltip title={appString.approve}>
                                            <CheckCircle className="successIconStyle" />
                                        </Tooltip>
                                    </div>
                                </Popconfirm>
                            </div>
                        ) : (
                            <Tag color={color}>{record.approvalStatus.toUpperCase()}</Tag>
                        )}
                    </>
                );
            },
        },
        {
            title: appString.action,
            dataIndex: appKeys.operation,
            fixed: "right",
            width: 50,
            render: (_, record) => {
                return employeesData?.length >= 1 ? (
                    <>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <div
                                style={{ marginRight: 25, cursor: "pointer" }}
                                onClick={() => handleEditClick(record)}
                            >
                                <Tooltip title={appString.edit}>
                                    <Edit className="commonIconStyle" />
                                </Tooltip>
                            </div>
                            <Popconfirm
                                title={appString.deleteConfirmation}
                                onConfirm={() => handleDeleteUserApi(record)}
                                style={{ margin: "0" }}
                            >
                                <div style={{ marginRight: 25, cursor: "pointer" }}>
                                    <Tooltip title={appString.delete} placement="bottom">
                                        <Trash2 className="deleteIconStyle" />
                                    </Tooltip>
                                </div>
                            </Popconfirm>
                            <div
                                style={{ cursor: "pointer" }}
                                onClick={() => handleViewClick(record)}
                            >
                                <Tooltip title={appString.view}>
                                    <Eye className="commonIconStyle" />
                                </Tooltip>
                            </div>
                        </div>
                    </>
                ) : null;
            },
        },
    ];

    return (
        <div>
            <Table
                pagination={false}
                columns={employeeTableColumn({})}
                dataSource={employeesData}
                // scroll={{ x: true, y: !screens.xl ? 300 : 240 }}
                // scroll={{ x: true, scrollToFirstRowOnChange: true }}
                loading={isLoading}
                rowKey={(record) => record._id}
                bordered
                title={() => (
                    <div className="flex items-center gap-2">
                        <LineChartOutlined style={{color: colorMap.F}} />
                        <div className="flex-1 font-[550] text-[15px]">{appString.attendanceReport}</div>
                    </div>
                )}
            />
        </div>
    );
}