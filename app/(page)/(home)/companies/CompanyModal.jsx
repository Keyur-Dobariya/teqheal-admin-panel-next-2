"use client";
import React, {useState, useEffect, useRef} from "react";
import {
    Button,
    Modal,
    Form,
    Input,
    Switch,
    Row,
    Col, DatePicker, Upload, Tree
} from "antd";
import {
    ApartmentOutlined,
    DownOutlined,
    PlusOutlined
} from "@ant-design/icons";
import {convertCamelCase} from "../../../utils/utils";
import dayjs from "dayjs";

export const CompanyModal = ({
                                 isModelOpen,
                                 setIsModelOpen,
                                 modules,
                                 selectedRecord,
                                 setSelectedRecord,
                                 loading,
                                 onSubmit
                             }) => {
    const [isModuleModelOpen, setIsModuleModelOpen] = useState(false);
    const [form] = Form.useForm();
    const isEditing = !!selectedRecord;
    const [companyIcon, setCompanyIcon] = useState();
    const [checkedKeys, setCheckedKeys] = useState([]);
    const containerRef = useRef(null);

    useEffect(() => {
        if (isModelOpen) {
            form.resetFields();

            if (isEditing && selectedRecord) {
                setCompanyIcon(selectedRecord.companyIcon);
                setCheckedKeys(getDefaultCheckedKeys(selectedRecord.modulePermissions));

                const formData = {
                    ...selectedRecord,
                    startDate: selectedRecord.startDate ? dayjs(selectedRecord.startDate) : null,
                    endDate: selectedRecord.endDate ? dayjs(selectedRecord.endDate) : null,
                };

                form.setFieldsValue(formData);
            } else {
                const checked = getAllCheckedKeys(modules);
                setCheckedKeys(checked);
            }
        }
    }, [isModelOpen, isEditing, selectedRecord, form]);

    const handleAddOrUpdate = async () => {
        const modulePermissions = [];

        await form.validateFields();

        const formValues = form.getFieldsValue(true);

        checkedKeys.forEach(key => {
            if (key.startsWith('action_')) {
                const [, moduleId, action] = key.split('_');
                let mp = modulePermissions.find(m => m.moduleId === moduleId);
                if (!mp) {
                    mp = {moduleId, permissions: []};
                    modulePermissions.push(mp);
                }
                mp.permissions.push(action);
            }
        });

        const postData = {
            ...formValues,
            companyIcon: companyIcon,
            modulePermissions,
            ...(selectedRecord ? { companyId: selectedRecord } : {}),
        };

        onSubmit(postData);
    };

    const getTreeData = () => {
        return modules.map(module => ({
            title: convertCamelCase(module.moduleName),
            key: `module_${module._id}`,
            selectable: false,
            children: (module.actions ?? []).map(action => ({
                title: convertCamelCase(action),
                key: `action_${module._id}_${action}`,
                isLeaf: true,
            }))
        }));
    };

    const getAllCheckedKeys = (modules) => {
        const checked = [];
        modules.forEach(module => {
            const hasActions = Array.isArray(module.actions) && module.actions.length > 0;
            if (hasActions) {
                (module.actions || []).forEach(action => {
                    checked.push(`action_${module._id}_${action}`);
                });
            } else {
                checked.push(`module_${module._id}`);
            }
        });
        return checked;
    };

    const getDefaultCheckedKeys = (modulePermissions) => {
        const checked = [];
        modulePermissions?.forEach(({moduleId, permissions}) => {
            permissions.forEach(action => {
                checked.push(`action_${moduleId._id}_${action}`);
            });
        });
        return checked;
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
        setCheckedKeys([]);
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

            <Modal
                title={"Module Permissions"}
                open={isModuleModelOpen}
                footer={null}
                onCancel={() => setIsModuleModelOpen(false)}
                onOk={() => form.submit()}
                width={400}
            >
                <div style={{overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', maxHeight: "70vh"}}>
                    <Tree
                        checkable
                        showLine
                        switcherIcon={<DownOutlined/>}
                        selectable={false}
                        treeData={getTreeData()}
                        checkedKeys={checkedKeys}
                        onCheck={(keysValue) => {
                            console.log("keysValue=>", keysValue)
                            setCheckedKeys(keysValue);
                        }}
                        style={{
                            margin: 10,
                            fontSize: '14px',
                            flex: 1,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            scrollbarWidth: 'none',
                            maxHeight: "60vh"
                        }}
                    />
                </div>
            </Modal>
        </>
    );
}