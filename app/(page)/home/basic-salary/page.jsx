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
import {Eye, EyeOff, FilePlus, Search} from '../../../utils/icons';
import {Edit, Trash2} from '../../../utils/icons';
import {useAppData, AppDataFields} from '../../../masterData/AppDataContext';
import apiCall, {HttpMethod} from '../../../api/apiServiceProvider';
import {endpoints} from '../../../api/apiEndpoints';
import appString from '../../../utils/appString';
import appKeys from '../../../utils/appKeys';
import dayjs from 'dayjs';
import {decryptValue, profilePhotoManager} from "../../../utils/utils";
import {antTag} from "../../../components/CommonComponents";
import {LoadingOutlined} from "@ant-design/icons";
import appColor from "../../../utils/appColor";
import BasicSalaryModel from "../../../models/BasicSalaryModel";

const {useBreakpoint} = Grid;

export default function Page() {
    const {activeUsersData, basicSalaryData, updateAppDataField} = useAppData();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [allData, setAllData] = useState(basicSalaryData);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const [isShowAmounts, setIsShowAmounts] = useState(false);

    useEffect(() => {
        setAllData(basicSalaryData);
    }, [basicSalaryData]);

    const handleUpdatedData = (data) => {
        updateAppDataField(AppDataFields.basicSalaryData, data?.data);
    };

    const filteredData = useMemo(() => {
        if (!allData) return [];
        const query = searchText.toLowerCase();
        return allData.filter(
            data =>
                (
                    data?.user?.fullName?.toLowerCase().includes(query)
                )
        );
    }, [allData, searchText]);

    const deleteRecord = async (record) => {
        await apiCall({
            method: HttpMethod.DELETE,
            url: `${endpoints.deleteBasicSalary}${record._id}`,
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
            title: appString.fullName,
            dataIndex: appKeys.user,
            key: 'user.fullName',
            render: (text, record) => {
                const rowUserRecord = record?.user;
                return (
                    <div className="flex items-center gap-2">
                        <Avatar src={profilePhotoManager({url: rowUserRecord?.profilePhoto, gender: rowUserRecord?.gender})} size="default" />
                        <div className="flex-1 font-medium">{rowUserRecord?.fullName}</div>
                    </div>
                );
            },
        },
        {
            title: appString.basicSalary,
            dataIndex: appKeys.basicSalary,
            key: appKeys.basicSalary,
            render: (basicSalary) => {
                console.log("dxfgdsfgd", basicSalary)
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
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outlined"
                                    icon={isShowAmounts ? <EyeOff /> : <Eye />}
                                    onClick={() => setIsShowAmounts(!isShowAmounts)}
                                >
                                    {!isMobile && (isShowAmounts ? appString.hideAmount : appString.showAmount)}
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<FilePlus/>}
                                    onClick={handleAddClick}
                                    loading={actionLoading === 'add'}
                                >
                                    {!isMobile && appString.addBasicSalary}
                                </Button>
                            </div>
                        </div>
                    )}
                />
            </Card>
            {isModelOpen && (
                <BasicSalaryModel
                    isModelOpen={isModelOpen}
                    setIsModelOpen={setIsModelOpen}
                    activeUsersData={activeUsersData}
                    selectedRecord={selectedRecord}
                    onSuccessCallback={handleUpdatedData}
                />
            )}
        </>
    );
}
