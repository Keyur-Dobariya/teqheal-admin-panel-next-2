'use client'

import React, {useEffect} from "react";
import {
    Col,
    Form,
    Input,
    Modal, Row,
    Select, Switch,
} from "antd";

import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {useActionLoading} from "../../../hooks/useActionLoading";
import {routeConfig} from "../../../utils/pageRoutes";
import {convertCamelCase, convertLowerCaseKey} from "../../../utils/utils";
import {endpoints} from "../../../api/apiEndpoints";

export default function ModuleModel({
                                             isModelOpen,
                                             setIsModelOpen,
                                             modules,
                                             actions,
                                             selectedRecord,
                                             onSuccessCallback,
                                         }) {
    const {withLoading} = useActionLoading();
    const apiLoading = withLoading();
    const [form] = Form.useForm();
    const isAllPermission = Form.useWatch("isAllPermission", form);
    const isEditing = !!selectedRecord;
    const modelTitle = isEditing ? "Update Module" : "Add Module";

    useEffect(() => {
        if (isModelOpen) {
            form.resetFields();

            if (isEditing && selectedRecord) {
                const formData = {
                    ...selectedRecord,
                    moduleName: convertCamelCase(selectedRecord.moduleName),
                    actions: selectedRecord?.actions.map(action => action._id)
                };

                form.setFieldsValue(formData);
            }
        }
    }, [isModelOpen, isEditing, selectedRecord, form]);

    const handleCancel = () => {
        setIsModelOpen(false);
        form.resetFields();
    };

    const handleAddOrUpdate = async (values) => {
        await apiLoading.run(async () => {
            let actions = [];
            values?.actions.map(action => {
                actions.push({
                    _id: action?.value || action,
                })
            })
            const postData = {
                moduleName: convertLowerCaseKey(values.moduleName.trim()),
                description: values.description,
                actions: actions,
            };

            await apiCall({
                method: HttpMethod.POST,
                url: endpoints.addUpdateModule(selectedRecord?._id),
                data: postData,
                showSuccessMessage: true,
                successCallback: (data) => {
                    onSuccessCallback(data);
                    handleCancel();
                },
            });
        });
    };

    const addedModulePaths = modules.map(module => module.moduleName);

    const filteredModuleRouteOptions = Object.values(routeConfig)
        .filter(route =>
            route.path !== '/' &&
            !addedModulePaths.includes(route.key)
        )
        .map(route => ({
            value: route.key,
            label: convertCamelCase(route.key),
        }));

    return (
        <Modal
            title={modelTitle}
            open={isModelOpen}
            maskClosable={false}
            onCancel={handleCancel}
            onOk={() => form.submit()}
            confirmLoading={apiLoading.loading}
            okText={modelTitle}
            width={450}
        >
            <Form form={form} onFinish={handleAddOrUpdate} layout="vertical"
                  onValuesChange={(changedValues, allValues) => {
                      form.setFieldsValue(allValues);
                  }}
            >
                <Form.Item
                    name="moduleName"
                    label="Module Name"
                    rules={[{required: true, message: "Please select the module name!"}]}
                >
                    <Select
                        showSearch
                        placeholder="Select module name"
                        options={filteredModuleRouteOptions}
                        filterOption={(input, option) =>
                            option.label.toLowerCase().includes(input.toLowerCase())
                        }
                        style={{width: "100%"}}
                    />
                </Form.Item>

                <Form.Item name="actions" label="Actions">
                    <Select
                        mode="multiple"
                        options={actions}
                        placeholder="Select actions (e.g., Read, Add, Delete)"
                        style={{width: '100%'}}
                        optionFilterProp="label"
                        disabled={isAllPermission === true}
                        allowClear
                    />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="isAllPermission" label="Is All Permission">
                            <Switch/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="isForSuperAdmin" label="Is For Super Admin">
                            <Switch/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="isActive" label="Is Active">
                            <Switch checked/>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="description" label="Description">
                    <Input.TextArea placeholder="Enter module description" rows={3}/>
                </Form.Item>
            </Form>
        </Modal>
    );
}
