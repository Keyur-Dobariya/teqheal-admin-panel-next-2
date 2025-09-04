"use client";
import React, {useState, useEffect, useRef} from "react";
import {
    Button,
    Modal,
    Form,
    Input,
    Switch,
    Row,
    Col, DatePicker, Upload
} from "antd";
import {
    ApartmentOutlined,
    PlusOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import {ModuleTreeModal} from "./ModuleTreeModal";

export const CompanyModal = ({
                                 isModelOpen,
                                 setIsModelOpen,
                                 modules,
                                 modulePermission,
                                 selectedRecord,
                                 setSelectedRecord,
                                 loading,
                                 onSubmit
                             }) => {
    const [isModuleModelOpen, setIsModuleModelOpen] = useState(false);
    const [form] = Form.useForm();
    const isEditing = !!selectedRecord;
    const [companyIcon, setCompanyIcon] = useState();
    const [adminPermissions, setAdminPermissions] = useState([]);
    const [userPermissions, setUserPermissions] = useState([]);
    const containerRef = useRef(null);

    useEffect(() => {
        if (selectedRecord) {
            setAdminPermissions(selectedRecord?.adminPermissions || []);
            setUserPermissions(selectedRecord?.userPermissions || []);
        } else {
            setAdminPermissions(modulePermission?.adminPermissions || []);
            setUserPermissions(modulePermission?.userPermissions || []);
        }
    }, [modulePermission]);

    useEffect(() => {
        if (isModelOpen) {
            form.resetFields();

            if (isEditing && selectedRecord) {
                setCompanyIcon(selectedRecord.companyIcon);

                const formData = {
                    ...selectedRecord,
                    startDate: selectedRecord.startDate ? dayjs(selectedRecord.startDate) : null,
                    endDate: selectedRecord.endDate ? dayjs(selectedRecord.endDate) : null,
                };

                form.setFieldsValue(formData);
            }
        }
    }, [isModelOpen, isEditing, selectedRecord, form]);

    const handleAddOrUpdate = async () => {
        await form.validateFields();
        const formValues = form.getFieldsValue(true);

        const postData = {
            ...formValues,
            companyIcon: companyIcon,
            adminPermissions,
            userPermissions,
            ...(selectedRecord ? {companyId: selectedRecord._id, oldCompanyIcon: selectedRecord.companyIcon} : {}),
        };

        onSubmit(postData);
    };

    const uploadButton = (
        <button style={{border: 0, background: 'none'}} type="button">
            <PlusOutlined/>
            <div style={{marginTop: 8}}>Upload</div>
        </button>
    );

    const beforeUpload = (file) => {
        setCompanyIcon(file);
        return false;
    };

    const handleModelClose = () => {
        setIsModelOpen(false);
        setCompanyIcon(null);
        setAdminPermissions([]);
        setUserPermissions([]);
        setSelectedRecord(null);
        form.resetFields();
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    };

    return (
        <>
            <Modal
                title={selectedRecord ? "Update Company" : "Add Company"}
                open={isModelOpen}
                maskClosable={false}
                onCancel={handleModelClose}
                onOk={handleAddOrUpdate}
                okText={selectedRecord ? "Update" : "Add"}
                width={500}
                confirmLoading={loading}
            >
                <div ref={containerRef}
                     style={{overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', maxHeight: "70vh"}}>
                    <Form form={form} layout="vertical"
                          onValuesChange={(changedValues, allValues) => {
                              form.setFieldsValue(allValues);
                          }}
                    >

                        <div className="flex justify-center mb-3">
                            <Upload
                                name="companyIcon"
                                listType="picture-circle"
                                className="avatar-uploader"
                                showUploadList={false}
                                beforeUpload={beforeUpload}
                            >
                                {companyIcon ? (
                                    <img
                                        className="rounded-full"
                                        src={typeof companyIcon === 'string' && companyIcon.startsWith('http')
                                            ? companyIcon
                                            : URL.createObjectURL(companyIcon)
                                        }
                                        alt="avatar"
                                        style={{width: '100%'}}
                                    />
                                ) : (
                                    uploadButton
                                )}
                            </Upload>
                        </div>

                        <Form.Item
                            name="companyName"
                            label="Company Name"
                            rules={[{required: true, message: "Please enter the company name!"}]}
                        >
                            <Input placeholder="Enter company name"/>
                        </Form.Item>

                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="adminEmail"
                                    label="Admin Email"
                                    rules={[{required: true, message: "Please enter the admin email!"}]}
                                >
                                    <Input placeholder="Enter admin email"/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item name="companyWebsite" label="Company Website">
                                    <Input placeholder="Enter company website URL"/>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <Form.Item name="startDate" label="Start Date">
                                    <DatePicker style={{width: '100%'}} format="YYYY-MM-DD"/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item name="endDate" label="End Date">
                                    <DatePicker style={{width: '100%'}} format="YYYY-MM-DD"/>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16} align="middle">
                            <Col xs={24} sm={12}>
                                <Form.Item name="isActive" label="Is Active" valuePropName="checked"
                                           initialValue={true}>
                                    <Switch/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Button type="primary" style={{width: '100%'}} icon={<ApartmentOutlined/>}
                                        iconPosition='end' onClick={() => setIsModuleModelOpen(true)}>
                                    Set Module Permission
                                </Button>
                            </Col>
                        </Row>

                        <Form.Item name="companyAddress" label="Company Address">
                            <Input.TextArea placeholder="Enter company address" rows={3}/>
                        </Form.Item>

                    </Form>
                </div>
            </Modal>

            {isModuleModelOpen && <ModuleTreeModal
                isModuleModelOpen={isModuleModelOpen}
                setIsModuleModelOpen={setIsModuleModelOpen}
                modules={modules}
                adminPermissions={adminPermissions}
                userPermissions={userPermissions}
                onTabSubmit={(adminUpdatedPermissions, userUpdatedPermissions) => {
                    setAdminPermissions(adminUpdatedPermissions);
                    setUserPermissions(userUpdatedPermissions);
                }}
            />}
        </>
    );
}