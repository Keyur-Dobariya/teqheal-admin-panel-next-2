'use client'

import React, {useState, useEffect, useRef} from "react";
import {
    Col, DatePicker,
    Form,
    Input,
    Modal, Row,
    Switch,
} from "antd";

import appString from "../utils/appString";
import {endpoints} from "../api/apiEndpoints";
import apiCall, {HttpMethod} from "../api/apiServiceProvider";
import appKeys from "../utils/appKeys";
import dayjs from "dayjs";

const {TextArea} = Input;

export default function OfficeUpdateAddEditModel({
                                             isModelOpen,
                                             setIsModelOpen,
                                             selectedRecord,
                                             onSuccessCallback,
                                         }) {
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();
    const containerRef = useRef(null);
    const isEditing = !!selectedRecord;
    const modelTitle = isEditing ? appString.updateEvent : appString.addEvent;

    useEffect(() => {
        if (isModelOpen) {
            form.resetFields();
            if (isEditing && selectedRecord) {
                const formData = {
                    ...selectedRecord,
                    showTime: selectedRecord.showTime ? dayjs(selectedRecord.showTime) : null,
                };
                form.setFieldsValue(formData);
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

            const payload = {
                ...formValues,
                showTime: formValues.showTime ? formValues.showTime.toISOString() : null,
            };

            await apiCall({
                method: HttpMethod.POST,
                url: `${isEditing ? `${endpoints.editOfficeUpdate}${selectedRecord._id}` : endpoints.addOfficeUpdate}`,
                data: payload,
                setIsLoading,
                successCallback: () => {
                    onSuccessCallback();
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
                        <Form.Item name={appKeys.title} label={appString.title}
                                   rules={[{required: true, message: `${appString.title} is required`}]}>
                            <Input
                                placeholder={`Enter ${appString.code.toLowerCase()}`}
                            />
                        </Form.Item>
                        <Form.Item name={appKeys.description} label={appString.description}
                                   rules={[{required: true, message: `${appString.description} is required`}]}>
                            <TextArea
                                autoSize={{minRows: 2, maxRows: 3}}
                                placeholder={`Enter ${appString.description.toLowerCase()}`}
                            />
                        </Form.Item>
                        <Form.Item name={appKeys.showTime} label={appString.showTime}
                                   rules={[{required: true, message: `${appString.showTime} is required`}]}>
                            <DatePicker
                                style={{ width: '100%' }}
                                showTime={{format: "HH:mm"}}
                                format={{
                                    format: 'YYYY-MM-DD HH:mm:ss',
                                    type: 'mask',
                                }}
                            />
                        </Form.Item>
                        <Row gutter={16}>
                            <Col xs={12}>
                                <Form.Item className="w-full" name={appKeys.isDaily} label={appString.isDaily}>
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col xs={12}>
                                <Form.Item name={appKeys.isForDailyUpdate} label={appString.isForDailyUpdate}>
                                    <Switch />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item name={appKeys.windowLink} label={appString.windowLink}>
                            <Input
                                placeholder={`Enter ${appString.windowLink.toLowerCase()}`}
                            />
                        </Form.Item>
                    </div>
                </Form>
            </div>
        </Modal>
    );
}
