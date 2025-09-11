"use client";
import React, {useState, useEffect, useRef} from "react";
import {
    Table,
    Button,
    Popconfirm,
    Card,
    Switch,
    Avatar,
} from "antd";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints";
import {
    DeleteOutlined,
    EditOutlined, LinkOutlined,
    PlusOutlined, EyeOutlined, EyeInvisibleOutlined, ReloadOutlined
} from "@ant-design/icons";
import appKeys from "../../../utils/appKeys";
import {Package} from "../../../utils/icons";
import {CompanyModal} from "./CompanyModal";
import appString from "../../../utils/appString";
import dayjs from "dayjs";
import {useActionLoading} from "../../../hooks/useActionLoading";
import {useRunOnce} from "../../../hooks/useRunOnce";
import CommonActionButton from "../(panelCommonUtils)/CommonActionButton";

export default function CompanyPage() {
    const { withLoading } = useActionLoading();
    const apiLoading = withLoading();

    const [modules, setModules] = useState([]);
    const [modulePermission, setModulePermission] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showToken, setShowToken] = useState({});
    const [loadingRecord, setLoadingRecord] = useState({});

    const fetchModules = async () => {
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.getAllModules,
            showSuccessMessage: false,
            successCallback: (data) => {
                if(data?.data) {
                    const filteredModules = (data?.data || []).filter(module => !module.isForSuperAdmin);
                    setModules(filteredModules);
                }
            },
        });
    };

    const fetchCompanies = async () => {
        setLoading(true);
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.getAllCompanies,
            showSuccessMessage: false,
            successCallback: (data) => {
                if(data?.data) {
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
                if(data?.data) {
                    setModulePermission(data?.data || []);
                }
            },
        });
    };

    const { fetchLoading } = useRunOnce([fetchRolePermission, fetchModules, fetchCompanies]);

    const deleteCompany = async (record) => {
        setLoading(true);
        await apiCall({
            method: HttpMethod.DELETE,
            url: endpoints.deleteCompany.replace(":id", record?._id),
            setIsLoading: setLoading,
            showSuccessMessage: true,
            successCallback: (data) => {
                setCompanies(data?.data || []);
            },
        });
    };

    const updateRecord = async (postData) => {
        setLoading(true);
        await apiCall({
            method: HttpMethod.POST,
            url: endpoints.addUpdateCompany,
            data: postData,
            isMultipart: true,
            setIsLoading: setLoading,
            showSuccessMessage: true,
            successCallback: () => {
                fetchCompanies();
                setIsModelOpen(false);
                setSelectedRecord(null);
            },
        });
    };

    const generateJoinToken = async (record) => {
        setLoadingRecord(prev => ({...prev, [record._id]: true}));
        await apiCall({
            method: HttpMethod.POST,
            url: endpoints.inviteUser,
            data: {
                companyId: record._id,
                roleId: record?.adminRoleId,
                emailAddress: record?.adminEmail,
            },
            setIsLoading: false,
            showSuccessMessage: true,
            successCallback: () => {
                setLoadingRecord(prev => ({...prev, [record._id]: false}));
                fetchCompanies();
            },
            errorCallback: () => {
                setLoadingRecord(prev => ({...prev, [record._id]: false}));
            }
        });
    };

    const handleEdit = (record) => {
        setSelectedRecord(record);
        setIsModelOpen(true);
    };

    const toggleShowToken = (id) => {
        setShowToken(prev => ({...prev, [id]: !prev[id]}));
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
        {title: "Admin Email", dataIndex: "adminEmail", key: "adminEmail"},
        {
            title: "Join Token",
            key: "joinToken",
            width: 200,
            render: (_, record) => {
                const isExpired = record.isAdminJoinTokenExpired;
                const visible = showToken[record._id];

                return record?.adminJoinToken ? (
                    <div
                        className={`flex items-center gap-3 ${isExpired ? "text-red-700" : ""} select-none font-medium`}
                    >
                        {visible ? record.adminJoinToken : '••••••••••'}
                        <div
                            className="cursor-pointer"
                            onClick={() => toggleShowToken(record._id)}
                            title={visible ? "Hide token" : "Show token"}
                        >
                            {visible ? <EyeInvisibleOutlined/> : <EyeOutlined/>}
                        </div>
                        <ReloadOutlined
                            onClick={() => generateJoinToken(record)}
                            className="cursor-pointer text-sky-600 text-sm"
                            title="Refresh token"
                        />
                    </div>
                ) : (
                    <Button
                        type="primary"
                        icon={<LinkOutlined/>}
                        loading={!!loadingRecord[record._id]}
                        onClick={() => generateJoinToken(record)}
                        size="middle"
                    >
                        Generate
                    </Button>
                );
            },
        },
        {
            title: "Is Active",
            dataIndex: "isActive",
            key: "isActive",
            width: 120,
            render: (value, record) => {
                const rowLoading = withLoading(`isActive-${record._id}`);
                return (
                    <Switch
                        checked={value}
                        loading={rowLoading.loading}
                        onChange={async (checked) => {
                            await rowLoading.run(async () => {
                                const postData = {
                                    companyId: record._id,
                                    isActive: checked,
                                };
                                await updateRecord(postData);
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
                loading={loading}
                onSubmit={async (postData) => {
                    await updateRecord(postData);
                }}
            />
        </div>
    );
}
