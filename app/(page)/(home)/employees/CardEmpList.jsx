'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {
    Button, Card,
    Input,
    Popconfirm, Row,
    Switch,
    Table,
} from 'antd';
import {AlertCircle, Search} from '../../../utils/icons';
import {useAppData, AppDataFields} from '../../../masterData/AppDataContext';
import appString from '../../../utils/appString';
import appKeys from '../../../utils/appKeys';
import {ApprovalStatus, DateTimeFormat, mActions} from '../../../utils/enum';
import {appColor} from '../../../utils/appColor';
import dayjs from 'dayjs';
import EmpAddUpdateModel from "../../../models/EmpAddUpdateModel";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    UserAddOutlined
} from "@ant-design/icons";
import {pageRoutes, routeConfig} from "../../../utils/pageRoutes";
import SafeAvatar from "../../../components/SafeAvatar";
import useHomePageLayout from "../../../hooks/useHomePageLayout";
import {usePermission} from "../../../hooks/usePermission";
import {CustomTag, TableExtraData} from "../../../components/CommonComponents";
import {CommonActionButton} from "../(panelCommonUtils)/CommonAction";
import {useActionLoading} from "../../../hooks/useActionLoading";
import {useApiServices} from "../../../api/useApiServices";
import {approvalStatusColor, capitalizeLastPathSegment} from "../../../utils/utils";

export default function CardEmpList({isDashboard}) {
    const { users: {deleteUser, changeUserStatus} } = useApiServices();
    const {withLoading} = useActionLoading();
    const {hasPermission} = usePermission();
    const canAdd = !!hasPermission(mActions.add, routeConfig.employees.key);
    const canEdit = !!hasPermission(mActions.edit, routeConfig.employees.key);
    const canDelete = !!hasPermission(mActions.delete, routeConfig.employees.key);
    const canViewDetail = !!hasPermission(mActions.viewDetail, routeConfig.employees.key);
    const canManageDetail = !!hasPermission(mActions.manage, routeConfig.employees.key);
    const canManageStatus = !!hasPermission(mActions.status, routeConfig.employees.key);
    const canReject = !!hasPermission(mActions.reject, routeConfig.employees.key);
    const canApprove = !!hasPermission(mActions.approve, routeConfig.employees.key);

    const {usersData, updateAppDataField} = useAppData();
    const {push} = useHomePageLayout();

    const [allData, setAllData] = useState(usersData);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);

    useEffect(() => {
        setAllData(usersData);
    }, [usersData]);

    const handleUpdatedData = (data) => {
        updateAppDataField(AppDataFields.usersData, data);
    };

    const filteredData = useMemo(() => {
        if (!allData) return [];
        const query = searchText.toLowerCase();
        return allData?.filter(
            data =>
                isDashboard ? data.approvalStatus === ApprovalStatus.Pending : data.approvalStatus === ApprovalStatus.Approved &&
                    (
                        data.userName?.toLowerCase().includes(query) ||
                        data.emailAddress?.toLowerCase().includes(query) ||
                        data.mobileNumber?.includes(query) ||
                        data.employeeCode?.toLowerCase().includes(query)
                    )
        );
    }, [allData, searchText]);

    const updateStatus = async (id, postData) => {
        await changeUserStatus(id, postData, async (data) => {
            handleUpdatedData(data || []);
        });
    };

    const deleteRecord = async (record) => {
        const data = await deleteUser(record?._id);
        handleUpdatedData(data || []);
    };

    const toggleUserStatus = async (user, checked) => {
        await withLoading(user._id).run(async () => {
            await updateStatus(user._id, {isActive: checked});
        });
    };

    const handleAddClick = () => {
        setSelectedRecord(null);
        setIsModelOpen(true);
    };

    const handleEditClick = (record) => {
        setSelectedRecord(record);
        setIsModelOpen(true);
    };

    const handleViewClick = (record) => {
        push(`${pageRoutes.employeeDetail}?user=${record.employeeCode}`);
    };

    const columns = [
        Table.EXPAND_COLUMN,
        {
            title: appString.userName,
            dataIndex: appKeys.userName,
            key: appKeys.userName,
            sorter: (a, b) => a.userName.localeCompare(b.userName),
            render: (text, record) => (
                <div className="flex items-center gap-2">
                    <SafeAvatar
                        userData={record}
                        size="default"
                    />
                    <div className="flex-1 font-medium">{record.userName}</div>
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

                if (record.approvalStatus === ApprovalStatus.Approved && canManageStatus) {
                    return (
                        <Switch
                            size="small"
                            loading={withLoading(record._id).loading}
                            checked={record.isActive}
                            onChange={(checked) => toggleUserStatus(record, checked)}
                        />
                    )
                }

                if (record.approvalStatus === ApprovalStatus.Pending && (canReject || canApprove)) {
                    return (
                        <div className="flex items-center justify-center">
                            {
                                canReject && <Popconfirm
                                    title={appString.rejectConfirmation}
                                    onConfirm={async () => {
                                        await updateStatus(record._id, {approvalStatus: ApprovalStatus.Rejected});
                                    }}>
                                    <Button
                                        title={appString.reject}
                                        variant="text"
                                        color="danger"
                                        icon={<CloseCircleOutlined/>}/>
                                </Popconfirm>
                            }
                            {
                                canApprove && <Popconfirm
                                    title={appString.approveConfirmation}
                                    onConfirm={async () => {
                                        await updateStatus(record._id, {approvalStatus: ApprovalStatus.Approved});
                                    }}>
                                    <Button
                                        title={appString.approve}
                                        variant="text"
                                        color="green"
                                        icon={<CheckCircleOutlined/>}/>
                                </Popconfirm>
                            }
                        </div>
                    )
                }

                return <CustomTag color={color} value={record.approvalStatus.toUpperCase()}/>;
            },
        },
        {
            title: appString.action,
            align: 'center',
            fixed: 'right',
            hidden: (!canEdit && !canDelete && !canViewDetail),
            render: (_, record) => (
                <CommonActionButton
                    record={record}
                    handleEdit={canEdit && handleEditClick}
                    handleDelete={canDelete && deleteRecord}
                    handleDetailView={canViewDetail && handleViewClick}
                />
            ),
        },
    ];

    const tableExpandRows = (record) => {
        return (
            <Row gutter={[16, 25]}>
                <TableExtraData title={appString.empCode} value={record?.employeeCode} />
                <TableExtraData title={appString.role} value={record?.role?.roleName} isTag={true} tagColor={appColor.secondPrimary} />
                <TableExtraData title={appString.dateOfBirth} value={record?.dateOfBirth ? dayjs(record?.dateOfBirth).format(DateTimeFormat.DDMMMMYYYY) : null} />
                <TableExtraData title={appString.gender} value={record?.gender} />
                <TableExtraData title={appString.bloodGroup} value={record?.bloodGroup} />
                <TableExtraData title={appString.approvalStatus} value={capitalizeLastPathSegment(record?.approvalStatus)} isTag={true} tagColor={approvalStatusColor(record?.approvalStatus)} />
            </Row>
        );
    }

    return (
        <>
            <Card>
                <Table
                    rowKey={(record) => record._id}
                    columns={columns}
                    dataSource={filteredData}
                    scroll={{x: "max-content"}}
                    title={() => isDashboard ? (
                        <div className="flex items-center gap-2">
                            <AlertCircle color={appColor.warning}/>
                            <div className="font-[550] text-[15px]">{appString.pendingEmp}</div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center gap-2 flex-wrap">
                            <Input
                                placeholder={appString.empSearchHint}
                                prefix={<Search/>}
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                className="w-full flex-1 max-w-90"
                            />
                            {canAdd && <CommonActionButton
                                addBtnName={appString.addEmployee}
                                addBtnIcon={<UserAddOutlined />}
                                handleAdd={handleAddClick}
                            />}
                        </div>
                    )}
                    expandable={{
                        expandedRowRender: record => (
                            tableExpandRows(record)
                        ),
                    }}
                />
            </Card>
            {isModelOpen && (
                <EmpAddUpdateModel
                    isModelOpen={isModelOpen}
                    setIsModelOpen={setIsModelOpen}
                    selectedRecord={selectedRecord}
                    canManageDetail={canManageDetail}
                />
            )}
        </>
    );
}
