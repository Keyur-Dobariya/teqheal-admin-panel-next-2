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
import {profilePhotoManager} from "../utils/utils";
import dayjs from "dayjs";
import {UserSelect} from "../components/CommonComponents";

export default function BasicSalaryModel({
                                             isModelOpen,
                                             setIsModelOpen,
                                             activeUsersData,
                                             selectedRecord,
                                             onSuccessCallback,
                                         }) {
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();
    const containerRef = useRef(null);
    const isEditing = !!selectedRecord;
    const modelTitle = isEditing ? appString.updateBasicSalary : appString.addBasicSalary;

    useEffect(() => {
        if (isModelOpen) {
            form.resetFields();
            if (isEditing && selectedRecord) {
                const formData = {
                    ...selectedRecord,
                    user: selectedRecord.user ? selectedRecord.user._id : null,
                    startDate: selectedRecord.startDate ? dayjs(selectedRecord.startDate) : null,
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

            await apiCall({
                method: HttpMethod.POST,
                url: `${endpoints.addUpdateBasicSalary}${selectedRecord._id}`,
                data: formValues,
                setIsLoading,
                successCallback: (data) => {
                    onSuccessCallback(data.data);
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
                        <Form.Item name={appKeys.user} label={appString.user}
                                   rules={[{required: true, message: 'Please select User!'}]} span={24}>
                            <UserSelect users={activeUsersData} />
                        </Form.Item>
                        <Row gutter={16}>
                            <Col xs={12}>
                                <Form.Item className="w-full" name={appKeys.startDate} label={appString.startDate}
                                           rules={[{required: true, message: `${appString.startDate} is required`}]}>
                                    <DatePicker
                                        placeholder={`Select ${appString.startDate.toLowerCase()}`}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={12}>
                                <Form.Item name={appKeys.basicSalary} label={appString.basicSalary}
                                           rules={[{required: true, message: `${appString.basicSalary} is required`}]}>
                                    <Input
                                        type={"number"}
                                        placeholder={`Enter ${appString.basicSalary.toLowerCase()}`}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item name={appKeys.code} label={appString.code}
                                   rules={[{required: true, message: `${appString.code} is required`}]}>
                            <Input
                                placeholder={`Enter ${appString.code.toLowerCase()}`}
                            />
                        </Form.Item>
                    </div>
                </Form>
            </div>
        </Modal>
    );
}
