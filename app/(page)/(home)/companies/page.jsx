"use client";
import React, {useState, useEffect, useRef} from "react";
import {
    Table,
    Button,
    Popconfirm,
    Card,
    Switch,
    Avatar, Tooltip,
} from "antd";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints";
import {
    DeleteOutlined,
    EditOutlined, LinkOutlined,
    PlusOutlined, EyeOutlined, EyeInvisibleOutlined, ReloadOutlined, ApartmentOutlined
} from "@ant-design/icons";
import appKeys from "../../../utils/appKeys";
import {Package} from "../../../utils/icons";
import {CompanyModal} from "./CompanyModal";
import appString from "../../../utils/appString";
import dayjs from "dayjs";
import {useActionLoading} from "../../../hooks/useActionLoading";
import {useRunOnce} from "../../../hooks/useRunOnce";
import CommonActionButton from "../(panelCommonUtils)/CommonActionButton";
import SafeAvatar from "../../../components/SafeAvatar";
import {ModuleTreeModal} from "./ModuleTreeModal";

export default function CompanyPage() {
    const {withLoading} = useActionLoading();
    const apiLoading = withLoading();

    const [modules, setModules] = useState([]);
    const [modulePermission, setModulePermission] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [isModuleModelOpen, setIsModuleModelOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const fetchModules = async () => {
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.getAllModules,
            showSuccessMessage: false,
            successCallback: (data) => {
                if (data?.data) {
                    const filteredModules = (data?.data || []).filter(module => !module.isForSuperAdmin);
                    setModules(filteredModules);
                }
            },
        });
    };

    const fetchCompanies = async () => {
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.getAllCompanies,
            showSuccessMessage: false,
            successCallback: (data) => {
                if (data?.data) {
                    setCompanies(data?.data || []);
                }
            },
        });
    };

    const fetchRolePermission = async () => {
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.getRolePermission,
            showSuccessMessage: false,
            successCallback: (data) => {
                if (data?.data) {
                    setModulePermission(data?.data || []);
                }
            },
        });
    };

    const {fetchLoading} = useRunOnce([fetchRolePermission, fetchModules, fetchCompanies]);

    const deleteCompany = async (record) => {
        await apiLoading.run(async () => {
            await apiCall({
                method: HttpMethod.DELETE,
                url: endpoints.deleteCompany(record?._id),
                showSuccessMessage: true,
                successCallback: (data) => {
                    if (data?.data) {
                        setCompanies(data?.data || []);
                    }
                },
            });
        });
    };

    const updateRecord = async (companyId, postData) => {
        await apiLoading.run(async () => {
            await apiCall({
                method: HttpMethod.POST,
                url: endpoints.addUpdateCompany(companyId),
                data: postData,
                isMultipart: true,
                showSuccessMessage: true,
                successCallback: () => {
                    fetchCompanies();
                    setIsModelOpen(false);
                    setSelectedRecord(null);
                },
            });
        });
    };

    const generateJoinToken = async (record) => {
        await withLoading(record._id).run(async () => {
            await apiCall({
                method: HttpMethod.POST,
                url: endpoints.inviteUser,
                data: {
                    companyId: record._id,
                    roleId: record?.adminRoleId,
                    emailAddress: record?.adminEmail,
                },
                showSuccessMessage: true,
                successCallback: () => {
                    fetchCompanies();
                },
            });
        });
    };

    const handleEdit = (record, isOpenTree = false) => {
        setSelectedRecord(record);
        if(isOpenTree) {
            setIsModuleModelOpen(true);
        } else {
            setIsModelOpen(true);
        }
    };

    const columns = [
        Table.EXPAND_COLUMN,
        {
            title: "Company Name",
            dataIndex: "companyName",
            key: "companyName",
            render: (text, record) => (
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <Avatar
                        src={record.companyIcon}
                        icon={!record.companyIcon && <Package/>}
                        size="default"
                        alt={text}
                    />
                    <span>{text}</span>
                </div>
            ),
        },
        {
            title: "Users",
            key: "companyUsers",
            align: 'center',
            render: (_, record) => {
                const users = record.companyUsers || [];
                return (
                    <Avatar.Group size="default"
                        max={{
                            count: 3,
                            style: {color: '#f56a00', backgroundColor: '#fde3cf'},
                        }}
                    >
                        {users.map(user => (
                            <Tooltip title={user.fullName || user.userName || 'User'} key={user._id}>
                                <SafeAvatar
                                    showName={true}
                                    userData={user}
                                    size="default"
                                />
                            </Tooltip>
                        ))}
                    </Avatar.Group>
                );
            },
        },
        {
            title: "Join Token",
            key: "joinToken",
            align: 'center',
            render: (_, record) => {
                const tokenExpireTime = record.invitedTokenExpireTime;
                const isExpired = tokenExpireTime && tokenExpireTime <= Date.now();

                return tokenExpireTime ? (
                    <div className={`flex justify-center items-center gap-3`}>
                        <div className={`w-22 flex flex-col justify-center items-center select-none`}>
                            <div className={`text-sm ${isExpired ? "text-red-700" : ""}`}>
                                {isExpired ? "Expired" : "Expires in"}
                            </div>
                            {!isExpired && <LiveCountdown expireTime={tokenExpireTime}/>}
                        </div>
                        <Button
                            title="Re-Generate Token"
                            size="middle"
                            type="primary"
                            shape="circle"
                            icon={<ReloadOutlined/>}
                            loading={withLoading(record._id).loading}
                            onClick={() => generateJoinToken(record)}
                        />
                    </div>
                ) : (
                    <Button
                        title="Generate New Token"
                        type="primary"
                        icon={<LinkOutlined/>}
                        loading={withLoading(record._id).loading}
                        onClick={() => generateJoinToken(record)}
                        size="middle"
                    >
                        Generate
                    </Button>
                );
            },
        },
        {
            title: "Manage Permission",
            key: "permission",
            width: 180,
            align: "center",
            render: (_, record) => (
                <CommonActionButton
                    addBtnIcon={<ApartmentOutlined />}
                    handleAdd={() => handleEdit(record, true)}
                />
            ),
        },
        {
            title: "Is Active",
            dataIndex: "isActive",
            key: "isActive",
            align: 'center',
            render: (value, record) => {
                const rowLoading = withLoading(`isActive-${record._id}`);
                return (
                    <Switch
                        size="small"
                        checked={value}
                        loading={rowLoading.loading}
                        onChange={async (checked) => {
                            await rowLoading.run(async () => {
                                const postData = {
                                    ...record,
                                    isActive: checked,
                                };
                                await updateRecord(record._id, postData);
                            });
                        }}
                    />
                );
            },
        },
        {
            title: "Operations",
            key: "operations",
            width: 150,
            fixed: "right",
            render: (_, record) => (
                <CommonActionButton
                    record={record}
                    handleEdit={handleEdit}
                    handleDelete={deleteCompany}
                />
            ),
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
                {extraFieldCommon("Company Website", record?.companyWebsite)}
                {extraFieldCommon("Company Address", record?.companyAddress)}
                {extraFieldCommon("Max Users", record?.maxUsers)}
                {extraFieldCommon("Admin Email", record?.adminEmail)}
                {extraFieldCommon(appString.startDate, dayjs(record.startDate).format("DD, MMM YYYY"))}
                {extraFieldCommon(appString.endDate, dayjs(record.endDate).format("DD, MMM YYYY"))}
                {extraFieldCommon(appString.createdAt, dayjs(record.createdAt).format("DD, MMM YYYY [at] hh:mm a"))}
            </div>
        );
    }

    return (
        <div>
            <Card>
                <Table
                    dataSource={companies}
                    columns={columns}
                    rowKey={appKeys._id}
                    expandable={{
                        expandedRowRender: record => (
                            tableExpandRows(record)
                        ),
                    }}
                    scroll={{x: "max-content"}}
                    title={() => (
                        <div className="flex justify-between items-center">
                            <div className="text-base font-semibold">Companies</div>
                            <CommonActionButton
                                addBtnName={appString.addCompany}
                                handleAdd={() => {
                                    setSelectedRecord(null);
                                    setIsModelOpen(true);
                                }}
                            />
                        </div>
                    )}
                    loading={fetchLoading}
                />
            </Card>

            <CompanyModal
                isModelOpen={isModelOpen}
                setIsModelOpen={setIsModelOpen}
                selectedRecord={selectedRecord}
                setSelectedRecord={setSelectedRecord}
                modules={modules}
                modulePermission={modulePermission}
                loading={apiLoading.loading}
                onSubmit={async (postData) => {
                    await updateRecord(selectedRecord?._id, postData);
                }}
            />

            {(selectedRecord && isModuleModelOpen) && <ModuleTreeModal
                isModuleModelOpen={isModuleModelOpen}
                setIsModuleModelOpen={setIsModuleModelOpen}
                modules={modules}
                adminPermissions={selectedRecord?.adminPermissions}
                userPermissions={selectedRecord?.userPermissions}
                loading={apiLoading.loading}
                onTabSubmit={async (adminUpdatedPermissions, userUpdatedPermissions) => {
                    const postData = {
                        adminPermissions: adminUpdatedPermissions,
                        userPermissions: userUpdatedPermissions,
                    };
                    await updateRecord(selectedRecord?._id, postData);
                    setIsModuleModelOpen(false);
                }}
            />}
        </div>
    );
}

export function LiveCountdown({expireTime}) {
    const [remainingMs, setRemainingMs] = useState(expireTime - Date.now());

    useEffect(() => {
        if (!expireTime) return;
        const interval = setInterval(() => {
            const diff = expireTime - Date.now();
            setRemainingMs(diff > 0 ? diff : 0);
        }, 1000);

        return () => clearInterval(interval);
    }, [expireTime]);

    const formatCountdown = (ms) => {
        if (ms <= 0) return "Expired";
        const seconds = Math.floor(ms / 1000) % 60;
        const minutes = Math.floor(ms / (1000 * 60)) % 60;
        const hours = Math.floor(ms / (1000 * 60 * 60));
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    if (remainingMs <= 0) {
        return <span className="text-red-700 font-medium">Expired</span>;
    }

    return (
        <div className="text-[14px] text-green-700 font-medium">
            {formatCountdown(remainingMs)}
        </div>
    );
}
