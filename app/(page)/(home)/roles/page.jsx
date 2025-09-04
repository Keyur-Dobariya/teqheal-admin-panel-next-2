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
    Select, Row, Col,
} from "antd";
import apiCall, { HttpMethod } from "../../../api/apiServiceProvider";
import { endpoints } from "../../../api/apiEndpoints";
import {
    ApartmentOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import {getLocalData} from "../../../dataStorage/DataPref";
import appKeys from "../../../utils/appKeys";
import {ModuleTreeModal} from "../companies/ModuleTreeModal";

export default function RolePage() {
    const [roles, setRoles] = useState([]);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isOnlyPermissionEdit, setIsOnlyPermissionEdit] = useState(null);
    const [form] = Form.useForm();
    const fetchTriggered = useRef(false);
    const [isModuleModelOpen, setIsModuleModelOpen] = useState(false);
    const [modulePermissions, setModulePermissions] = useState([]);

    useEffect(() => {
        if (!fetchTriggered.current) {
            fetchTriggered.current = true;
            fetchModules();
            fetchRoles();
        }
    }, []);

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
                if(data?.data) {
                    setRoles(data?.data || []);
                }
            },
        });
    };

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

    const handleEdit = (record, isOnlyPermissionEdit) => {
        setSelectedRole(record);
        if(isOnlyPermissionEdit) {
            setModulePermissions(record.modulePermissions || []);
            setIsOnlyPermissionEdit(true);
            setIsModuleModelOpen(true);
        } else {
            setIsOnlyPermissionEdit(false);
            setIsModalOpen(true);
            form.setFieldsValue({
                ...record,
            });
        }
    };

    const handleAdd = () => {
        setSelectedRole(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleModalOk = async (permissionData = []) => {
        try {
            let postData;
            if(isOnlyPermissionEdit) {
                postData = {
                    ...selectedRole,
                    companyId: getLocalData(appKeys.companyId),
                    modulePermissions: permissionData,
                    ...(selectedRole ? { roleId: selectedRole?._id } : {}),
                };
            } else {
                const values = await form.validateFields();
                postData = {
                    ...values,
                    companyId: getLocalData(appKeys.companyId),
                    modulePermissions: modulePermissions,
                    ...(selectedRole ? { roleId: selectedRole?._id } : {}),
                };
            }

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
            title: "Manage Permission",
            key: "permission",
            width: 180,
            align: "center",
            render: (_, record) => (
                <div className="flex justify-center items-center">
                    <Button icon={<ApartmentOutlined />} type="primary" onClick={() => handleEdit(record, true)} />
                </div>
            ),
        },
        {
            title: "Is Active",
            dataIndex: "isActive",
            key: "isActive",
            width: 100,
            render: (value, record) => record?.isManageable ? (
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
            ) : "-",
        },
        {
            title: "Operations",
            key: "operations",
            width: 150,
            fixed: "right",
            render: (_, record) => record?.isManageable ? (
                <div className="flex gap-2">
                    <Button icon={<EditOutlined />} type="text" onClick={() => handleEdit(record, false)} />
                    <Popconfirm
                        title="Are you sure to delete this role?"
                        onConfirm={() => deleteRole(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger type="text" icon={<DeleteOutlined />} />
                    </Popconfirm>
                </div>
            ) : "-",
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

                    <Row gutter={16} align="middle">
                        <Col xs={24} sm={12}>
                            <Form.Item name="isActive" label="Is Active" valuePropName="checked"
                                       initialValue={true}>
                                <Switch/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Button type="primary" style={{width: '100%'}} icon={<ApartmentOutlined/>}
                                    iconPosition='end' onClick={() => setIsModuleModelOpen(true)}>
                                Set Module Permission
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {isModuleModelOpen && <ModuleTreeModal
                isModuleModelOpen={isModuleModelOpen}
                setIsModuleModelOpen={setIsModuleModelOpen}
                modules={modules}
                modulePermissions={modulePermissions}
                isTabMode={false}
                onSubmit={async (modulePermissions) => {
                    setModulePermissions(modulePermissions);
                    if(isOnlyPermissionEdit) {
                        await handleModalOk(modulePermissions);
                    }
                }}
            />}
        </div>
    );
}
