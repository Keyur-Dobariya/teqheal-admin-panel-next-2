'use client';

import {useEffect, useMemo, useState} from 'react';
import {
    Avatar,
    Button, Card,
    Grid,
    Input,
    Popconfirm, Switch,
    Table,
    Tooltip,
} from 'antd';
import {FilePlus, Search, User, UserPlus} from '../../../utils/icons';
import {Edit, Trash2} from '../../../utils/icons';
import {useAppData, AppDataFields} from '../../../masterData/AppDataContext';
import apiCall, {HttpMethod} from '../../../api/apiServiceProvider';
import {endpoints} from '../../../api/apiEndpoints';
import appString from '../../../utils/appString';
import appKeys from '../../../utils/appKeys';
import dayjs from 'dayjs';
import {getTwoCharacter} from "../../../utils/utils";
import {LoadingOutlined} from "@ant-design/icons";
import appColor from "../../../utils/appColor";
import ClientModel from "../../../models/ClientModel";
import {isAdmin} from "../../../dataStorage/DataPref";
import {
    getIconByKey,
    getLabelByKey,
    projectTypeLabel,
    taskColumnStatusLabel,
    taskPriorityLabel
} from "../../../utils/enum";
import ProjectModel from "../../../models/ProjectModel";

const {useBreakpoint} = Grid;

export default function Page() {
    const {activeUsersData, activeClientData, projectsData, updateAppDataField} = useAppData();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [allData, setAllData] = useState(projectsData);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [switchLoading, setSwitchLoading] = useState(null);

    useEffect(() => {
        setAllData(projectsData);
    }, [projectsData]);

    const handleUpdatedData = (data) => {
        updateAppDataField(AppDataFields.projectsData, data?.data);
    };

    const filteredData = useMemo(() => {
        if (!allData) return [];
        const query = searchText.toLowerCase();
        return allData.filter(
            data =>
                (
                    data?.projectId?.toLowerCase().includes(query) ||
                    data?.projectName?.toLowerCase().includes(query) ||
                    data?.projectDescription?.toLowerCase().includes(query) ||
                    data?.clientName?.toLowerCase().includes(query) ||
                    data?.projectType?.toLowerCase().includes(query) ||
                    data?.tags?.toLowerCase().includes(query)
                )
        );
    }, [allData, searchText]);

    const deleteRecord = async (record) => {
        await apiCall({
            method: HttpMethod.DELETE,
            url: `${endpoints.deleteProject}${record._id}`,
            setIsLoading,
            successCallback: handleUpdatedData,
        });
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

    const toggleChangeStatus = async (record, checked) => {
        const loadingId = record._id;
        setSwitchLoading(loadingId);

        await apiCall({
            method: HttpMethod.POST,
            url: `${endpoints.updateProject}/${record._id}`,
            data: {isActive: checked},
            setIsLoading: false,
            successCallback: handleUpdatedData,
        });

        setSwitchLoading(null);
    };

    const columns = [
        {
            title: appString.projectName,
            dataIndex: appKeys.projectName,
            key: appKeys.projectName,
        },
        {
            title: appString.projectType,
            dataIndex: appKeys.projectType,
            key: appKeys.projectType,
            hidden: !isAdmin(),
            render: (projectType) => {
                if (!projectType) return "";
                return getLabelByKey(projectType, projectTypeLabel);
            },
        },
        {
            title: appString.projectStatus,
            dataIndex: appKeys.projectStatus,
            key: appKeys.projectStatus,
            hidden: !isAdmin(),
            render: (projectStatus) => {
                if (!projectStatus) return "";
                return getLabelByKey(projectStatus, taskColumnStatusLabel);
            },
        },
        {
            title: appString.projectPriority,
            dataIndex: appKeys.projectPriority,
            key: appKeys.projectPriority,
            hidden: !isAdmin(),
            render: (projectPriority) => {
                if (!projectPriority) return "";
                return (
                    <div className="flex items-center gap-2">
                        {getIconByKey(projectPriority, taskPriorityLabel)}
                        {getLabelByKey(projectPriority, taskPriorityLabel)}
                    </div>
                );
            },
        },
        {
            title: "Active",
            dataIndex: appKeys.isActive,
            key: appKeys.isActive,
            width: 120,
            hidden: !isAdmin(),
            render: (_, record) => (
                <Switch
                    size="small"
                    loading={switchLoading === record._id}
                    checked={record.isActive}
                    onChange={checked => toggleChangeStatus(record, checked)}
                />
            ),
        },
        {
            title: appString.createdAt,
            dataIndex: appKeys.createdAt,
            key: appKeys.createdAt,
            render: (createdAt) => {
                return dayjs(createdAt).format("DD, MMM YYYY [at] hh:mm a");
            },
        },
        {
            title: appString.action,
            dataIndex: appKeys.operation,
            fixed: "right",
            width: 50,
            render: (_, record) => (
                <div className="flex justify-center items-center gap-5">
                    <Tooltip title={appString.edit}>
                        {actionLoading === record._id ? (
                            <LoadingOutlined />
                        ) : (
                            <div onClick={() => handleEditClick(record)} style={{cursor: 'pointer'}}>
                                <Edit color={appColor.secondPrimary} />
                            </div>
                        )}
                    </Tooltip>
                    <Popconfirm title={appString.deleteConfirmation} onConfirm={() => deleteRecord(record)}>
                        <Tooltip title={appString.delete}>
                            <Trash2 color={appColor.danger} style={{cursor: 'pointer'}}/>
                        </Tooltip>
                    </Popconfirm>
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
                    title={() => (
                        <div className="flex justify-between items-center gap-2 flex-wrap">
                            <Input
                                placeholder={appString.searchHint}
                                prefix={<Search/>}
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                className="w-full flex-1 max-w-90"
                            />
                            <Button
                                type="primary"
                                icon={<FilePlus/>}
                                onClick={handleAddClick}
                                loading={actionLoading === 'add'}
                            >
                                {!isMobile && appString.addProject}
                            </Button>
                        </div>
                    )}
                />
            </Card>
            {isModelOpen && (
                <ProjectModel
                    isModelOpen={isModelOpen}
                    setIsModelOpen={setIsModelOpen}
                    activeUsersData={activeUsersData}
                    clientData={activeClientData}
                    selectedRecord={selectedRecord}
                    onSuccessCallback={handleUpdatedData}
                />
            )}
        </>
    );
}
