'use client';

import { useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import apiCall, { HttpMethod } from "../../../api/apiServiceProvider";
import { endpoints } from "../../../api/apiEndpoints";
import {getLocalData} from "../../../dataStorage/DataPref";
import appKey from "../../../utils/appKey";
import {useSearchParams} from "next/navigation";

const { TextArea } = Input;
const { Title } = Typography;

export default function Page() {
    const searchParams = useSearchParams();
    const employeeCode = searchParams.get('user');

    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        try {
            await apiCall({
                method: HttpMethod.POST,
                url: endpoints.addDailyUpdate,
                data: {
                    todayWorkUpdate: values.todayWorkUpdate,
                    tomorrowPlanning: values.tomorrowPlanning,
                    user: employeeCode,
                },
                setIsLoading: setLoading,
            });

            message.success('Daily update submitted successfully.');
        } catch (error) {
            console.error(error);
            message.error('Network error. Please try again.');
        }
    };

    return (
        <div className="flex flex-col h-screen p-6 gap-6 max-w-2xl mx-auto">
            <Title level={3}>Daily Work Update</Title>

            <Form layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label="Today’s Work Update"
                    name="todayWorkUpdate"
                    rules={[{ required: true, message: 'Please enter today’s work update' }]}
                >
                    <TextArea rows={4} placeholder="What did you work on today?" />
                </Form.Item>

                <Form.Item
                    label="Tomorrow’s Planning"
                    name="tomorrowPlanning"
                    rules={[{ required: true, message: 'Please enter tomorrow’s planning' }]}
                >
                    <TextArea rows={4} placeholder="What are your plans for tomorrow?" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
