"use client";
import React, {useState, useEffect, useRef} from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Popconfirm,
    Card,
    Switch,
    Row,
    Col,
} from "antd";
import apiCall, { HttpMethod } from "../../../api/apiServiceProvider";
import { endpoints } from "../../../api/apiEndpoints";
import appKeys from "../../../utils/appKeys";
import {DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons";
import {convertCamelCase, convertLowerCaseKey} from "../../../utils/utils";
import {routeConfig} from "../../../utils/pageRoutes";
import CardActionsShow from "./CardActionsShow";

export default function Page() {
    const [modules, setModules] = useState([]);
    const [actions, setActions] = useState([]);
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const [selectedModuleId, setSelectedModuleId] = useState(null);
    const [loading, setLoading] = useState(false);
    const isAllPermission = Form.useWatch("isAllPermission", form);
    const fetchTriggered = useRef(false);

    useEffect(() => {
        if (!fetchTriggered.current) {
            fetchTriggered.current = true;
            fetchModules();
        }
    }, []);

    const fetchModules = async () => {
        setLoading(true);
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.getAllModules,
            setIsLoading: setLoading,
            showSuccessMessage: false,
            successCallback: (data) => {
                setModules(data?.data);
            },
        });
    };

    const deleteModule = async (id) => {
        setLoading(true);
        await apiCall({
            method: HttpMethod.DELETE,
            url: endpoints.deleteModule.replace(':id', id),
            setIsLoading: setLoading,
            showSuccessMessage: true,
            successCallback: (data) => {
                setModules(data?.data);
            },
        });
    };

    const handleAddOrUpdate = async (values) => {
        let actions = [];
        values?.actions.map(action => {
            actions.push({
                _id: action.value,
            })
        })
        const postData = {
            moduleName: convertLowerCaseKey(values.moduleName.trim()),
            description: values.description,
            actions: actions,
            ...(selectedModuleId ? { moduleId: selectedModuleId } : {}),
        };

        await updateRecord(postData);
    };

    const updateRecord = async (postData) => {
        setLoading(true);
        await apiCall({
            method: HttpMethod.POST,
            url: endpoints.addUpdateModule,
            data: postData,
            setIsLoading: setLoading,
            showSuccessMessage: true,
            successCallback: () => {
                fetchModules();
                setOpen(false);
                form.resetFields();
                setSelectedModuleId(null);
            },
        });
    };

    const handleEdit = (record) => {
        setSelectedModuleId(record._id);
        let actions = [];
        record?.actions.map(action => {
            actions.push({
                label: convertCamelCase(action.actionName),
                value: action._id,
                color: action.actionColor,
            })
        })
        form.setFieldsValue({
            ...record,
            moduleName: convertCamelCase(record.moduleName),
            actions: actions,
        });
        setOpen(true);
    };

    const columns = [
        { title: "Module Name", dataIndex: "moduleName", key: "moduleName", render: (moduleName) => convertCamelCase(moduleName) },
        {
            title: "Actions",
            dataIndex: "actions",
            key: "actions",
            render: (actions) => (
                <div className="flex flex-wrap gap-2 items-center">
                    {actions?.length > 0 ? actions.map(action => {
                        const filteredAction = actions.find(a => a._id === action._id);
                        return (
                            <div
                                key={action._id}
                                className="px-[6px] py-[2px] rounded-md text-white text-xs cursor-pointer"
                                style={{ backgroundColor: filteredAction?.actionColor || "#3b82f6" }}
                            >
                                {convertCamelCase(filteredAction?.actionName || '')}
                            </div>
                        );
                    }) : "No actions added"}
                </div>
            )
        },
        {
            title: "Is For Super Admin",
            dataIndex: "isForSuperAdmin",
            key: "isForSuperAdmin",
            width: 140,
            render: (value, record) => (
                <Switch
                    checked={value}
                    onChange={async (checked) => {
                        const postData = {
                            moduleId: record._id,
                            isForSuperAdmin: checked,
                        };
                        await updateRecord(postData);
                    }}
                />
            ),
        },
        {
            title: "Is Active",
            dataIndex: "isActive",
            key: "isActive",
            width: 100,
            render: (value, record) => (
                <Switch
                    checked={value}
                    onChange={async (checked) => {
                        const postData = {
                            moduleId: record._id,
                            isActive: checked,
                        };
                        await updateRecord(postData);
                    }}
                />
            ),
        },
        // { title: "Description", dataIndex: "description", key: "description" },
        {
            title: "Operations",
            key: "operations",
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button
                        icon={<EditOutlined />}
                        type="text"
                        onClick={() => handleEdit(record)}
                    />

                    <Popconfirm
                        title="Are you sure to delete this module?"
                        onConfirm={() => deleteModule(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </div>
            ),
        }
    ];

    const addedModulePaths = modules.map(module => module.moduleName);

    const filteredModuleRouteOptions = Object.values(routeConfig)
        .filter(route =>
            route.path !== '/' &&
            !addedModulePaths.includes(route.key)
        )
        .map(route => ({
            value: route.key,
            label: convertCamelCase(route.key),
        }));

    return (
        <div>
            <CardActionsShow onActionChange={(data) => {
                const defaultActions = data.map(action => ({
                    label: convertCamelCase(action.actionName),
                    value: action._id,
                    color: action.actionColor,
                }));
                setActions(defaultActions);
            }} />
            <Card>
                <Table
                    dataSource={[...(modules || [])].reverse()}
                    columns={columns}
                    rowKey={appKeys._id}
                    title={() => (
                        <div className="flex justify-between items-center">
                            <div className="text-lg font-semibold">Modules</div>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setSelectedModuleId(null); setOpen(true); }}>
                                Add Module
                            </Button>
                        </div>
                    )}
                    loading={loading}
                    pagination={{ pageSize: 100 }}
                />
            </Card>

            <Modal
                title={selectedModuleId ? "Update Module" : "Add Module"}
                open={open}
                maskClosable={false}
                onCancel={() => setOpen(false)}
                onOk={() => form.submit()}
                okText={selectedModuleId ? "Update" : "Add"}
                width={450}
            >
                <Form form={form} onFinish={handleAddOrUpdate} layout="vertical" preserve={false}>
                    <Form.Item
                        name="moduleName"
                        label="Module Name"
                        rules={[{ required: true, message: "Please select the module name!" }]}
                    >
                        <Select
                            showSearch
                            placeholder="Select module name"
                            options={filteredModuleRouteOptions}
                            filterOption={(input, option) =>
                                option.label.toLowerCase().includes(input.toLowerCase())
                            }
                            style={{ width: "100%" }}
                        />
                    </Form.Item>

                    <Form.Item name="actions" label="Actions">
                        <Select
                            mode="multiple"
                            options={actions}
                            placeholder="Select actions (e.g., Read, Add, Delete)"
                            style={{ width: '100%' }}
                            optionFilterProp="label"
                            disabled={isAllPermission === true}
                            allowClear
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="isAllPermission" label="Is All Permission">
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="isForSuperAdmin" label="Is For Super Admin">
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="isActive" label="Is Active">
                                <Switch checked />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="description" label="Description">
                        <Input.TextArea placeholder="Enter module description" rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}