'use client'

import React, {useEffect, useState} from "react";
import {Modal, Button, Input, Select, Switch, DatePicker, Form, Row, Col, Popconfirm} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { eventLeaveTypeMenuList, eventTypeMenuList } from "../../utils/enum";
import appKeys from "../../utils/appKeys";
import appString from "../../utils/appString";
import apiCall, {HttpMethod} from "../../api/apiServiceProvider";
import {endpoints} from "../../api/apiEndpoints";
import {isAdmin} from "../../dataStorage/DataPref";

const { TextArea } = Input;

const EventDialog = ({ open, onOpenChange, event, initialDate, onSave }) => {
    const [form] = Form.useForm();
    const [isSubmitLoading, setSubmitLoading] = useState(false);
    const [isDeleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        if (event) {
            form.setFieldsValue({
                ...event,
                [appKeys.eventDate]: event.eventDate ? dayjs(event.eventDate) : undefined,
                [appKeys.endDate]: event.endDate ? dayjs(event.endDate) : undefined,
                [appKeys.eventLeaveType]: event.eventLeaveType || 'fullDay',
                [appKeys.isLeaveOnDay]: event.isLeaveOnDay || false,
            });
        } else {
            form.setFieldsValue({
                [appKeys.eventType]: 'officeEvent',
                [appKeys.eventLeaveType]: 'fullDay',
                [appKeys.eventDate]: initialDate ? dayjs(initialDate) : dayjs(new Date()),
                [appKeys.endDate]: undefined,
                [appKeys.isLeaveOnDay]: false,
            });
        }
    }, [event, initialDate, form]);

    const handleEventSave = async () => {
        const eventData = form.getFieldsValue();
        await apiCall({
            method: HttpMethod.POST,
            url: event ? `${endpoints.updateEvent}${event._id}` : endpoints.addEvent,
            data: eventData,
            setIsLoading: setSubmitLoading,
            successCallback: (data) => {
                onSave(data);
                onOpenChange(false);
            },
            errorCallback: () => {
                onOpenChange(false);
            }
        });
    };

    const handleEventDelete = async () => {
        await apiCall({
            method: HttpMethod.DELETE,
            url: `${endpoints.deleteEvent}${event._id}`,
            setIsLoading: setDeleteLoading,
            successCallback: (data) => {
                onSave(data);
                onOpenChange(false);
            },
            errorCallback: () => {
                onOpenChange(false);
            }
        });
    };

    const handleFieldChange = (changedValues, allValues) => {
        form.setFieldsValue(allValues);
    };

    return (
        <Modal
            open={open}
            title={event ? 'Edit Event' : 'Create New Event'}
            onCancel={() => onOpenChange(false)}
            footer={null}
            width={550}
        >
            <Form
                form={form}
                layout="vertical"
                onValuesChange={handleFieldChange}
                disabled={!isAdmin()}
            >
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name={appKeys.eventTitle}
                            label={appString.eventTitle}
                            rules={[{ required: true, message: 'Please enter the event title!' }]}
                        >
                            <Input placeholder="Enter event title" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name={appKeys.eventType}
                            label={appString.eventType}
                            rules={[{ required: true, message: 'Please select event type!' }]}
                        >
                            <Select
                                options={eventTypeMenuList}
                                showSearch
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item
                    name={appKeys.eventDetail}
                    label={appString.eventDetail}
                >
                    <TextArea
                        placeholder="Add event description..."
                        autoSize={{ minRows: 3, maxRows: 5 }}
                    />
                </Form.Item>
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name={appKeys.eventDate}
                            label={appString.eventDate}
                            rules={[{ required: true, message: 'Please select start date!' }]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                placeholder="Select start date"
                                onChange={(date) => {
                                    form.setFieldsValue({ [appKeys.eventDate]: date });
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name={appKeys.endDate}
                            label={appString.endDate}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                placeholder="Select end date"
                                disabledDate={(date) => {
                                    const startDate = form.getFieldValue(appKeys.eventDate);
                                    return startDate ? date.isBefore(startDate, 'day') : false;
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name={appKeys.isLeaveOnDay}
                            label={appString.isLeaveOnDay}
                        >
                            <Switch />
                        </Form.Item>
                    </Col>
                    {form.getFieldValue(appKeys.isLeaveOnDay) === true && <Col span={12}>
                        <Form.Item
                            name={appKeys.eventLeaveType}
                            label={appString.eventLeaveType}
                        >
                            <Select
                                options={eventLeaveTypeMenuList}
                                showSearch
                                allowClear
                            />
                        </Form.Item>
                    </Col>}
                </Row>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {event && (
                            <Popconfirm
                                title={appString.deleteConfirmation}
                                okText="Yes"
                                cancelText="No"
                                onConfirm={handleEventDelete}
                            >
                                <Button
                                    type="primary"
                                    danger
                                    loading={isDeleteLoading}
                                    icon={<DeleteOutlined />}
                                >
                                    Delete Event
                                </Button>
                            </Popconfirm>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <Button type="default" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="primary" loading={isSubmitLoading} onClick={handleEventSave}>
                            {event ? 'Update Event' : 'Create Event'}
                        </Button>
                    </div>
                </div>
            </Form>
        </Modal>
    );
};

export default EventDialog;