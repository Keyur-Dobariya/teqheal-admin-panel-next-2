'use client'

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select } from 'antd';
import { addApp, updateApp, addAppVersion } from './appApiUtils';
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints"; // Adjust path to your API file

const { Option } = Select;

export default function Home() {
    const [apps, setApps] = useState([]);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isVersionModalVisible, setIsVersionModalVisible] = useState(false);
    const [isFieldModalVisible, setIsFieldModalVisible] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [fields, setFields] = useState([{ key: '', type: 'string', defaultValue: '' }]);
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();
    const [versionForm] = Form.useForm();
    const [fieldForm] = Form.useForm();

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        try {
            setIsLoading(true);
            await apiCall({
                method: HttpMethod.GET,
                url: endpoints.getAllApps,
                setIsLoading,
                showSuccessMessage: false,
                successCallback: (response) => {
                    setApps(response.data);
                },
            });
        } catch (error) {
        }
    };

    const handleAddApp = async (values) => {
        try {
            await addApp(
                { ...values, fields },
                setIsLoading,
                (response) => {
                    setIsAddModalVisible(false);
                    form.resetFields();
                    setFields([{ key: '', type: 'string', defaultValue: '' }]);
                    fetchApps();
                }
            );
        } catch (error) {
            console.log("error=>", error)
        }
    };

    const handleAddVersion = async (values) => {
        try {
            await addAppVersion(
                selectedApp._id,
                values,
                setIsLoading,
                (response) => {
                    setIsVersionModalVisible(false);
                    versionForm.resetFields();
                    fetchApps();
                }
            );
        } catch (error) {
        }
    };

    const handleUpdateFields = async (values) => {
        try {
            await updateApp(
                selectedApp._id,
                { fields: values.fields },
                setIsLoading,
                (response) => {
                    setIsFieldModalVisible(false);
                    fieldForm.resetFields();
                    fetchApps();
                }
            );
        } catch (error) {
        }
    };

    const handleDeleteApp = async (id) => {
        try {
            await apiCall({
                method: HttpMethod.DELETE,
                url: `${endpoints.deleteApp}/${id}`,
                setIsLoading,
                showSuccessMessage: true,
                successCallback: () => {
                    fetchApps();
                },
            });
        } catch (error) {
        }
    };

    const addField = () => {
        setFields([...fields, { key: '', type: 'string', defaultValue: '' }]);
    };

    const updateField = (index, key, value) => {
        const newFields = [...fields];
        newFields[index][key] = value;
        setFields(newFields);
    };

    const removeField = (index) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const columns = [
        { title: 'App Name', dataIndex: 'appName', key: 'appName' },
        { title: 'Package Name', dataIndex: 'packageName', key: 'packageName' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="flex space-x-2">
                    <Button
                        type="primary"
                        onClick={() => {
                            setSelectedApp(record);
                            setIsFieldModalVisible(true);
                            fieldForm.setFieldsValue({ fields: record.fields });
                        }}
                        className="bg-blue-500 hover:bg-blue-600"
                        disabled={isLoading}
                    >
                        Manage Fields
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => {
                            setSelectedApp(record);
                            setIsVersionModalVisible(true);
                            const lastVersion = record.versions[record.versions.length - 1];
                            versionForm.setFieldsValue({
                                versionName: '',
                                versionCode: '',
                                versionConfig: lastVersion
                                    ? Object.fromEntries(lastVersion.versionConfig)
                                    : Object.fromEntries(record.fields.map((f) => [f.key, f.defaultValue])),
                            });
                        }}
                        className="bg-green-500 hover:bg-green-600"
                        disabled={isLoading}
                    >
                        Add Version
                    </Button>
                    <Button
                        type="primary"
                        danger
                        onClick={() => handleDeleteApp(record._id)}
                        className="bg-red-500 hover:bg-red-600"
                        disabled={isLoading}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <Button
                type="primary"
                onClick={() => setIsAddModalVisible(true)}
                className="mb-4 bg-blue-500 hover:bg-blue-600"
                disabled={isLoading}
            >
                Add New App
            </Button>
            <Table
                dataSource={apps}
                columns={columns}
                rowKey="_id"
                className="shadow-lg rounded-lg"
                loading={isLoading}
            />

            <Modal
                title="Add New App"
                open={isAddModalVisible}
                onCancel={() => {
                    setIsAddModalVisible(false);
                    setFields([{ key: '', type: 'string', defaultValue: '' }]);
                }}
                footer={null}
                width={800}
            >
                <Form form={form} onFinish={handleAddApp} layout="vertical">
                    <Form.Item
                        name="appName"
                        label="App Name"
                        rules={[{ required: true, message: 'Please enter app name' }]}
                    >
                        <Input className="rounded" />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea className="rounded" />
                    </Form.Item>
                    <Form.Item
                        name="packageName"
                        label="Package Name"
                        rules={[{ required: true, message: 'Please enter package name' }]}
                    >
                        <Input className="rounded" />
                    </Form.Item>
                    <Form.Item name="icon" label="Icon URL">
                        <Input className="rounded" />
                    </Form.Item>
                    <Form.Item
                        name="versionName"
                        label="Version Name"
                        rules={[{ required: true, message: 'Please enter version name' }]}
                    >
                        <Input className="rounded" />
                    </Form.Item>
                    <Form.Item
                        name="versionCode"
                        label="Version Code"
                        rules={[{ required: true, message: 'Please enter version code' }]}
                    >
                        <Input type="number" className="rounded" />
                    </Form.Item>
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Fields</h3>
                        {fields.map((field, index) => (
                            <div key={index} className="flex space-x-2 mb-2">
                                <Input
                                    placeholder="Key"
                                    value={field.key}
                                    onChange={(e) => updateField(index, 'key', e.target.value)}
                                    className="rounded"
                                />
                                <Select
                                    value={field.type}
                                    onChange={(value) => updateField(index, 'type', value)}
                                    className="w-32"
                                >
                                    <Option value="string">String</Option>
                                    <Option value="number">Number</Option>
                                    <Option value="boolean">Boolean</Option>
                                    <Option value="array">Array</Option>
                                    <Option value="object">Object</Option>
                                </Select>
                                <Input
                                    placeholder="Default Value"
                                    value={field.defaultValue}
                                    onChange={(e) => updateField(index, 'defaultValue', e.target.value)}
                                    className="rounded"
                                />
                                <Button
                                    type="primary"
                                    danger
                                    onClick={() => removeField(index)}
                                    className="bg-red-500 hover:bg-red-600"
                                    disabled={isLoading}
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                        <Button
                            onClick={addField}
                            className="bg-blue-500 hover:bg-blue-600"
                            disabled={isLoading}
                        >
                            Add Field
                        </Button>
                    </div>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="bg-blue-500 hover:bg-blue-600"
                            loading={isLoading}
                        >
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Add New Version"
                open={isVersionModalVisible}
                onCancel={() => setIsVersionModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form form={versionForm} onFinish={handleAddVersion} layout="vertical">
                    <Form.Item
                        name="versionName"
                        label="Version Name"
                        rules={[{ required: true, message: 'Please enter version name' }]}
                    >
                        <Input className="rounded" />
                    </Form.Item>
                    <Form.Item
                        name="versionCode"
                        label="Version Code"
                        rules={[{ required: true, type: 'number', message: 'Please enter version code' }]}
                    >
                        <Input type="number" className="rounded" />
                    </Form.Item>
                    {selectedApp?.fields.map((field, index) => (
                        <Form.Item
                            key={field.key}
                            name={['versionConfig', field.key]}
                            label={field.key}
                            initialValue={versionForm.getFieldValue(['versionConfig', field.key]) || field.defaultValue}
                        >
                            {field.type === 'boolean' ? (
                                <Select className="w-full rounded">
                                    <Option value={true}>True</Option>
                                    <Option value={false}>False</Option>
                                </Select>
                            ) : field.type === 'number' ? (
                                <Input type="number" className="rounded" />
                            ) : (
                                <Input className="rounded" />
                            )}
                        </Form.Item>
                    ))}
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="bg-blue-500 hover:bg-blue-600"
                            loading={isLoading}
                        >
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Manage Fields"
                open={isFieldModalVisible}
                onCancel={() => setIsFieldModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form form={fieldForm} onFinish={handleUpdateFields} layout="vertical">
                    <Form.List name="fields">
                        {(formFields, { add, remove }) => (
                            <>
                                {formFields.map((formField, index) => (
                                    <div key={formField.key} className="flex space-x-2 mb-2">
                                        <Form.Item
                                            {...formField}
                                            name={[formField.name, 'key']}
                                            rules={[{ required: true, message: 'Please enter field key' }]}
                                        >
                                            <Input placeholder="Key" className="rounded" />
                                        </Form.Item>
                                        <Form.Item
                                            {...formField}
                                            name={[formField.name, 'type']}
                                            rules={[{ required: true, message: 'Please select field type' }]}
                                        >
                                            <Select className="w-32">
                                                <Option value="string">String</Option>
                                                <Option value="number">Number</Option>
                                                <Option value="boolean">Boolean</Option>
                                                <Option value="array">Array</Option>
                                                <Option value="object">Object</Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            {...formField}
                                            name={[formField.name, 'defaultValue']}
                                            rules={[{ required: true, message: 'Please enter default value' }]}
                                        >
                                            <Input placeholder="Default Value" className="rounded" />
                                        </Form.Item>
                                        <Button
                                            type="primary"
                                            danger
                                            onClick={() => remove(formField.name)}
                                            className="bg-red-500 hover:bg-red-600"
                                            disabled={isLoading}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    onClick={() => add({ key: '', type: 'string', defaultValue: '' })}
                                    className="bg-blue-500 hover:bg-blue-600"
                                    disabled={isLoading}
                                >
                                    Add Field
                                </Button>
                            </>
                        )}
                    </Form.List>
                    <Form.Item className="mt-4">
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="bg-blue-500 hover:bg-blue-600"
                            loading={isLoading}
                        >
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}