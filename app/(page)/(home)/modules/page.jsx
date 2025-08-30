"use client";
import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, Tag } from "antd";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints";

export default function Page() {
    const [modules, setModules] = useState([]);
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchModules();
    }, []);

    const fetchModules = async () => {
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.modules,
            setIsLoading: false,
            showSuccessMessage: false,
            successCallback: (data) => {
                setModules(data);
            },
        });
    };

    const handleAdd = async (values) => {
        await apiCall({
            method: HttpMethod.POST,
            url: endpoints.modules,
            data: values,
            setIsLoading: false,
            showSuccessMessage: true,
            successCallback: () => {
                fetchModules();
                setOpen(false);
                form.resetFields();
            },
        });
    };

    const columns = [
        { title: "Module Name", dataIndex: "name" },
        { title: "Description", dataIndex: "description" },
        {
            title: "Permissions",
            dataIndex: "permissions",
            render: (perms) =>
                perms?.map((p) => (
                    <Tag color="blue" key={p}>
                        {p}
                    </Tag>
                )),
        },
    ];

    return (
        <div className="p-5">
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Modules</h2>
                <Button type="primary" onClick={() => setOpen(true)}>
                    + Add Module
                </Button>
            </div>

            <Table dataSource={modules} columns={columns} rowKey="_id" />

            <Modal
                title="Add Module"
                open={open}
                onCancel={() => setOpen(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} onFinish={handleAdd} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Module Name"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name="permissions" label="Permissions">
                        <Select
                            mode="tags"
                            style={{ width: "100%" }}
                            placeholder="Enter permissions (e.g., read, add, update, delete)"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
