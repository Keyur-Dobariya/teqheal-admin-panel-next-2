'use client'

import React, {useState, useEffect, useRef} from "react";
import {
    Card, Col,
    DatePicker,
    Form,
    Input,
    Modal, Row,
    Select
} from "antd";

import appString from "../utils/appString";
import {endpoints} from "../api/apiEndpoints";
import apiCall, {HttpMethod} from "../api/apiServiceProvider";
import appKeys from "../utils/appKeys";
import dayjs from "dayjs";
import {Box, FileText, Users} from "../utils/icons";
import appColor from "../utils/appColor";
import {
    projectTypeLabel,
    taskColumnStatusLabel, taskPriorityLabel,
} from "../utils/enum";
import {UserSelect} from "../components/CommonComponents";

const {TextArea} = Input;

export default function ProjectModel({
                                             isModelOpen,
                                             setIsModelOpen,
                                             activeUsersData,
                                             clientData,
                                             selectedRecord,
                                             onSuccessCallback,
                                         }) {
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();
    const containerRef = useRef(null);
    const isEditing = !!selectedRecord;
    const modelTitle = isEditing ? appString.updateProject : appString.addProject;

    useEffect(() => {
        if (isModelOpen) {
            form.resetFields();

            const formData = {
                projectStatus: taskColumnStatusLabel[0].value,
                projectPriority: taskPriorityLabel[0].value,
                projectType: "fullstackDevelopment",
            };

            form.setFieldsValue(formData);

            if (isEditing && selectedRecord) {
                const {
                    teamLeader = [],
                    teamManager = [],
                    teamMembers = [],
                    startDate,
                    endDate,
                    ...rest
                } = selectedRecord;

                const cleanFormData = {
                    ...rest,
                    teamLeader: teamLeader[0]?.userId || undefined,
                    teamManager: teamManager[0]?.userId || undefined,
                    teamMembers: teamMembers.map((member) => member.userId),
                    startDate: startDate ? dayjs(startDate) : null,
                    endDate: endDate ? dayjs(endDate) : null,
                };

                form.setFieldsValue(cleanFormData);
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
                teamLeader: formValues.teamLeader
                    ? [{ userId: formValues.teamLeader }]
                    : [],

                teamManager: formValues.teamManager
                    ? [{ userId: formValues.teamManager }]
                    : [],

                teamMembers: Array.isArray(formValues.teamMembers)
                    ? formValues.teamMembers.map(id => ({ userId: id }))
                    : []
            };

            await apiCall({
                method: HttpMethod.POST,
                url: isEditing ? `${endpoints.updateProject}/${selectedRecord._id}` : endpoints.updateProject,
                data: payload,
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
            width={700}
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
                    <div className="flex flex-col gap-5 py-3">
                        <Card
                            title={(
                                <div className="flex items-center gap-2">
                                    <FileText color={appColor.secondPrimary} />
                                    <div>{appString.basicInfo}</div>
                                </div>
                            )}>
                            <div className="pt-4 px-4">
                                <Row gutter={16}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name={appKeys.clientName} label={appString.clientName} span={12} rules={[
                                            {
                                                required: true,
                                                message: "Client Selection Required"
                                            }
                                        ]}>
                                            <Select
                                                placeholder="Select Client"
                                                allowClear
                                                showSearch
                                                options={clientData.map(client => ({
                                                    label: client.clientName,
                                                    value: client._id
                                                }))}
                                                filterOption={(input, option) =>
                                                    option.label?.toLowerCase().includes(input.toLowerCase())
                                                }
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name={appKeys.projectName} label={appString.projectName}
                                                   rules={[{required: true, message: `${appString.projectName} is required`}]}>
                                            <Input
                                                placeholder={`Enter ${appString.projectName.toLowerCase()}`}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item name={appKeys.projectDescription} label={appString.projectDescription}>
                                            <TextArea
                                                autoSize={{minRows: 2, maxRows: 3}}
                                                placeholder={`Enter ${appString.projectDescription.toLowerCase()}`}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        </Card>
                        <Card
                            title={(
                                <div className="flex items-center gap-2">
                                    <Box color={appColor.danger} />
                                    <div>{appString.projectInfo}</div>
                                </div>
                            )}>
                            <div className="pt-4 px-4">
                                <Row gutter={16}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name={appKeys.projectStatus} label={appString.projectStatus}>
                                            <Select options={taskColumnStatusLabel}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name={appKeys.projectPriority} label={appString.projectPriority}>
                                            <Select
                                                placeholder="Select Priority"
                                                options={taskPriorityLabel.map((item) => ({
                                                    label: (
                                                        <div className="flex items-center gap-1 text-[14px]">
                                                            {item.icon}
                                                            {item.label}
                                                        </div>
                                                    ),
                                                    value: item.value,
                                                }))}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item name={appKeys.startDate} label={appString.startDate}>
                                            <DatePicker
                                                placeholder={appString.startDate}
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item name={appKeys.endDate} label={appString.endDate}>
                                            <DatePicker
                                                placeholder={appString.endDate}
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name={appKeys.projectType} label={appString.projectType}>
                                            <Select showSearch options={projectTypeLabel}/>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        </Card>
                        <Card
                            title={(
                                <div className="flex items-center gap-2">
                                    <Users color={appColor.success} />
                                    <div>{appString.assigneeInfo}</div>
                                </div>
                            )}>
                            <div className="pt-4 px-4">
                                <Row gutter={16}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name={appKeys.teamManager} label={appString.teamManager}>
                                            <UserSelect users={activeUsersData} placeholder={`Select ${appString.teamManager.toLowerCase()}`}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name={appKeys.teamLeader} label={appString.teamLeader}>
                                            <UserSelect users={activeUsersData} placeholder={`Select ${appString.teamLeader.toLowerCase()}`}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item name={appKeys.teamMembers} label={appString.teamMembers}>
                                            <UserSelect users={activeUsersData} placeholder={`Select ${appString.teamMembers.toLowerCase()}`} isMultiple={true}/>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        </Card>
                    </div>
                </Form>
            </div>
        </Modal>
    );
}
