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
import {
    CommonActionButton,
    CommonActionSwitch,
    getActionColumn,
    getSwitchColumn,
    TableTitle
} from "../(panelCommonUtils)/CommonAction";
import {useActionLoading} from "../../../hooks/useActionLoading";
import {useRunOnce} from "../../../hooks/useRunOnce";
import {showToast} from "../../../components/CommonComponents";
import {useApiServices} from "../../../api/useApiServices";

export default function RolePage() {
    const { isLoading, roles: callApi, modules: {getAllModules}, invite: {inviteUser} } = useApiServices();

    const {withLoading} = useActionLoading();

    const {hasPermission} = usePermission();
    const canAdd = !!hasPermission(mActions.add, routeConfig.roles.key);
    const canEdit = !!hasPermission(mActions.edit, routeConfig.roles.key);
    const canDelete = !!hasPermission(mActions.delete, routeConfig.roles.key);
    const canManageStatus = !!hasPermission(mActions.status, routeConfig.roles.key);

    const [roles, setRoles] = useState([]);
    const [modules, setModules] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isOnlyPermissionEdit, setIsOnlyPermissionEdit] = useState(null);
    const [form] = Form.useForm();
    const [isModuleModelOpen, setIsModuleModelOpen] = useState(false);
    const [modulePermissions, setModulePermissions] = useState([]);

    const [inviteEmails, setInviteEmails] = useState({});

    const fetchModules = async () => {
        const data = await getAllModules();
        if (data) {
            const filteredModules = (data || []).filter(module => !module.isForSuperAdmin);
            setModules(filteredModules);
        }
    };

    const fetchRoles = async () => {
        const data = await callApi.getAllRoles();
        setRoles(data || []);
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
        const data = await callApi.deleteRole(record?._id);
        setRoles(data || []);
    };

    const addUpdateRole = async (roleId, postData) => {
        await callApi.addUpdateRole(roleId, postData, async (data) => {
            setIsModalOpen(false);
            setSelectedRole(null);
            form.resetFields();
            setRoles(data || []);
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
            title: appString.isActive,
            dataIndex: appKeys.isActive,
            key: appKeys.isActive,
            align: "center",
            hidden: !canManageStatus,
            render: (value, record) => {
                if (!record?.isManageable) {
                    return '-';
                }
                return (
                    <CommonActionSwitch
                        field={appKeys.isActive}
                        record={record}
                        handleStateChange={addUpdateRole}
                    />
                );
            },
        },
        {
            title: appString.actions,
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
                const postData = {
                    roleId: roleId,
                    emailAddress: emailAddress,
                };
                await inviteUser(postData, () => setInviteEmails(prev => ({ ...prev, [roleId]: "" })));
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
                            <TableTitle title={appString.roles} />
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
                confirmLoading={isLoading}
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
