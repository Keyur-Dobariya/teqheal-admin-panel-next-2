'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {
    Button, Card,
    Input,
    Table,
} from 'antd';
import {Eye, EyeOff, FilePlus, Search} from '../../../utils/icons';
import {useAppData, AppDataFields} from '../../../masterData/AppDataContext';
import appString from '../../../utils/appString';
import appKeys from '../../../utils/appKeys';
import dayjs from 'dayjs';
import {decryptValue} from "../../../utils/utils";
import {antTag} from "../../../components/CommonComponents";
import BasicSalaryModel from "../../../models/BasicSalaryModel";
import SafeAvatar from "../../../components/SafeAvatar";
import useHomePageLayout from "../../../hooks/useHomePageLayout";
import {usePermission} from "../../../hooks/usePermission";
import {mActions} from "../../../utils/enum";
import {routeConfig} from "../../../utils/pageRoutes";
import { CommonActionButton } from "../(panelCommonUtils)/CommonAction";
import {useApiServices} from "../../../api/useApiServices";

export default function Page() {
    const { isLoading, basicSalary: callApi } = useApiServices();

    const {hasPermission} = usePermission();
    const canAdd = !!hasPermission(mActions.add, routeConfig.basicSalary.key);
    const canEdit = !!hasPermission(mActions.edit, routeConfig.basicSalary.key);
    const canDelete = !!hasPermission(mActions.delete, routeConfig.basicSalary.key);

    const {activeUsersData, basicSalaryData, updateAppDataField} = useAppData();
    const {isMobile} = useHomePageLayout();

    const [allData, setAllData] = useState(basicSalaryData);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);

    const [isShowAmounts, setIsShowAmounts] = useState(false);

    useEffect(() => {
        setAllData(basicSalaryData);
    }, [basicSalaryData]);

    const handleUpdatedData = (data) => {
        updateAppDataField(AppDataFields.basicSalaryData, data);
    };

    const filteredData = useMemo(() => {
        if (!allData) return [];
        const query = searchText.toLowerCase();
        return allData.filter(
            data =>
                (
                    data?.user?.userName?.toLowerCase().includes(query)
                )
        );
    }, [allData, searchText]);

    const deleteRecord = async (record) => {
        const data = await callApi.deleteBasicSalary(record?._id);
        handleUpdatedData(data || []);
    };

    const handleAddUpdateRecord = async (formValues) => {
        await callApi.addUpdateBasicSalary(selectedRecord?._id, formValues, async (data) => {
            setIsModelOpen(false);
            setSelectedRecord(null);
            handleUpdatedData(data || []);
        });
    };

    const handleAddClick = () => {
        setIsModelOpen(true);
    };

    const handleEditClick = (record) => {
        setSelectedRecord(record);
        setIsModelOpen(true);
    };

    const columns = [
        {
            title: appString.userName,
            dataIndex: appKeys.user,
            key: 'user.userName',
            render: (text, record) => {
                const rowUserRecord = record?.user;
                return (
                    <div className="flex items-center gap-2">
                        <SafeAvatar
                            userData={rowUserRecord}
                            size="default"
                        />
                        <div className="flex-1 font-medium">{rowUserRecord?.userName}</div>
                    </div>
                );
            },
        },
        {
            title: appString.basicSalary,
            dataIndex: appKeys.basicSalary,
            key: appKeys.basicSalary,
            render: (basicSalary) => {
                return antTag(!isShowAmounts ? "***" : decryptValue(basicSalary), "green");
            },
        },
        {
            title: appString.code,
            dataIndex: appKeys.code,
            key: appKeys.code,
            render: (code) => {
                return antTag(!isShowAmounts ? "***" : code, "blue");
            },
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
            title: appString.action,
            dataIndex: appKeys.operation,
            fixed: "right",
            width: 50,
            hidden: (!canEdit && !canDelete),
            render: (_, record) => (
                <CommonActionButton
                    record={record}
                    handleEdit={canEdit && handleEditClick}
                    handleDelete={canDelete && deleteRecord}
                />
            ),
        },
    ];

    return (
        <>
            <Card>
                <Table
                    rowKey={(record) => record._id}
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
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outlined"
                                    icon={isShowAmounts ? <EyeOff /> : <Eye />}
                                    onClick={() => setIsShowAmounts(!isShowAmounts)}
                                >
                                    {!isMobile && (isShowAmounts ? appString.hideAmount : appString.showAmount)}
                                </Button>
                                {canAdd && <CommonActionButton
                                    addBtnName={appString.addBasicSalary}
                                    addBtnIcon={<FilePlus/>}
                                    handleAdd={handleAddClick}
                                />}
                            </div>
                        </div>
                    )}
                    scroll={{x: "max-content"}}
                />
            </Card>
            {isModelOpen && (
                <BasicSalaryModel
                    isModelOpen={isModelOpen}
                    setIsModelOpen={setIsModelOpen}
                    activeUsersData={activeUsersData}
                    selectedRecord={selectedRecord}
                    loading={isLoading}
                    onSubmit={handleAddUpdateRecord}
                />
            )}
        </>
    );
}
