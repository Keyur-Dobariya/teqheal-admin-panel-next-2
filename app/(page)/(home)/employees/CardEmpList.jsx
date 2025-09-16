'use client';

import {useEffect, useMemo, useState} from 'react';
import {
    Button, Card,
    Input,
    Popconfirm,
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
import {CustomTag} from "../../../components/CommonComponents";
import {CommonActionButton} from "../(panelCommonUtils)/CommonAction";
import {useActionLoading} from "../../../hooks/useActionLoading";
import {useApiServices} from "../../../api/useApiServices";
import {useRunOnce} from "../../../hooks/useRunOnce";

export default function CardEmpList({isDashboard}) {
    const { isLoading, roles: {getAllRoles}, users: {addUpdateUser, deleteUser} } = useApiServices();
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
    const [roles, setRoles] = useState([]);

    const fetchRoles = async () => {
        const data = await getAllRoles();
        setRoles(data || []);
    };

    const {fetchLoading} = useRunOnce(fetchRoles);

    useEffect(() => {
        setAllData(usersData);
    }, [usersData]);

    const handleUpdatedData = (data) => {
        updateAppDataField(AppDataFields.usersData, data);
    };

    const filteredData = useMemo(() => {
        if (!allData) return [];
        console.log("allData=>", allData)
        const query = searchText.toLowerCase();
        return allData.filter(
            data =>
                isDashboard ? data.approvalStatus === ApprovalStatus.Pending : data.approvalStatus === ApprovalStatus.Approved &&
                    (
                        data.fullName?.toLowerCase().includes(query) ||
                        data.emailAddress?.toLowerCase().includes(query) ||
                        data.mobileNumber?.includes(query) ||
                        data.employeeCode?.toLowerCase().includes(query)
                    )
        );
    }, [allData, searchText]);

    const updateRecord = async (id, postData) => {
        await addUpdateUser(id, postData, async (data) => {
            setIsModelOpen(false);
            setSelectedRecord(null);
            handleUpdatedData(data || []);
        });
    };

    const deleteRecord = async (record) => {
        const data = await deleteUser(record?._id);
        handleUpdatedData(data || []);
    };

    const toggleUserStatus = async (user, checked) => {
        await withLoading(user._id).run(async () => {
            await updateRecord(user._id, {isActive: checked});
        });
    };

    const handleAddClick = () => {
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
            align: 'center',
            render: record => record?.role ? record?.role?.roleName : 'N/A',
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
                                        await updateRecord(record._id, {approvalStatus: ApprovalStatus.Rejected});
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
                                        await updateRecord(record._id, {approvalStatus: ApprovalStatus.Approved});
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

    return (
        <>
            <Card>
                <Table
                    rowKey={(record) => record._id}
                    loading={fetchLoading}
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
                />
            </Card>
            {isModelOpen && (
                <EmpAddUpdateModel
                    roles={roles}
                    isModelOpen={isModelOpen}
                    setIsModelOpen={setIsModelOpen}
                    selectedRecord={selectedRecord}
                    isLoading={isLoading}
                    canManageDetail={canManageDetail}
                    onSubmit={async (formData) => {
                        await updateRecord(selectedRecord._id, formData);
                    }}
                />
            )}
        </>
    );
}
