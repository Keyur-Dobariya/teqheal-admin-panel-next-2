'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Avatar,
    Button, Card,
    Grid,
    Input,
    Popconfirm,
    Switch,
    Table,
    Tooltip,
} from 'antd';
import { AlertCircle, Box, Search } from '../../../utils/icons';
import { UserPlus, Edit, Trash2, Eye, XCircle, CheckCircle } from '../../../utils/icons';
import { useAppData, AppDataFields } from '../../../masterData/AppDataContext';
import apiCall, { HttpMethod } from '../../../api/apiServiceProvider';
import { endpoints } from '../../../api/apiEndpoints';
import appString from '../../../utils/appString';
import appKeys from '../../../utils/appKeys';
import { ApprovalStatus, DateTimeFormat } from '../../../utils/enum';
import { appColor, colorMap } from '../../../utils/appColor';
import dayjs from 'dayjs';
import EmpAddUpdateModel from "../../../models/EmpAddUpdateModel";
import { LoadingOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import pageRoutes from "../../../utils/pageRoutes";
import SafeAvatar from "../../../components/SafeAvatar";

const { useBreakpoint } = Grid;

export default function CardEmpList({ isDashboard }) {
    const { usersData, updateAppDataField } = useAppData();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const router = useRouter();

    const [allData, setAllData] = useState(usersData);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [loadingRecord, setLoadingRecord] = useState({});

    useEffect(() => {
        setAllData(usersData);
    }, [usersData]);

    const handleUpdatedData = (data) => {
        updateAppDataField(AppDataFields.usersData, data?.data);
    };

    const filteredData = useMemo(() => {
        if (!allData) return [];
        const query = searchText.toLowerCase();
        return allData.filter(
            data =>
                isDashboard ? data.approvalStatus === ApprovalStatus.Pending : data.approvalStatus === ApprovalStatus.Approved &&
                    (
                        data.fullName?.toLowerCase().includes(query) ||
                        data.emailAddress?.toLowerCase().includes(query) ||
                        data.mobileNumber?.includes(query) ||
                        data.role?.toLowerCase().includes(query) ||
                        data.employeeCode?.toLowerCase().includes(query)
                    )
        );
    }, [allData, searchText]);

    const updateRecord = async (id, data) => {
        await apiCall({
            method: HttpMethod.POST,
            url: `${endpoints.addUpdateUser}${id}`,
            data,
            setIsLoading,
            successCallback: handleUpdatedData,
        });
    };

    const deleteRecord = async (record) => {
        await apiCall({
            method: HttpMethod.DELETE,
            url: `${endpoints.deleteUser}${record._id}`,
            setIsLoading,
            successCallback: handleUpdatedData,
        });
    };

    const toggleUserStatus = async (user, checked) => {
        setLoadingRecord(prev => ({ ...prev, [user._id]: true }));
        await updateRecord(user._id, { isActive: checked });
        setLoadingRecord(prev => ({ ...prev, [user._id]: false }));
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

    const handleEditClick = (record) => {
        openModalWithLoading(true, record);
    };

    const handleViewClick = (record) => {
        router.push(`${pageRoutes.employeeDetail}?user=${record.employeeCode}`);
    };

    const columns = [
        {
            title: appString.empCode,
            dataIndex: appKeys.employeeCode,
            key: appKeys.employeeCode,
            align: 'center',
        },
        {
            title: appString.fullName,
            dataIndex: appKeys.fullName,
            key: appKeys.fullName,
            sorter: (a, b) => a.fullName.localeCompare(b.fullName),
            render: (text, record) => (
                <div className="flex items-center gap-2">
                    <SafeAvatar
                        userData={record}
                        size="default"
                    />
                    <div className="flex-1 font-medium">{record.fullName}</div>
                </div>
            ),
        },
        {
            title: appString.emailAddress,
            dataIndex: appKeys.emailAddress,
            key: appKeys.emailAddress,
            sorter: (a, b) => a.emailAddress.localeCompare(b.emailAddress),
        },
        {
            title: appString.mobileNumber,
            dataIndex: appKeys.mobileNumber,
            key: appKeys.mobileNumber,
            align: 'center',
        },
        {
            title: appString.dateOfBirth,
            dataIndex: appKeys.dateOfBirth,
            key: appKeys.dateOfBirth,
            align: 'center',
            render: dob => dob ? dayjs(dob).format(DateTimeFormat.DDMMMMYYYY) : 'N/A',
        },
        {
            title: appString.role,
            dataIndex: appKeys.role,
            key: appKeys.role,
            align: 'center',
            sorter: (a, b) => a.role?.localeCompare(b.role),
        },
        {
            title: appString.status,
            key: 'status',
            align: 'center',
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
                                size="small"
                                loading={!!loadingRecord[record._id]}
                                checked={record.isActive}
                                onChange={(checked) => toggleUserStatus(record, checked)}
                            />
                        ) : record.approvalStatus === ApprovalStatus.Pending ? (
                            <div
                                style={{
                                    display: "flex",
                                }}
                            >
                                <Popconfirm
                                    title={appString.rejectConfirmation}
                                    onConfirm={async () => {
                                        await updateRecord(record._id, { approvalStatus: ApprovalStatus.Rejected });
                                    }}
                                    style={{ marginRight: 35 }}
                                >
                                    <div style={{ marginRight: 35, cursor: "pointer" }}>
                                        <Tooltip title={appString.reject}>
                                            <XCircle color={appColor.danger} />
                                        </Tooltip>
                                    </div>
                                </Popconfirm>
                                <Popconfirm
                                    title={appString.approveConfirmation}
                                    onConfirm={async () => {
                                        await updateRecord(record._id, { approvalStatus: ApprovalStatus.Approved });
                                    }}
                                    style={{ margin: 0 }}
                                >
                                    <div style={{ cursor: "pointer" }}>
                                        <Tooltip title={appString.approve}>
                                            <CheckCircle color={appColor.success} />
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
            key: 'actions',
            align: 'center',
            fixed: 'right',
            width: 120,
            render: (_, record) => (
                <div className="flex justify-center items-center gap-3">
                    <Tooltip title={appString.edit}>
                        {actionLoading === record._id ? (
                            <LoadingOutlined />
                        ) : (
                            <div onClick={() => handleEditClick(record)} style={{ cursor: 'pointer' }}>
                                <Edit color={appColor.secondPrimary} />
                            </div>
                        )}
                    </Tooltip>
                    <Popconfirm title={appString.deleteConfirmation} onConfirm={() => deleteRecord(record)}>
                        <Tooltip title={appString.delete}>
                            <Trash2 color={appColor.danger} style={{ cursor: 'pointer' }} />
                        </Tooltip>
                    </Popconfirm>
                    <Tooltip title={appString.view}>
                        <div onClick={() => handleViewClick(record)} style={{ cursor: 'pointer' }}>
                            <Eye color={appColor.primary} />
                        </div>
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <>
            <Card>
                <Table
                    rowKey={(record) => record._id}
                    loading={isLoading}
                    columns={columns}
                    dataSource={filteredData}
                    title={() => isDashboard ? (
                        <div className="flex items-center gap-2">
                            <AlertCircle color={appColor.warning} />
                            <div className="font-[550] text-[15px]">{appString.pendingEmp}</div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center gap-2 flex-wrap">
                            <Input
                                placeholder={appString.empSearchHint}
                                prefix={<Search />}
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                className="w-full flex-1 max-w-90"
                            />
                            <Button
                                type="primary"
                                icon={<UserPlus />}
                                onClick={handleAddClick}
                                loading={actionLoading === 'add'}
                            >
                                {!isMobile && appString.addEmployee}
                            </Button>
                        </div>
                    )}
                />
            </Card>
            {isModelOpen && (
                <EmpAddUpdateModel
                    isModelOpen={isModelOpen}
                    setIsModelOpen={setIsModelOpen}
                    selectedRecord={selectedRecord}
                    onSuccessCallback={handleUpdatedData}
                />
            )}
        </>
    );
}
