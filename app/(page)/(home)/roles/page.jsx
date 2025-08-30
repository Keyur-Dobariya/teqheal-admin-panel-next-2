"use client";
import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select } from "antd";
import axios from "axios";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints";

export default function Roles() {
    const [roles, setRoles] = useState([]);
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => { fetchRoles(); }, []);

    const fetchRoles = async () => {
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.companyRoles("68b155824a332d6973b7fa07"),
            setIsLoading: false,
            showSuccessMessage: false,
            successCallback: (data) => {
                setRoles(data);
            },
        });
    };

    const handleAdd = async (values) => {
        await apiCall({
            method: HttpMethod.POST,
            url: endpoints.roles,
            data: values,
            setIsLoading: false,
            showSuccessMessage: false,
            successCallback: (data) => {
                fetchRoles();
                setOpen(false);
            },
        });
    };

    const columns = [
        { title: "Role Name", dataIndex: "name" },
        { title: "Description", dataIndex: "description" },
        { title: "Action", render: (_, record) => (
                <Button onClick={() => console.log("Manage Permissions", record._id)}>
                    Manage Permissions
                </Button>
            )}
    ];

    return (
        <div className="p-5">
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Roles</h2>
                <Button type="primary" onClick={() => setOpen(true)}>+ Add Role</Button>
            </div>
            <Table dataSource={roles} columns={columns} rowKey="_id" />

            <Modal title="Add Role" open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()}>
                <Form form={form} onFinish={handleAdd} layout="vertical">
                    <Form.Item name="name" label="Role Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
