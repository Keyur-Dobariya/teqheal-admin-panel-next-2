"use client";
import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input } from "antd";
import axios from "axios";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints";

export default function Companies() {
    const [companies, setCompanies] = useState([]);
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.companyModules("68b155824a332d6973b7fa07"),
            setIsLoading: false,
            showSuccessMessage: false,
            successCallback: (data) => {
                setCompanies(data);
            },
        });
    };

    const handleAdd = async (values) => {
        await apiCall({
            method: HttpMethod.POST,
            url: endpoints.companies,
            data: values,
            setIsLoading: false,
            showSuccessMessage: false,
            successCallback: (data) => {
                fetchCompanies();
                setOpen(false);
            },
        });
    };

    const columns = [
        { title: "Company Name", dataIndex: "name" },
        { title: "Domain", dataIndex: "domain" },
        { title: "Action", render: (_, record) => (
                <Button onClick={() => console.log("Manage Modules", record._id)}>
                    Manage Modules
                </Button>
            )}
    ];

    return (
        <div className="p-5">
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Companies</h2>
                <Button type="primary" onClick={() => setOpen(true)}>+ Add Company</Button>
            </div>
            <Table dataSource={companies} columns={columns} rowKey="_id" />

            <Modal title="Add Company" open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()}>
                <Form form={form} onFinish={handleAdd} layout="vertical">
                    <Form.Item name="name" label="Company Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="domain" label="Domain">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
