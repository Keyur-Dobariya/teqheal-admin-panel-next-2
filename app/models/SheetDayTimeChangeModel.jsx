'use client'

import React, {useRef, useState} from "react";
import {DatePicker, Form, Modal, TimePicker} from "antd";
import appString from "../utils/appString";
import {endpoints} from "../api/apiEndpoints";
import apiCall, {HttpMethod} from "../api/apiServiceProvider";
import appKeys from "../utils/appKeys";

export default function SheetDayTimeChangeModel({
                                                  isModelOpen,
                                                  setIsModelOpen,
                                                  onSuccessCallback,
                                              }) {
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef(null);
    const [form] = Form.useForm();
    const modelTitle = appString.updateRecord;

    const handleCancel = () => {
        setIsModelOpen(false);
        form.resetFields();
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    };

    const handleAddUpdateRecord = async () => {
        try {
            const values = await form.validateFields();

            const formattedDate = values.date.format('YYYY-MM-DD');
            const formattedTime = values.time.format('HH:mm');

            const data = {
                date: formattedDate,
                time: formattedTime,
            };

            await apiCall({
                method: HttpMethod.POST,
                url: endpoints.addPunchTime,
                data,
                setIsLoading: setIsLoading,
                successCallback: () => {
                    setIsModelOpen(false);
                    onSuccessCallback();
                },
            });
        } catch (error) {
            console.error("Form validation/API call failed:", error);
        }
    };

    return (
        <Modal
            title={<div className="font-medium text-base">{appString.updatePunchTime}</div>}
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
                style={{maxHeight: "75vh", marginTop: 15, overflowY: "auto", scrollbarWidth: "none"}}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onValuesChange={(changedValues, allValues) => {
                        form.setFieldsValue(allValues);
                    }}
                >
                    <Form.Item
                        name={appKeys.date}
                        label="Select Date"
                        rules={[{ required: true, message: 'Please select a date' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="time"
                        label="Punch Time"
                        rules={[{ required: true, message: 'Please select a time' }]}
                    >
                        <TimePicker format="HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
}
