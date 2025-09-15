"use client";
import React, {useState} from "react";
import {
    Table,
    Form,
    Card,
    Switch,
} from "antd";
import {endpoints} from "../../../api/apiEndpoints";
import appKeys from "../../../utils/appKeys";
import {convertCamelCase, convertLowerCaseKey} from "../../../utils/utils";
import CardActionsShow from "./CardActionsShow";
import {useRunOnce} from "../../../hooks/useRunOnce";
import CommonActionButton from "../(panelCommonUtils)/CommonActionButton";
import appString from "../../../utils/appString";
import {CustomTag} from "../../../components/CommonComponents";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {useActionLoading} from "../../../hooks/useActionLoading";
import ModuleModel from "./ModuleModel";
import {useApiServices} from "../../../api/useApiServices";

export default function Page() {
    const { withLoading } = useActionLoading();
    const apiLoading = withLoading();

    const { isLoading, modules: callApi } = useApiServices();

    const [modules, setModules] = useState([]);
    const [actions, setActions] = useState([]);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const fetchModules = async () => {
        const data = await callApi.getAllModules();
        if (data?.data) setModules(data.data);
    };

    const {fetchLoading} = useRunOnce(fetchModules);

    const deleteModule = async (record) => {
        const data = await callApi.deleteModule(record?._id);
        if (data?.data) setModules(data.data);
    };

    const handleAddOrUpdate = async (moduleId, postData) => {
        await callApi.addUpdateModule(moduleId, postData, async (data) => {
            setIsModelOpen(false);
            setSelectedRecord(null);

            const refreshed = await callApi.getAllModules();
            if (refreshed?.data) setModules(refreshed.data);
        });
    };

    const handleEdit = (record) => {
        setSelectedRecord(record);
        setIsModelOpen(true);
    };

    const columns = [
        {
            title: appString.moduleName,
            dataIndex: appKeys.moduleName,
            key: appKeys.moduleName,
            render: (moduleName) => convertCamelCase(moduleName)
        },
        {
            title: appString.actions,
            dataIndex: appKeys.actions,
            key: appKeys.actions,
            render: (actions) => (
                <div className="flex flex-wrap gap-2 items-center">
                    {actions?.length > 0 ? actions.map(action => {
                        const filteredAction = actions.find(a => a._id === action._id);
                        return <div key={action._id}>
                            <CustomTag
                                color={filteredAction?.actionColor}
                                value={convertCamelCase(filteredAction?.actionName || '')}/>
                        </div>
                    }) : appString.noActions}
                </div>
            )
        },
        {
            title: appString.isForSuperAdmin,
            dataIndex: appKeys.isForSuperAdmin,
            key: appKeys.isForSuperAdmin,
            width: 140,
            render: (value, record) => {
                const rowLoading = withLoading(`isForSuperAdmin-${record._id}`);
                return (
                    <Switch
                        checked={value}
                        loading={rowLoading.loading}
                        onChange={async (checked) => {
                            await rowLoading.run(async () => {
                                const postData = {
                                    ...record,
                                    isForSuperAdmin: checked,
                                };
                                await handleAddOrUpdate(record._id, postData);
                            });
                        }}
                    />
                );
            },
        },
        {
            title: appString.isActive,
            dataIndex: appKeys.isActive,
            key: appKeys.isActive,
            width: 100,
            render: (value, record) => {
                const rowLoading = withLoading(`isActive-${record._id}`);
                return (
                    <Switch
                        checked={value}
                        loading={rowLoading.loading}
                        onChange={async (checked) => {
                            await rowLoading.run(async () => {
                                const postData = {
                                    ...record,
                                    isActive: checked,
                                };
                                await handleAddOrUpdate(record._id, postData);
                            });
                        }}
                    />
                );
            },
        },
        {
            title: appString.operations,
            key: appKeys.operations,
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <CommonActionButton
                    record={record}
                    handleEdit={handleEdit}
                    handleDelete={deleteModule}
                />
            ),
        }
    ];

    return (
        <div>
            <CardActionsShow onActionChange={(data) => {
                const defaultActions = data.map(action => ({
                    label: convertCamelCase(action.actionName),
                    value: action._id,
                    color: action.actionColor,
                }));
                setActions(defaultActions);
            }}/>
            <Card>
                <Table
                    dataSource={[...(modules || [])].reverse()}
                    columns={columns}
                    rowKey={appKeys._id}
                    title={() => (
                        <div className="flex justify-between items-center">
                            <div className="text-base font-semibold">Modules</div>
                            <CommonActionButton
                                addBtnName={appString.addModule}
                                handleAdd={() => {
                                    setIsModelOpen(true);
                                    setSelectedRecord(null);
                                }}
                            />
                        </div>
                    )}
                    loading={fetchLoading}
                    pagination={{pageSize: 100}}
                />
            </Card>

            <ModuleModel
                isModelOpen={isModelOpen}
                setIsModelOpen={setIsModelOpen}
                modules={modules}
                actions={actions}
                selectedRecord={selectedRecord}
                onSuccessCallback={async (data) => {
                    await fetchModules();
                    setSelectedRecord(null);
                }}
            />
        </div>
    );
}