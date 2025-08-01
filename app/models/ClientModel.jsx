'use client'

import React, {useState, useEffect, useRef} from "react";
import {
    Avatar, Col,
    DatePicker,
    Form,
    Input,
    Modal, Row,
    Select,
} from "antd";

import appString from "../utils/appString";
import {endpoints} from "../api/apiEndpoints";
import apiCall, {HttpMethod} from "../api/apiServiceProvider";
import appKeys from "../utils/appKeys";
import dayjs from "dayjs";

export default function ClientModel({
                                             isModelOpen,
                                             setIsModelOpen,
                                             selectedRecord,
                                             onSuccessCallback,
                                         }) {
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();
    const containerRef = useRef(null);
    const isEditing = !!selectedRecord;
    const modelTitle = isEditing ? appString.updateClient : appString.addClient;

    useEffect(() => {
        if (isModelOpen) {
            form.resetFields();
            if (isEditing && selectedRecord) {
                form.setFieldValue(appKeys.clientName, selectedRecord.clientName);
            }
        }
    }, [isModelOpen, isEditing, selectedRecord, form]);

    const handleCancel = () => {
        setIsModelOpen(false);
        form.resetFields();
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    };

    const handleAddUpdateRecord = async () => {
        try {
            await form.validateFields();

            const formValues = form.getFieldsValue(true);

            await apiCall({
                method: HttpMethod.POST,
                url: isEditing ? `${endpoints.updateClient}${selectedRecord._id}` : endpoints.addClient,
                data: formValues,
                setIsLoading,
                successCallback: (data) => {
                    onSuccessCallback(data);
                    setIsModelOpen(false);
                },
            });
        } catch (error) {
            console.error("Form validation/API call failed:", error);
        }
    };

    return (
        <Modal
            title={<div className="font-medium text-base">{modelTitle}</div>}
            maskClosable={false}
            centered
            open={isModelOpen}
            width={400}
            onOk={handleAddUpdateRecord}
            onCancel={handleCancel}
            confirmLoading={isLoading}
            okText={modelTitle}
        >
            <div
                ref={containerRef}
                style={{maxHeight: "75vh", overflowY: "auto", scrollbarWidth: "none"}}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onValuesChange={(changedValues, allValues) => {
                        form.setFieldsValue(allValues);
                    }}
                >
                    <div className="flex flex-col mt-3">
                        <Form.Item name={appKeys.clientName} label={appString.clientName}
                                   rules={[{required: true, message: `${appString.clientName} is required`}]}>
                            <Input
                                placeholder={`Enter ${appString.clientName.toLowerCase()}`}
                            />
                        </Form.Item>
                    </div>
                </Form>
            </div>
        </Modal>
    );
}
