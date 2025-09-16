'use client'

import React, {useState, useEffect, useRef} from "react";
import {
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    Modal,
    Row,
    Select,
    Switch,
    Image,
    Upload
} from "antd";

import {LoadingOutlined, PlusOutlined, XOutlined} from "@ant-design/icons";
import appString from "../utils/appString";
import {endpoints} from "../api/apiEndpoints";
import apiCall, {HttpMethod} from "../api/apiServiceProvider";
import {
    ApprovalStatus,
    BloodGroup,
    Gender, selectOptions,
    Technology,
    UserRole,
} from "../utils/enum";
import {isAdmin} from "../dataStorage/DataPref";
import {profilePhotoManager} from "../utils/utils";
import dayjs from "dayjs";
import appKeys from "../utils/appKeys";
import validationRules from "../utils/validationRules";
import {CreditCard, Facebook, Globe, Instagram, Key, Linkedin, ToggleLeft, User} from "../utils/icons";
import appColor from "../utils/appColor";
import {UploadSinglePhoto} from "../components/CommonComponents";

const {TextArea} = Input;

export default function EmpAddUpdateModel({
                                              roles,
                                              isModelOpen,
                                              setIsModelOpen,
                                              selectedRecord,
                                              isLoading,
                                              canManageDetail,
                                              onSubmit,
                                          }) {
    const [form] = Form.useForm();
    const [profilePhoto, setProfilePhoto] = useState(null);
    const containerRef = useRef(null);
    const isEditing = !!selectedRecord;
    const modelTitle = isEditing ? appString.updateEmployee : appString.addEmployee;

    useEffect(() => {
        if (isModelOpen) {
            form.resetFields();

            if (isEditing && selectedRecord) {
                const formData = {
                    ...selectedRecord,
                    dateOfBirth: selectedRecord.dateOfBirth ? dayjs(selectedRecord.dateOfBirth) : null,
                    dateOfJoining: selectedRecord.dateOfJoining ? dayjs(selectedRecord.dateOfJoining) : null,
                    dateOfLeaving: selectedRecord.dateOfLeaving ? dayjs(selectedRecord.dateOfLeaving) : null,
                    technology: selectedRecord.technology ? selectedRecord.technology.filter(entry => entry !== '') : [],
                };
                form.setFieldsValue(formData);
            } else {
                const defaultValues = {
                    approvalStatus: ApprovalStatus.Pending,
                    role: UserRole.Employee,
                    isActive: true,
                };
                form.setFieldsValue(defaultValues);
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

    const handleAddUpdateUserApi = async () => {
        try {
            await form.validateFields();

            const formValues = form.getFieldsValue(true);
            const formData = new FormData();

            if (formValues.dateOfBirth) {
                formValues.dateOfBirth = dayjs(formValues.dateOfBirth);
            }
            if (formValues.dateOfJoining) {
                formValues.dateOfJoining = dayjs(formValues.dateOfJoining);
            }
            if (formValues.dateOfLeaving) {
                formValues.dateOfLeaving = dayjs(formValues.dateOfLeaving);
            }

            for (const key in formValues) {
                if (formValues[key] !== undefined && formValues[key] !== null) {
                    if (Array.isArray(formValues[key])) {
                        formValues[key].forEach(item => formData.append(key, item));
                    } else {
                        formData.append(key, formValues[key]);
                    }
                }
            }

            if (formValues.profilePhoto && formValues.profilePhoto.originFileObj) {
                formData.append(appKeys.profilePhoto, formValues.profilePhoto.originFileObj);
            }

            if (formValues.role) {
                formData.append(appKeys.role, formValues.role?._id);
            }

            onSubmit(formData);

        } catch (error) {
            console.error("Form validation/API call failed:", error);
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-1">
                    <div
                        className="font-medium text-base">{modelTitle}</div>
                    {selectedRecord?.employeeCode &&
                        <div className="font-medium text-cyan-800">{`( ${selectedRecord?.employeeCode} )`}</div>}
                </div>
            }
            maskClosable={false}
            centered
            open={isModelOpen}
            width={800}
            onOk={handleAddUpdateUserApi}
            onCancel={handleCancel}
            confirmLoading={isLoading}
            okText={modelTitle}
            cancelText="Cancel"
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
                        if (allValues.password) {
                            form.validateFields(["confirmPassword"]);
                        }
                    }}
                >
                    <div className="flex flex-col gap-5 py-3">
                        <Card
                            title={(
                                <div className="flex items-center gap-2">
                                    <Globe color={appColor.secondPrimary}/>
                                    <div>{appString.profileDetails}</div>
                                </div>
                            )} styles={{body: {padding: 20}}}>
                            <Row gutter={[16, 16]} justify="space-between" align="middle">
                                <Col xs={24} md={4}>
                                    <div className="flex justify-center md:justify-start">
                                        <UploadSinglePhoto
                                            field={appKeys.profilePhoto}
                                            photo={profilePhoto}
                                            onSelect={(file) => setProfilePhoto(file)}
                                        />
                                    </div>
                                </Col>
                                <Col xs={24} md={18} lg={15}>
                                    <div className="flex flex-col gap-4">
                                        <Row gutter={[16, 16]}>
                                            <Col xs={24} sm={12}>
                                                <Input addonBefore={<Linkedin/>} placeholder={appString.profileUrl}/>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Input addonBefore={<XOutlined/>} placeholder={appString.profileUrl}/>
                                            </Col>
                                        </Row>
                                        <Row gutter={[16, 16]}>
                                            <Col xs={24} sm={12}>
                                                <Input addonBefore={<Instagram/>} placeholder={appString.profileUrl}/>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Input addonBefore={<Facebook/>} placeholder={appString.profileUrl}/>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                        {canManageDetail && (
                            <Card
                                title={(
                                    <div className="flex items-center gap-2">
                                        <ToggleLeft color={appColor.warning} />
                                        <div>{appString.empStatus}</div>
                                    </div>
                                )} styles={{body: {padding: 15}}}>
                                <Row gutter={16}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name={appKeys.approvalStatus} label={appString.approvalStatus}>
                                            <Select
                                                options={Object.values(ApprovalStatus).map(v => ({label: v, value: v}))}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Row gutter={16}>
                                            <Col xs={12}>
                                                <Form.Item name={appKeys.role} label={appString.role}>
                                                    <Select
                                                        placeholder="Select role"
                                                        options={roles?.map(role => ({
                                                            label: role.roleName,
                                                            value: role._id,
                                                        }))}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={12}>
                                                <Form.Item name={appKeys.isActive} label={appString.active}
                                                           valuePropName="checked">
                                                    <Switch/>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Card>
                        )}
                        <Card
                            title={(
                                <div className="flex items-center gap-2">
                                    <User color={appColor.danger} />
                                    <div>{appString.personalDetails}</div>
                                </div>
                            )} styles={{body: {padding: 15}}}>
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name={appKeys.fullName} label={appString.fullName}
                                               rules={[{required: true, message: 'Full name is required'}]}>
                                        <Input
                                            placeholder={`Enter ${appString.fullName.toLowerCase()}`}/>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12}>
                                    <Row gutter={16}>
                                        <Col xs={12}>
                                            <Form.Item name={appKeys.dateOfBirth} label={appString.dateOfBirth}
                                                       rules={[{required: true, message: 'Date of birth is required'}]}>
                                                <DatePicker
                                                    placeholder={`Select ${appString.dateOfBirth.toLowerCase()}`}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={12}>
                                            <Form.Item name={appKeys.gender} label={appString.gender}
                                                       rules={[{required: true, message: 'Gender is required'}]}>
                                                <Select
                                                    options={Object.values(Gender).map(g => ({label: g, value: g}))}
                                                    placeholder={`Select ${appString.gender.toLowerCase()}`}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Col>

                                {[
                                    {key: appKeys.mobileNumber, label: appString.mobileNumber, required: true, maxLength: 10, type: 'tel'},
                                    {key: appKeys.emergencyContactNo, label: appString.emergencyContactNo, required: true, maxLength: 10, type: 'tel'},
                                    {key: appKeys.emailAddress, label: appString.emailAddress, required: true, type: 'email'},
                                    {key: appKeys.pincode, label: appString.pincode, required: false, maxLength: 6, type: 'tel'}
                                ].map(({key, label, required, type, maxLength}) => (
                                    <Col xs={24} sm={12} key={key}>
                                        <Form.Item name={key} label={label}
                                                   rules={[{required, message: `${label} is required`}, {
                                                       type,
                                                       message: `Enter a valid ${label.toLowerCase()}`
                                                   }]}>
                                            <Input
                                                maxLength={maxLength}
                                                type={type || "text"}
                                                placeholder={`Enter ${label.toLowerCase()}`}
                                            />
                                        </Form.Item>
                                    </Col>
                                ))}

                                {[
                                    {
                                        key: appKeys.bloodGroup,
                                        label: appString.bloodGroup,
                                        options: selectOptions(BloodGroup)
                                    },
                                    {
                                        key: appKeys.technology,
                                        label: appString.technology,
                                        options: Technology,
                                        isMulti: true
                                    }
                                ].map(({key, label, options, isMulti}) => (
                                    <Col xs={24} sm={12} key={key}>
                                        <Form.Item name={key} label={label}>
                                            <Select
                                                options={options}
                                                mode={isMulti ? "multiple" : undefined}
                                                placeholder={`Select ${label.toLowerCase()}`}
                                            />
                                        </Form.Item>
                                    </Col>
                                ))}

                                {[appKeys.address, appKeys.skills].map((key) => (
                                    <Col xs={24} sm={12} key={key}>
                                        <Form.Item name={key} label={appString[key]}>
                                            <TextArea
                                                autoSize={{minRows: 2, maxRows: 3}}
                                                placeholder={`Enter ${appString[key].toLowerCase()}`}
                                            />
                                        </Form.Item>
                                    </Col>
                                ))}

                                {!isEditing && (
                                    <>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name={appKeys.password}
                                                label={appString.password}
                                                rules={validationRules.password}
                                            >
                                                <Input.Password
                                                    placeholder={`Enter ${appString.password.toLowerCase()}`}/>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name={appKeys.confirmPassword}
                                                label={appString.confirmPassword}
                                                dependencies={['password']}
                                                rules={validationRules.confirmPassword(form.getFieldValue)}
                                            >
                                                <Input.Password
                                                    placeholder={`Confirm ${appString.password.toLowerCase()}`}/>
                                            </Form.Item>
                                        </Col>
                                    </>
                                )}
                            </Row>
                        </Card>
                        <Card
                            title={(
                                <div className="flex items-center gap-2">
                                    <CreditCard color={appColor.success} />
                                    <div>{appString.financialDetails}</div>
                                </div>
                            )} styles={{body: {padding: 15}}}>
                            <Row gutter={16}>
                                {[appKeys.aadharNumber, appKeys.panNumber, appKeys.bankAccountNumber, appKeys.ifscCode].map(key => (
                                    <Col xs={24} sm={12} key={key}>
                                        <Form.Item name={key} label={appString[key]}>
                                            <Input
                                                maxLength={key === appKeys.aadharNumber ? 12 : key === appKeys.panNumber ? 10 : undefined}
                                                placeholder={`Enter ${appString[key].toLowerCase()}`}
                                            />
                                        </Form.Item>
                                    </Col>
                                ))}

                                {[appKeys.dateOfJoining, canManageDetail && appKeys.dateOfLeaving].filter(Boolean).map(key => (
                                    <Col xs={24} sm={12} key={key}>
                                        <Form.Item name={key} label={appString[key]}>
                                            <DatePicker
                                                style={{width: '100%'}}
                                                placeholder={`Select ${appString[key].toLowerCase()}`}
                                            />
                                        </Form.Item>
                                    </Col>
                                ))}
                            </Row>
                        </Card>
                    </div>
                </Form>
            </div>
        </Modal>
    );
}
