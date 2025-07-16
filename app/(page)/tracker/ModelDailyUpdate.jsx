'use client';

import {useEffect, useState} from 'react';
import {Form, Input, Modal} from 'antd';
import apiCall, {HttpMethod} from "../../api/apiServiceProvider";
import {endpoints} from "../../api/apiEndpoints";
import {getOfficeUpdateData, liveOfficeUpdateDataStream} from "./trackerUtils";

const {TextArea} = Input;

export default function ModelDailyUpdate({attendanceData}) {
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [officeUpdates, setOfficeUpdates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const scheduledWindows = new Map();

    useEffect(() => {
        getOfficeUpdateData(async (data) => {
            setOfficeUpdates(data?.data);
        });
        liveOfficeUpdateDataStream((data) => {
            setOfficeUpdates(data);
        });
    }, []);

    useEffect(() => {
        scheduleWindowsFromData(officeUpdates);
    }, [officeUpdates]);

    function scheduleWindowsFromData(dataArray) {
        let normalizedArray = [];

        if (typeof dataArray === 'string') {
            try {
                normalizedArray = JSON.parse(dataArray);
            } catch (error) {
                console.error('Failed to parse stringified dataArray:', error);
                return;
            }
        } else if (Array.isArray(dataArray)) {
            normalizedArray = dataArray;
        } else if (dataArray && typeof dataArray === 'object' && Array.isArray(dataArray.data)) {
            normalizedArray = dataArray.data;
        } else {
            console.error('Invalid dataArray');
            return;
        }

        const now = new Date();

        normalizedArray.forEach(item => {
            const alreadyScheduled = scheduledWindows.has(item._id);

            if (alreadyScheduled && !item.isDaily) {
                console.log(`"${item.title}" already scheduled. Skipping...`);
                return;
            }

            const scheduleTask = (delay, isRecurring = false) => {
                const timer = setTimeout(() => {
                    launchWindow(item);

                    if (isRecurring) {
                        scheduleWindowsFromData([item]);
                    }

                    if (!isRecurring) {
                        scheduledWindows.delete(item._id);
                    }
                }, delay);

                scheduledWindows.set(item._id, timer);
            };

            if (item.isDaily) {
                const showTime = new Date(item.showTime);
                const [hour, minute, second] = [showTime.getHours(), showTime.getMinutes(), showTime.getSeconds()];

                const nextTime = new Date();
                nextTime.setHours(hour, minute, second, 0);
                if (nextTime <= now) nextTime.setDate(nextTime.getDate() + 1);

                const delay = nextTime - now;
                console.log(`Scheduling DAILY "${item.title}" in ${delay / 1000}s`);

                if (alreadyScheduled) clearTimeout(scheduledWindows.get(item._id));

                scheduleTask(delay, true);
            } else {
                const showTime = new Date(item.showTime);
                const delay = showTime - now;

                if (delay > 0) {
                    console.log(`Scheduling ONCE "${item.title}" in ${delay / 1000}s`);
                    scheduleTask(delay, false);
                } else {
                    console.log(`Skipped "${item.title}" — showTime already passed`);
                }
            }
        });
    }

    const launchWindow = async (item) => {
        if (
            attendanceData &&
            attendanceData.isPunchIn === true
        ) {
            if (item.isForDailyUpdate && (!item.windowLink || item.windowLink.trim() === '')) {
                console.log(`Opening fallback daily update window for "${item.title}"`);
                if (window.electronAPI) {
                    await window.electronAPI.focusMainWindow();
                }
                setIsModelOpen(true);
            } else {
                if (window.electronAPI) {
                    await window.electronAPI.openOfficeUpdateWindow(item);
                }
            }
        }
    }

    const onFinish = async (values) => {
        try {
            await apiCall({
                method: HttpMethod.POST,
                url: endpoints.addDailyUpdate,
                data: {
                    todayWorkUpdate: values.todayWorkUpdate,
                    tomorrowPlanning: values.tomorrowPlanning,
                },
                setIsLoading: setLoading,
                successCallback: async () => {
                    setIsModelOpen(false)
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Modal
            title={(<div className="text-lg">Daily Work Update</div>)}
            maskClosable={false}
            centered
            closeIcon={false}
            // cancelButtonProps={{hidden: true}}
            open={isModelOpen}
            confirmLoading={loading}
            onOk={() => form.submit()}
            onCancel={() => setIsModelOpen(false)}
            onClose={() => setIsModelOpen(false)}
            okText="Submit"
        >
            <div className="flex flex-col gap-2 mt-2">
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Today’s Work Update"
                        name="todayWorkUpdate"
                        rules={[{required: true, message: 'Please enter today’s work update'}]}
                    >
                        <TextArea rows={4} placeholder="What did you work on today?"/>
                    </Form.Item>

                    <Form.Item
                        label="Tomorrow’s Planning"
                        name="tomorrowPlanning"
                        rules={[{required: true, message: 'Please enter tomorrow’s planning'}]}
                    >
                        <TextArea rows={4} placeholder="What are your plans for tomorrow?"/>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
}
