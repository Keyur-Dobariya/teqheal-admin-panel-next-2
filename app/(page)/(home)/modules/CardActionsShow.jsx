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
import {useActionLoading} from "../../../hooks/useActionLoading";
import {useRunOnce} from "../../../hooks/useRunOnce";
import appString from "../../../utils/appString";
import CommonActionButton from "../(panelCommonUtils)/CommonActionButton";

export default function CardActionsShow({onActionChange}) {
    const { withLoading } = useActionLoading();
    const apiLoading = withLoading();
    const [actions, setActions] = useState([]);
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [selectedActionId, setSelectedActionId] = useState(null);

    const canDelete = false;

    const defaultColors = [
        "#F5222D", "#FA8C16", "#FADB14", "#52C41A",
        "#13C2C2", "#1890FF", "#2F54EB", "#722ED1",
        "#B37FEB", "#EB2F96", "#C41D7F", "#1D39C4",
        "#3B82F6", "#A855F7", "#22C55E", "#EF4444",
        "#F59E42", "#FBBF24", "#6B7280", "#06B6D4"
    ];

    const fetchActions = async () => {
        await apiLoading.run(async () => {
            await apiCall({
                method: HttpMethod.GET,
                url: endpoints.getAllActions,
                showSuccessMessage: false,
                successCallback: (data) => {
                    if(data?.data) {
                        setActions(data?.data || []);
                        onActionChange(data?.data || [])
                    }
                },
            });
        });
    };

    const {fetchLoading} = useRunOnce(fetchActions);

    const handleAddOrUpdateAction = async (values) => {
        await apiLoading.run(async () => {
            await apiCall({
                method: HttpMethod.POST,
                url: endpoints.addUpdateAction(selectedActionId),
                data: {
                    ...values,
                    actionName: convertLowerCaseKey(values.actionName),
                    actionColor: values.actionColor,
                },
                showSuccessMessage: true,
                successCallback: () => {
                    setActionModalOpen(false);
                    setSelectedActionId(null);
                    form.resetFields();
                    fetchActions();
                },
            });
        });
    };

    const handleEditAction = (action) => {
        setSelectedActionId(action._id);
        form.setFieldsValue({
            actionName: convertCamelCase(action.actionName),
            actionColor: action.actionColor,
        });
        setActionModalOpen(true);
    };

    const handleDeleteAction = async (actionId) => {
        await apiLoading.run(async () => {
            await apiCall({
                method: HttpMethod.DELETE,
                url: endpoints.deleteAction(actionId),
                showSuccessMessage: true,
                successCallback: () => {
                    fetchActions();
                },
            });
        });
    };

    return (
        <>
            <Card
                title={
                    <div className="flex justify-between items-center gap-4">
                        <div className="text-base font-semibold">Actions</div>
                        <CommonActionButton
                            addBtnName={appString.addAction}
                            handleAdd={() => {
                                setActionModalOpen(true);
                                setSelectedActionId(null);
                                form.resetFields();
                            }}
                        />
                    </div>
                }
                style={{ marginBottom: 20 }}
            >
                <Spin size="default" spinning={fetchLoading}>
                    <div className="flex flex-wrap gap-3 p-5">
                        {actions.length > 0 ? actions.map((action) => (
                            <div
                                key={action._id}
                                className="px-3 py-1 rounded-md shadow flex items-center gap-2 text-white font-medium"
                                style={{ backgroundColor: action.actionColor }}
                            >
                                {convertCamelCase(action.actionName)}
                                <EditOutlined
                                    title={appString.edit}
                                    className='cursor-pointer'
                                    onClick={() => handleEditAction(action)}
                                />
                                {canDelete && <Popconfirm
                                    title="Delete this action?"
                                    onConfirm={() => handleDeleteAction(action._id)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <DeleteOutlined
                                        className='cursor-pointer'
                                    />
                                </Popconfirm>}
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
                onCancel={() => { setActionModalOpen(false); form.resetFields(); setSelectedActionId(null); }}
                onOk={() => form.submit()}
                okText={selectedActionId ? "Update" : "Add"}
                width={400}
            >
                <Form form={form} onFinish={handleAddOrUpdateAction} layout="vertical" onValuesChange={(changedValues, allValues) => {
                    form.setFieldsValue(allValues);
                }}>
                    <Row gutter={16}>
                        <Col xs={14} sm={16}>
                            <Form.Item
                                name="actionName"
                                label="Action Name"
                                rules={[{ required: true, message: "Please enter the action name!" }]}
                            >
                                <Input disabled={selectedActionId} placeholder="Enter action name" />
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
                                    onClick={() => form.setFieldsValue({ actionColor: color })}
                                />
                            ))}
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}