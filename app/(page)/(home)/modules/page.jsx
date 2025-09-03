"use client";
import React, {useState, useEffect, useRef} from "react";
import {Table, Button, Modal, Form, Input, Select, Tag, Popconfirm, Card, Switch, Row, Col} from "antd";
import apiCall, { HttpMethod } from "../../../api/apiServiceProvider";
import { endpoints } from "../../../api/apiEndpoints";
import appKeys from "../../../utils/appKeys";
import {DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons";
import {convertCamelCase} from "../../../utils/utils";
import {routeConfig} from "../../../utils/pageRoutes";

export default function Page() {
    const [modules, setModules] = useState([]);
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const [selectedModuleId, setSelectedModuleId] = useState(null);
    const [loading, setLoading] = useState(false);
    const isAllPermission = Form.useWatch("isAllPermission", form);
    const fetchTriggered = useRef(false);

    const defaultActions = [
        { label: 'Add', value: 'add', color: '#3b82f6' },      // blue-500
        { label: 'Edit', value: 'edit', color: '#f59e42' },    // orange-400
        { label: 'Delete', value: 'delete', color: '#ef4444' },// red-500
        { label: 'Read', value: 'read', color: '#22c55e' },    // green-500
        { label: 'View All', value: 'viewAll', color: '#22c55e' },    // green-500
        { label: 'View Only Mentioned', value: 'viewOnlyMentioned', color: '#22c55e' },    // green-500
        { label: 'Approve', value: 'approve', color: '#a855f7' },// purple-500
        { label: 'Reject', value: 'reject', color: '#a855f7' }, // purple-500
        { label: 'Status', value: 'status', color: '#06b6d4' },// cyan-500
        { label: 'Upload', value: 'upload', color: '#06b6d4' },// cyan-500
        { label: 'Download', value: 'download', color: '#06b6d4' },// cyan-500
        { label: 'Manage', value: 'manage', color: '#fbbf24' },// gold/yellow-400
        { label: 'Publish', value: 'publish', color: '#fbbf24' },// gold/yellow-400
        { label: 'Lock', value: 'lock', color: '#6b7280' },    // gray-500
        { label: 'Unlock', value: 'unlock', color: '#6b7280' },// gray-500
        { label: 'Screenshot View', value: 'screenshotView', color: '#6b7280' },// gray-500
        { label: 'Mouse Keyboard Event View', value: 'mouseKeyboardEventView', color: '#6b7280' },// gray-500
    ];

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
        const postData = {
            moduleName: values.moduleName,
            description: values.description,
            actions: values.actions || [],
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
        form.setFieldsValue({
            ...record,
            moduleName: convertCamelCase(record.moduleName),
        });
        setOpen(true);
    };

    const getActionColor = (action) => {
        const found = defaultActions.find((item) => item.value === action);
        return found ? found.color : "#3b82f6";
    };

    const columns = [
        { title: "Module Name", dataIndex: "moduleName", key: "moduleName", render: (moduleName) => convertCamelCase(moduleName) },
        {
            title: "Actions",
            dataIndex: "actions",
            key: "actions",
            render: (actions) =>
                <div className="flex flex-wrap gap-2 items-center">
                    {
                        actions?.length > 0 ? actions?.map((action) => (
                            <div key={action} className={`px-[6px] py-[2px] rounded-md text-white text-xs cursor-pointer`} style={{ backgroundColor: getActionColor(action) }}>
                                {convertCamelCase(action)}
                            </div>
                        )) : "No actions added"
                    }
                </div>
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

    const filteredModuleRouteOptions = Object.keys(routeConfig)
        .filter(routeKey => routeConfig[routeKey].path !== '/' && !addedModulePaths.includes(routeKey))
        .map(routeKey => ({
            value: routeKey,
            label: convertCamelCase(routeKey),
        }));

    return (
        <div>
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
                            mode="tags"
                            options={defaultActions}
                            placeholder="Enter actions (e.g., read, add, update, delete)"
                            tokenSeparators={[","]}
                            style={{ width: '100%' }}
                            disabled={isAllPermission === true}
                            allowClear
                            onInputKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    e.preventDefault();
                                    const currentValues = form.getFieldValue('actions') || [];
                                    const inputVal = e.target.value.trim();
                                    if (inputVal && !currentValues.includes(inputVal)) {
                                        form.setFieldsValue({ actions: [...currentValues, inputVal] });
                                        e.target.value = '';
                                    }
                                }
                            }}
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