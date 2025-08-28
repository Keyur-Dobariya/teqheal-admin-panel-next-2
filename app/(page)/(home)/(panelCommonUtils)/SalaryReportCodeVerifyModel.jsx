'use client'

import React, {useState} from "react";
import {
    Button, Form, Input,
    Modal
} from "antd";

import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints";
import {isAdmin} from "../../../dataStorage/DataPref";
import {showToast} from "../../../components/CommonComponents";

export default function SalaryReportCodeVerifyModel({ isModelOpen, setIsModelOpen, onSuccess }) {
    const [isLoading, setIsLoading] = useState(false);

    const locationPermission = (values) => {
        if (!isAdmin()) {
            if (!navigator.geolocation) {
                showToast("error", 'Geolocation is not supported by your browser')
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    await handleCodeVerifyApi(values, position.coords.latitude, position.coords.longitude)
                },
                (err) => {
                    showToast("error", 'Unable to retrieve your location: ' + err.message)
                }
            );
        }
    }

    const handleCodeVerifyApi = async (values, latitude, longitude) => {
        await apiCall({
            method: HttpMethod.POST,
            url: endpoints.salaryCodeVerify,
            data: {
                code: values.code,
                latitude: latitude,
                longitude: longitude,
            },
            setIsLoading: setIsLoading,
            successCallback: () => {
                setIsModelOpen(false);
                onSuccess();
            },
        });
    }

    return (
        <Modal
            title="User Code Verification!"
            maskClosable={true}
            centered
            closeIcon={false}
            open={isModelOpen}
            footer={null}
            onCancel={() => setIsModelOpen(false)}
            onClose={() => setIsModelOpen(false)}
        >
            <Form
                layout="vertical"
                onFinish={locationPermission}
            >
                <Form.Item
                    name="code"
                    label="Code"
                    rules={[{ required: true, message: `Enter salary report code!` }]}
                >
                    <Input
                        placeholder="Enter Code"
                    />
                </Form.Item>
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setIsModelOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isLoading}
                    >
                        Verify
                    </Button>
                </div>
            </Form>
        </Modal>
    );
}
