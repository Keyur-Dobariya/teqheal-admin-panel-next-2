"use client";
import React, { useState, useEffect, useRef } from "react";
import {
    Table,
    Button,
    Popconfirm,
    Card,
    Switch,
    Modal,
    Form,
    Input,
    Select,
} from "antd";
import apiCall, { HttpMethod } from "../../../api/apiServiceProvider";
import { endpoints } from "../../../api/apiEndpoints";
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import {getLocalData} from "../../../dataStorage/DataPref";
import appKeys from "../../../utils/appKeys";

export default function RolePage() {
    const [roles, setRoles] = useState([]);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [form] = Form.useForm();
    const fetchTriggered = useRef(false);

    const fetchModules = async () => {
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.getAllModules,
            setIsLoading: false,
            showSuccessMessage: false,
            successCallback: (data) => {
                const filteredModules = (data?.data || []).filter(
                    (module) => !module.isForSuperAdmin
                );
                setModules(filteredModules);
            },
        });
    };

    const fetchRoles = async () => {
        setLoading(true);
        const companyId = getLocalData(appKeys.companyId);
        await apiCall({
            method: HttpMethod.GET,
            url: `${endpoints.getRolesByCompany}?companyId=${companyId}`,
            setIsLoading: setLoading,
            showSuccessMessage: false,
            successCallback: (data) => {
                setRoles(data?.data || []);
            },
        });
    };

    useEffect(() => {
        if (!fetchTriggered.current) {
            fetchTriggered.current = true;
            fetchModules();
            fetchRoles();
        }
    }, []);

    const deleteRole = async (id) => {
        setLoading(true);
        await apiCall({
            method: HttpMethod.DELETE,
            url: endpoints.deleteRole.replace(":id", id),
            setIsLoading: setLoading,
            showSuccessMessage: true,
            successCallback: (data) => {
                fetchRoles();
            },
        });
    };

    const handleEdit = (record) => {
        setSelectedRole(record);
        setIsModalOpen(true);
        form.setFieldsValue({
            ...record,
            // You may want to transform permissions if needed
        });
    };

    const handleAdd = () => {
        setSelectedRole(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const postData = {
                ...values,
                companyId: getLocalData(appKeys.companyId),
                roleId: selectedRole?._id,
            };
            setLoading(true);
            await apiCall({
                method: HttpMethod.POST,
                url: endpoints.addUpdateRole,
                data: postData,
                setIsLoading: setLoading,
                showSuccessMessage: true,
                successCallback: () => {
                    fetchRoles();
                    setIsModalOpen(false);
                    setSelectedRole(null);
                    form.resetFields();
                },
            });
        } catch (error) {
            // Validation failed, do nothing
        }
    };

    const columns = [
        {
            title: "Role Name",
            dataIndex: "roleName",
            key: "roleName",
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
                            roleId: record._id,
                            isActive: checked,
                        };
                        setLoading(true);
                        await apiCall({
                            method: HttpMethod.POST,
                            url: endpoints.addUpdateRole,
                            data: postData,
                            setIsLoading: setLoading,
                            showSuccessMessage: true,
                            successCallback: () => fetchRoles(),
                        });
                    }}
                />
            ),
        },
        {
            title: "Operations",
            key: "operations",
            width: 150,
            fixed: "right",
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button icon={<EditOutlined />} type="text" onClick={() => handleEdit(record)} />
                    <Popconfirm
                        title="Are you sure to delete this role?"
                        onConfirm={() => deleteRole(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger type="text" icon={<DeleteOutlined />} />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div>
            <Card>
                <Table
                    dataSource={roles}
                    columns={columns}
                    rowKey={(record) => record._id}
                    title={() => (
                        <div className="flex justify-between items-center">
                            <div className="text-lg font-semibold">Roles</div>
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                                Add Role
                            </Button>
                        </div>
                    )}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: "max-content" }}
                />
            </Card>

            <Modal
                title={selectedRole ? "Update Role" : "Add Role"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleModalOk}
                width={500}
                confirmLoading={loading}
                maskClosable={false}
            >
                <Form form={form} layout="vertical" preserve={false}>
                    <Form.Item
                        name="roleName"
                        label="Role Name"
                        rules={[{ required: true, message: "Please enter role name!" }]}
                    >
                        <Input placeholder="Enter role name" />
                    </Form.Item>

                    <Form.Item name="isActive" label="Is Active" valuePropName="checked" initialValue={true}>
                        <Switch />
                    </Form.Item>

                    {/* You can implement the permissions UI here,
              e.g., a ModuleTreeModal or multi-select for permissions */}

                    <Form.Item name="permissions" label="Permissions" rules={[{ required: true, message: "Please select permissions!" }]}>
                        <Select
                            mode="multiple"
                            placeholder="Select permissions"
                            options={modules.flatMap(module =>
                                (module.actions || []).map(action => ({
                                    label: `${module.moduleName} - ${action}`,
                                    value: `${module._id}_${action}`,
                                }))
                            )}
                        />
                        {/*
              Note: You need to map this multi-select selection into your permissions format on submit.
              Alternatively, include your ModuleTreeModal here, controlled via state.
            */}
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
