"use client";
import React, {useState} from "react";
import {
    Table,
    Card,
} from "antd";
import appKeys from "../../../utils/appKeys";
import {convertCamelCase} from "../../../utils/utils";
import CardActionsShow from "./CardActionsShow";
import {useRunOnce} from "../../../hooks/useRunOnce";
import {
    CommonActionButton,
    getActionColumn,
    getSwitchColumn, TableTitle
} from "../(panelCommonUtils)/CommonAction";
import appString from "../../../utils/appString";
import {CustomTag} from "../../../components/CommonComponents";
import ModuleModel from "./ModuleModel";
import {useApiServices} from "../../../api/useApiServices";

export default function Page() {
    const { isLoading, modules: callApi } = useApiServices();

    const [modules, setModules] = useState([]);
    const [actions, setActions] = useState([]);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const fetchModules = async () => {
        const data = await callApi.getAllModules();
        setModules(data || []);
    };

    const {fetchLoading} = useRunOnce(fetchModules);

    const deleteModule = async (record) => {
        const data = await callApi.deleteModule(record?._id);
        setModules(data || []);
    };

    const handleAddOrUpdate = async (moduleId, postData) => {
        await callApi.addUpdateModule(moduleId, postData, async (data) => {
            setIsModelOpen(false);
            setSelectedRecord(null);
            setModules(data || []);
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
        getSwitchColumn(appKeys.isForSuperAdmin, handleAddOrUpdate),
        getSwitchColumn(appKeys.isActive, handleAddOrUpdate),
        getActionColumn({
            handleEdit: handleEdit,
            handleDelete: deleteModule,
        })
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
                            <TableTitle title={appString.modules} />
                            <CommonActionButton
                                addBtnName={appString.addModule}
                                handleAdd={() => {
                                    setIsModelOpen(true);
                                    setSelectedRecord(null);
                                }}
                            />
                        </div>
                    )}
                    scroll={{x: "max-content"}}
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
                isLoading={isLoading}
                onSubmit={async (postData) => {
                    await handleAddOrUpdate(selectedRecord?._id, postData);
                }}
            />
        </div>
    );
}