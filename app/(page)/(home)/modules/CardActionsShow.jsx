"use client";
import React, {useState, useEffect, useRef} from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Tag,
    Popconfirm,
    Card,
    Switch,
    Row,
    Col,
    Empty,
    ColorPicker, Spin
} from "antd";
import apiCall, { HttpMethod } from "../../../api/apiServiceProvider";
import { endpoints } from "../../../api/apiEndpoints";
import appKeys from "../../../utils/appKeys";
import {DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons";
import {convertCamelCase, convertLowerCaseKey} from "../../../utils/utils";
import {routeConfig} from "../../../utils/pageRoutes";
import appColor from "../../../utils/appColor";

export default function CardActionsShow({onActionChange}) {
    const [actions, setActions] = useState([]);
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [actionForm] = Form.useForm();
    const [selectedActionId, setSelectedActionId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const fetchTriggered = useRef(false);

    const defaultColors = [
        "#F5222D", "#FA8C16", "#FADB14", "#52C41A",
        "#13C2C2", "#1890FF", "#2F54EB", "#722ED1",
        "#B37FEB", "#EB2F96", "#C41D7F", "#1D39C4",
        "#3B82F6", "#A855F7", "#22C55E", "#EF4444",
        "#F59E42", "#FBBF24", "#6B7280", "#06B6D4"
    ];

    const defaultActions = [
        { label: 'Add', value: 'add', color: '#3B82F6' },      // blue-500
        { label: 'Edit', value: 'edit', color: '#FA8C16' },    // orange-400
        { label: 'Delete', value: 'delete', color: '#EF4444' },// red-500
        { label: 'Read', value: 'read', color: '#22C55E' },    // green-500
        { label: 'View All', value: 'viewAll', color: '#22C55E' },    // green-500
        { label: 'View Only Mentioned', value: 'viewOnlyMentioned', color: '#22C55E' },    // green-500
        { label: 'Approve', value: 'approve', color: '#A855F7' },// purple-500
        { label: 'Reject', value: 'reject', color: '#A855F7' }, // purple-500
        { label: 'Status', value: 'status', color: '#06B6D4' },// cyan-500
        { label: 'Upload', value: 'upload', color: '#06B6D4' },// cyan-500
        { label: 'Download', value: 'download', color: '#06B6D4' },// cyan-500
        { label: 'Manage', value: 'manage', color: '#FBBF24' },// gold/yellow-400
        { label: 'Publish', value: 'publish', color: '#FBBF24' },// gold/yellow-400
        { label: 'Lock', value: 'lock', color: '#EB2F96' },    // gray-500
        { label: 'Unlock', value: 'unlock', color: '#EB2F96' },// gray-500
        { label: 'Screenshot View', value: 'screenshotView', color: '#13C2C2' },// gray-500
        { label: 'Mouse Keyboard Event View', value: 'mouseKeyboardEventView', color: '#13C2C2' },// gray-500
    ];

    useEffect(() => {
        if (!fetchTriggered.current) {
            fetchTriggered.current = true;
            // addMultipleActions();
            fetchActions();
        }
    }, []);

    const addMultipleActions = async () => {
        for (let i = 0; i < defaultActions.length; i++) {
            const actionName = defaultActions[i].value;
            const actionColor = defaultActions[i].color;

            try {
                await apiCall({
                    method: HttpMethod.POST,
                    url: endpoints.addUpdateAction,
                    data: { actionName, actionColor },
                    setIsLoading: setActionLoading,
                    showSuccessMessage: true,
                });
                console.log(`Added action: ${actionName} with color: ${actionColor}`);
            } catch (err) {
                console.error(`Failed to add action ${actionName}:`, err);
            }
        }
    };

    const fetchActions = async () => {
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.getAllActions,
            setIsLoading: setActionLoading,
            showSuccessMessage: false,
            successCallback: (data) => {
                if(data?.data) {
                    setActions(data?.data || []);
                    onActionChange(data?.data || [])
                }
            },
        });
    };

    const handleAddOrUpdateAction = async (values) => {
        await apiCall({
            method: HttpMethod.POST,
            url: endpoints.addUpdateAction,
            data: {
                ...(selectedActionId ? { actionId: selectedActionId } : {}),
                ...values,
                actionName: convertLowerCaseKey(values.actionName),
                actionColor: values.actionColor,
            },
            setIsLoading: setActionLoading,
            showSuccessMessage: true,
            successCallback: () => {
                setActionModalOpen(false);
                setSelectedActionId(null);
                actionForm.resetFields();
                fetchActions();
            },
        });
    };

    const handleEditAction = (action) => {
        setSelectedActionId(action._id);
        actionForm.setFieldsValue({
            actionName: convertCamelCase(action.actionName),
            actionColor: action.actionColor,
        });
        setActionModalOpen(true);
    };

    const handleDeleteAction = async (actionId) => {
        await apiCall({
            method: HttpMethod.DELETE,
            url: endpoints.deleteAction.replace(":id", actionId),
            setIsLoading: setActionLoading,
            showSuccessMessage: true,
            successCallback: () => {
                fetchActions();
            },
        });
    };

    return (
        <>
            <Card
                title={
                    <div className="flex justify-between items-center">
                        <span className="font-semibold">Actions</span>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => { actionForm.resetFields(); setSelectedActionId(null); setActionModalOpen(true); }}>
                            Add Action
                        </Button>
                    </div>
                }
                style={{ marginBottom: 20 }}
            >
                <Spin size="default" spinning={actionLoading}>
                    <div className="flex flex-wrap gap-3 p-5">
                        {actions.length > 0 ? actions.map((action) => (
                            <div
                                key={action._id}
                                className="px-3 py-1 rounded-md mb-2 shadow flex items-center gap-2 text-white font-medium"
                                style={{ backgroundColor: action.actionColor }}
                            >
                                {convertCamelCase(action.actionName)}
                                <EditOutlined
                                    className='cursor-pointer'
                                    onClick={() => handleEditAction(action)}
                                />
                                <Popconfirm
                                    title="Delete this action?"
                                    onConfirm={() => handleDeleteAction(action._id)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <DeleteOutlined
                                        className='cursor-pointer'
                                    />
                                </Popconfirm>
                            </div>
                        )) : <div className="w-full flex items-center justify-center p-5">
                            <Empty />
                        </div>}
                    </div>
                </Spin>
            </Card>
            <Modal
                title={selectedActionId ? "Update Action" : "Add Action"}
                open={actionModalOpen}
                onCancel={() => { setActionModalOpen(false); actionForm.resetFields(); setSelectedActionId(null); }}
                onOk={() => actionForm.submit()}
                okText={selectedActionId ? "Update" : "Add"}
                width={400}
            >
                <Form form={actionForm} onFinish={handleAddOrUpdateAction} layout="vertical">
                    <Row gutter={16}>
                        <Col xs={14} sm={16}>
                            <Form.Item
                                name="actionName"
                                label="Action Name"
                                rules={[{ required: true, message: "Please enter the action name!" }]}
                            >
                                <Input placeholder="Enter action name" />
                            </Form.Item>
                        </Col>
                        <Col xs={10} sm={8}>
                            <Form.Item
                                name="actionColor"
                                label="Action Color"
                                rules={[{ required: true, message: "Please select a color!" }]}
                            >
                                <ColorPicker defaultValue={appColor.secondPrimary} showText />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <div className="mb-2 flex flex-wrap gap-2">
                            {defaultColors.map(color => (
                                <span
                                    key={color}
                                    style={{
                                        background: color,
                                        width: 28,
                                        height: 28,
                                        borderRadius: "50%",
                                        display: "inline-block",
                                        cursor: "pointer",
                                        border: '2px solid #f0f0f0',
                                    }}
                                    title={color}
                                    onClick={() => actionForm.setFieldsValue({ actionColor: color })}
                                />
                            ))}
                        </div>
                    </Form.Item>

                </Form>
            </Modal>
        </>
    );
}