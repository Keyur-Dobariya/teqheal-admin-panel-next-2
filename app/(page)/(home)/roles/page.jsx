"use client";
import React, {useState, useEffect, useRef} from "react";
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
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints";
import {
    ApartmentOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined, SendOutlined, UserAddOutlined,
} from "@ant-design/icons";
import {getLocalData} from "../../../dataStorage/DataPref";
import appKeys from "../../../utils/appKeys";
import {ModuleTreeModal} from "../companies/ModuleTreeModal";
import {usePermission} from "../../../hooks/usePermission";
import {routeConfig} from "../../../utils/pageRoutes";
import {mActions} from "../../../utils/enum";
import appString from "../../../utils/appString";
import CommonActionButton from "../(panelCommonUtils)/CommonActionButton";
import {useActionLoading} from "../../../hooks/useActionLoading";
import {useRunOnce} from "../../../hooks/useRunOnce";
import {showToast} from "../../../components/CommonComponents";

export default function RolePage() {
    const {withLoading} = useActionLoading();
    const apiLoading = withLoading();

    const {hasPermission} = usePermission();
    const canAdd = !!hasPermission(mActions.add, routeConfig.roles.key);
    const canEdit = !!hasPermission(mActions.edit, routeConfig.roles.key);
    const canDelete = !!hasPermission(mActions.delete, routeConfig.roles.key);
    const canManageStatus = !!hasPermission(mActions.status, routeConfig.roles.key);

    const [roles, setRoles] = useState([]);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isOnlyPermissionEdit, setIsOnlyPermissionEdit] = useState(null);
    const [form] = Form.useForm();
    const [isModuleModelOpen, setIsModuleModelOpen] = useState(false);
    const [modulePermissions, setModulePermissions] = useState([]);

    const [inviteEmails, setInviteEmails] = useState({});

    const fetchModules = async () => {
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.getAllModules,
            showSuccessMessage: false,
            successCallback: (data) => {
                if(data?.data) {
                    const filteredModules = (data?.data || []).filter(
                        (module) => !module.isForSuperAdmin
                    );
                    setModules(filteredModules);
                }
            },
        });
    };

    const fetchRoles = async () => {
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.getAllRoles,
            showSuccessMessage: false,
            successCallback: (data) => {
                if (data?.data) {
                    setRoles(data?.data || []);
                }
            },
        });
    };

    const {fetchLoading} = useRunOnce([fetchModules, fetchRoles]);

    const handleEdit = (record, isOnlyPermissionEdit) => {
        setSelectedRole(record);
        if (isOnlyPermissionEdit) {
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

    const deleteRole = async (record) => {
        await apiLoading.run(async () => {
            await apiCall({
                method: HttpMethod.DELETE,
                url: endpoints.deleteRole(record?._id),
                showSuccessMessage: true,
                successCallback: (data) => {
                    fetchRoles();
                },
            });
        });
    };

    const addUpdateRole = async (roleId, postData) => {
        await apiLoading.run(async () => {
            await apiCall({
                method: HttpMethod.POST,
                url: endpoints.addUpdateRole(roleId),
                data: postData,
                showSuccessMessage: true,
                successCallback: () => {
                    fetchRoles();
                    setIsModalOpen(false);
                    setSelectedRole(null);
                    form.resetFields();
                },
            });
        });
    };

    const handleAdd = () => {
        setSelectedRole(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        const values = await form.validateFields();
        const postData = {
            ...values,
            modulePermissions: modulePermissions,
        };
        await addUpdateRole(selectedRole?._id, postData);
    };

    const columns = [
        {
            title: "Role Name",
            dataIndex: "roleName",
            key: "roleName",
        },
        {
            title: "Send Invitation",
            key: "sendInvitation",
            width: 250,
            render: (_, record) => (
                <div className="flex gap-2">
                    <Input
                        style={{flex: 1}}
                        placeholder="Enter email"
                        value={inviteEmails[record._id] || ""}
                        onChange={(e) => handleInviteEmailChange(record._id, e.target.value)}
                        size="middle"
                    />
                    <Button
                        type="primary"
                        icon={<SendOutlined/>}
                        size="middle"
                        loading={withLoading(record._id).loading}
                        onClick={() => handleSendInvitation(record._id)}
                        disabled={!inviteEmails[record._id] || inviteEmails[record._id].trim() === ""}
                    />
                </div>
            ),
        },
        {
            title: "Manage Permission",
            key: "permission",
            width: 180,
            align: "center",
            render: (_, record) => (
                <CommonActionButton
                    addBtnIcon={<ApartmentOutlined/>}
                    handleAdd={() => handleEdit(record, true)}
                />
            ),
        },
        {
            title: "Is Active",
            dataIndex: "isActive",
            key: "isActive",
            align: "center",
            hidden: !canManageStatus,
            width: 100,
            render: (value, record) => {
                if (!record?.isManageable) {
                    return '-';
                }
                const rowLoading = withLoading(`isActive-${record._id}`);
                return (
                    <Switch
                        size="small"
                        checked={value}
                        loading={rowLoading.loading}
                        onChange={async (checked) => {
                            await rowLoading.run(async () => {
                                const postData = {
                                    ...record,
                                    isActive: checked,
                                };
                                await addUpdateRole(record._id, postData);
                            });
                        }}
                    />
                );
            },
        },
        {
            title: "Operations",
            key: "operations",
            width: 150,
            align: "center",
            hidden: !canEdit && !canDelete,
            render: (_, record) => record?.isManageable ? (
                <CommonActionButton
                    record={record}
                    handleEdit={canEdit && ((record) => handleEdit(record, false))}
                    handleDelete={canDelete && deleteRole}
                />
            ) : "-",
        },
    ];

    const handleInviteEmailChange = (roleId, value) => {
        setInviteEmails(prev => ({...prev, [roleId]: value}));
    };

    const handleSendInvitation = async (roleId) => {
        const emailAddress = inviteEmails[roleId];
        if (emailAddress) {
            await withLoading(roleId).run(async () => {
                await apiCall({
                    method: HttpMethod.POST,
                    url: endpoints.inviteUser,
                    data: {
                        roleId: roleId,
                        emailAddress: emailAddress,
                    },
                    showSuccessMessage: true,
                    successCallback: () => {
                        setInviteEmails(prev => ({ ...prev, [roleId]: "" }));
                    },
                });
            });
        } else {
            showToast('error', 'Please Enter Email Address');
        }
    };

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
                            {canAdd && <CommonActionButton
                                addBtnName={appString.addRole}
                                handleAdd={handleAdd}
                            />}
                        </div>
                    )}
                    loading={fetchLoading}
                    scroll={{x: "max-content"}}
                />
            </Card>

            <Modal
                title={selectedRole ? "Update Role" : "Add Role"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSubmit}
                width={500}
                confirmLoading={loading}
                maskClosable={false}
            >
                <Form form={form} layout="vertical"
                      onValuesChange={(changedValues, allValues) => {
                          form.setFieldsValue(allValues);
                      }}
                >
                    <Form.Item
                        name="roleName"
                        label="Role Name"
                        rules={[{required: true, message: "Please enter role name!"}]}
                    >
                        <Input placeholder="Enter role name"/>
                    </Form.Item>

                    <Row gutter={16} align="middle">
                        <Col xs={24} sm={12}>
                            <Form.Item name="isActive" label="Is Active" valuePropName="checked"
                                       initialValue={true}>
                                <Switch/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} style={{ display: "flex", justifyContent: "flex-end" }}>
                            <CommonActionButton
                                addBtnName="Set Role Permission"
                                addBtnIcon={<ApartmentOutlined />}
                                handleAdd={() => setIsModuleModelOpen(true)}
                            />
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
                    if (isOnlyPermissionEdit) {
                        const postData = {
                            ...selectedRole,
                            modulePermissions: modulePermissions,
                        };
                        await addUpdateRole(selectedRole?._id, postData);
                    }
                    setIsModuleModelOpen(false);
                }}
            />}
        </div>
    );
}
