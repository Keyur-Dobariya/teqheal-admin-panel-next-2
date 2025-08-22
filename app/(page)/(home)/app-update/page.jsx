'use client';

import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Switch, message } from "antd";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints";

export default function Home() {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVersion, setEditingVersion] = useState(null);
    const [form] = Form.useForm();

    // Fetch all app versions on mount
    useEffect(() => {
        fetchVersions();
    }, []);

    const fetchVersions = () => {
        apiCall({
            method: HttpMethod.GET,
            url: endpoints.getAllSoftApps,
            showSuccessMessage: false,
            successCallback: (response) => {
                setVersions(response.data || []);
            },
            errorCallback: (error) => {
                console.error("Error fetching versions:", error);
            },
            setIsLoading: setLoading,
        });
    };

    const handleAddEditVersion = (values) => {
        const payload = {
            version: values.version,
            windows: {
                fileUrl: values.windowsFileUrl,
                fileName: values.windowsFileName,
                size: parseInt(values.windowsSize) || 0,
            },
            macOs: {
                fileUrl: values.macOsFileUrl,
                fileName: values.macOsFileName,
                size: parseInt(values.macOsSize) || 0,
            },
            linux: {
                fileUrl: values.linuxFileUrl,
                fileName: values.linuxFileName,
                size: parseInt(values.linuxSize) || 0,
            },
            forceUpdate: values.forceUpdate,
            releaseNotes: values.releaseNotes,
        };

        const apiUrl = editingVersion
            ? `${endpoints.updateSoftApp}/${editingVersion._id}`
            : endpoints.addSoftApp;

        apiCall({
            method: HttpMethod.POST,
            url: apiUrl,
            data: payload,
            showSuccessMessage: true,
            successCallback: () => {
                fetchVersions();
                setIsModalOpen(false);
                setEditingVersion(null);
                form.resetFields();
            },
            errorCallback: (error) => {
                console.error("Error saving version:", error);
            },
            setIsLoading: setLoading,
        });
    };

    const handleDeleteVersion = (id) => {
        Modal.confirm({
            title: "Are you sure you want to delete this version?",
            onOk: () => {
                apiCall({
                    method: HttpMethod.DELETE,
                    url: `${endpoints.deleteSoftApp}/${id}`,
                    showSuccessMessage: true,
                    successCallback: () => {
                        fetchVersions();
                    },
                    errorCallback: (error) => {
                        console.error("Error deleting version:", error);
                    },
                    setIsLoading: setLoading,
                });
            },
        });
    };

    const handleEditVersion = (record) => {
        setEditingVersion(record);
        form.setFieldsValue({
            version: record.version,
            windowsFileUrl: record.windows?.fileUrl,
            windowsFileName: record.windows?.fileName,
            windowsSize: record.windows?.size,
            macOsFileUrl: record.macOs?.fileUrl,
            macOsFileName: record.macOs?.fileName,
            macOsSize: record.macOs?.size,
            linuxFileUrl: record.linux?.fileUrl,
            linuxFileName: record.linux?.fileName,
            linuxSize: record.linux?.size,
            forceUpdate: record.forceUpdate,
            releaseNotes: record.releaseNotes,
        });
        setIsModalOpen(true);
    };

    const columns = [
        {
            title: "Version",
            dataIndex: "version",
            key: "version",
        },
        {
            title: "Windows File",
            key: "windows",
            render: (_, record) =>
                record.windows?.fileName || "N/A",
        },
        {
            title: "macOS File",
            key: "macOs",
            render: (_, record) =>
                record.macOs?.fileName || "N/A",
        },
        {
            title: "Linux File",
            key: "linux",
            render: (_, record) =>
                record.linux?.fileName || "N/A",
        },
        {
            title: "Force Update",
            dataIndex: "forceUpdate",
            key: "forceUpdate",
            render: (forceUpdate) => (forceUpdate ? "Yes" : "No"),
        },
        {
            title: "Release Notes",
            dataIndex: "releaseNotes",
            key: "releaseNotes",
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <div className="flex space-x-2">
                    <Button type="link" onClick={() => handleEditVersion(record)}>
                        Edit
                    </Button>
                    <Button
                        type="link"
                        danger
                        onClick={() => handleDeleteVersion(record._id)}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">App Version Management</h1>
                <div className="flex space-x-2">
                    <Button
                        type="primary"
                        onClick={() => {
                            setEditingVersion(null);
                            form.resetFields();
                            setIsModalOpen(true);
                        }}
                    >
                        Add Version
                    </Button>
                </div>
            </div>
            <Table
                columns={columns}
                dataSource={versions}
                rowKey="_id"
                loading={loading}
                className="shadow-md rounded-lg"
            />
            <Modal
                title={editingVersion ? "Edit Version" : "Add Version"}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingVersion(null);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddEditVersion}
                    initialValues={{
                        forceUpdate: false,
                        releaseNotes: "",
                    }}
                >
                    <Form.Item
                        name="version"
                        label="Version"
                        rules={[{ required: true, message: "Please enter the version" }]}
                    >
                        <Input placeholder="e.g., 1.0.1" />
                    </Form.Item>
                    <Form.Item name="windowsFileUrl" label="Windows File URL">
                        <Input placeholder="e.g., https://example.com/windows/TeqhealTracker.exe" />
                    </Form.Item>
                    <Form.Item name="windowsFileName" label="Windows File Name">
                        <Input placeholder="e.g., TeqhealTracker-1.0.1.exe" />
                    </Form.Item>
                    <Form.Item name="windowsSize" label="Windows File Size (bytes)">
                        <Input type="number" placeholder="e.g., 52428800" />
                    </Form.Item>
                    <Form.Item name="macOsFileUrl" label="macOS File URL">
                        <Input placeholder="e.g., https://example.com/macos/TeqhealTracker.dmg" />
                    </Form.Item>
                    <Form.Item name="macOsFileName" label="macOS File Name">
                        <Input placeholder="e.g., TeqhealTracker-1.0.1.dmg" />
                    </Form.Item>
                    <Form.Item name="macOsSize" label="macOS File Size (bytes)">
                        <Input type="number" placeholder="e.g., 62914560" />
                    </Form.Item>
                    <Form.Item name="linuxFileUrl" label="Linux File URL">
                        <Input placeholder="e.g., https://example.com/linux/TeqhealTracker.AppImage" />
                    </Form.Item>
                    <Form.Item name="linuxFileName" label="Linux File Name">
                        <Input placeholder="e.g., TeqhealTracker-1.0.1.AppImage" />
                    </Form.Item>
                    <Form.Item name="linuxSize" label="Linux File Size (bytes)">
                        <Input type="number" placeholder="e.g., 73400320" />
                    </Form.Item>
                    <Form.Item name="forceUpdate" label="Force Update" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name="releaseNotes" label="Release Notes">
                        <Input.TextArea rows={4} placeholder="e.g., Added new features and bug fixes" />
                    </Form.Item>
                    <Form.Item>
                        <div className="flex justify-end space-x-2">
                            <Button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingVersion(null);
                                    form.resetFields();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {editingVersion ? "Update" : "Add"}
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
