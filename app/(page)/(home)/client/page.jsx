'use client';

import {useEffect, useMemo, useState} from 'react';
import {
    Avatar,
    Button, Card,
    Grid,
    Input,
    Popconfirm,
    Table,
    Tooltip,
} from 'antd';
import {Search, User, UserPlus} from '../../../utils/icons';
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

const {useBreakpoint} = Grid;

export default function Page() {
    const {clientsData, updateAppDataField} = useAppData();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [allData, setAllData] = useState(clientsData);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        setAllData(clientsData);
    }, [clientsData]);

    const handleUpdatedData = (data) => {
        updateAppDataField(AppDataFields.clientsData, data?.data);
    };

    const filteredData = useMemo(() => {
        if (!allData) return [];
        const query = searchText.toLowerCase();
        return allData.filter(
            data =>
                (
                    data?.clientName?.toLowerCase().includes(query)
                )
        );
    }, [allData, searchText]);

    const deleteRecord = async (record) => {
        await apiCall({
            method: HttpMethod.DELETE,
            url: `${endpoints.deleteClient}${record._id}`,
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

    const columns = [
        {
            title: appString.clientName,
            dataIndex: appKeys.clientName,
            key: appKeys.clientName,
            render: (clientName) => {
                return (
                    <div className="flex items-center gap-3">
                        <Avatar size="small" icon={<User size={13} />} style={{ backgroundColor: appColor.secondPrimary }}>
                            {getTwoCharacter(clientName)}
                        </Avatar>
                        {clientName}
                    </div>
                );
            },
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
                                icon={<UserPlus/>}
                                onClick={handleAddClick}
                                loading={actionLoading === 'add'}
                            >
                                {!isMobile && appString.addClient}
                            </Button>
                        </div>
                    )}
                />
            </Card>
            {isModelOpen && (
                <ClientModel
                    isModelOpen={isModelOpen}
                    setIsModelOpen={setIsModelOpen}
                    selectedRecord={selectedRecord}
                    onSuccessCallback={handleUpdatedData}
                />
            )}
        </>
    );
}
