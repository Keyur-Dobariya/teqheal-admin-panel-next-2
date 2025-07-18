import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber, Popconfirm,
    Row,
    Select,
    Switch,
    Table,
    TimePicker,
    Tooltip
} from "antd";
import appKeys from "../../../utils/appKeys";
import {Calendar, Clock, Edit, FilePlus, Home, Key, Monitor, Save, Trash2, UploadCloud} from "../../../utils/icons";
import appString from "../../../utils/appString";
import React, {useEffect, useState} from "react";
import appColor from "../../../utils/appColor";
import {convertCamelCase} from "../../../utils/utils";
import dayjs from "dayjs";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints";
import {antTag} from "../../../components/CommonComponents";
import ClientModel from "../../../models/ClientModel";
import OfficeUpdateAddEditModel from "../../../models/OfficeUpdateAddEditModel";
import {format} from "date-fns";
import {LoadingOutlined} from "@ant-design/icons";

const timeFormat = "HH:mm";

export const CardOfficeUpdates = ({isMobile}) => {

    const [isModelOpen, setIsModelOpen] = useState(false);

    const [allData, setAllData] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const getOfficeUpdates = async () => {
        return apiCall({
            method: HttpMethod.GET,
            url: endpoints.getOfficeUpdate,
            setIsLoading,
            showSuccessMessage: false,
            successCallback: (data) => {
                setAllData(data.data);
            },
        });
    };

    useEffect(() => {
        getOfficeUpdates();
    }, []);

    const deleteRecord = async (record) => {
        await apiCall({
            method: HttpMethod.DELETE,
            url: `${endpoints.deleteOfficeUpdate}${record._id}`,
            setIsLoading,
            successCallback: getOfficeUpdates,
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
            title: appString.title,
            dataIndex: appKeys.title,
            key: appKeys.title,
        },
        {
            title: appString.description,
            dataIndex: appKeys.description,
            key: appKeys.description,
        },
        {
            title: appString.showTime,
            dataIndex: appKeys.showTime,
            key: appKeys.showTime,
            render: (text) => (text ? format(new Date(text), 'yyyy-MM-dd HH:mm') : '-'),
        },
        {
            title: appString.isDaily,
            dataIndex: appKeys.isDaily,
            key: appKeys.isDaily,
            render: (text) => (text ? 'Yes' : 'No'),
        },
        {
            title: appString.isForDailyUpdate,
            dataIndex: appKeys.isForDailyUpdate,
            key: appKeys.isForDailyUpdate,
            render: (text) => (text ? 'Yes' : 'No'),
        },
        {
            title: appString.windowLink,
            dataIndex: appKeys.windowLink,
            key: appKeys.windowLink,
            render: (text) => (text ? <a href={text} target="_blank" rel="noopener noreferrer">Link</a> : '-'),
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
                    dataSource={allData}
                    columns={columns}
                    loading={isLoading}
                    title={() => (
                        <div className="flex justify-between items-center gap-3">
                            <div className="text-base font-medium">{appString.officeUpdates}</div>
                            <Button
                                type="primary"
                                icon={<FilePlus/>}
                                loading={actionLoading === 'add'}
                                onClick={handleAddClick}
                            >
                                {!isMobile && appString.addOfficeEvent}
                            </Button>
                        </div>
                    )}
                />
            </Card>
            {isModelOpen && (
                <OfficeUpdateAddEditModel
                    isModelOpen={isModelOpen}
                    setIsModelOpen={setIsModelOpen}
                    selectedRecord={selectedRecord}
                    onSuccessCallback={getOfficeUpdates}
                />
            )}
        </>
    )
}