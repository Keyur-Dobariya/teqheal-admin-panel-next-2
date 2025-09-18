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
} from "antd";

import {XOutlined} from "@ant-design/icons";
import appString from "../utils/appString";
import {
    ApprovalStatus,
    BloodGroup,
    Gender, mActions, selectOptions,
    Technology,
    UserRole,
} from "../utils/enum";
import dayjs from "dayjs";
import appKeys from "../utils/appKeys";
import validationRules from "../utils/validationRules";
import {CreditCard, Facebook, Globe, Instagram, Linkedin, ToggleLeft, User} from "../utils/icons";
import appColor from "../utils/appColor";
import {UploadSinglePhoto} from "../components/CommonComponents";
import omit from "lodash/omit";
import {AppDataFields, useAppData} from "../masterData/AppDataContext";
import {useApiServices} from "../api/useApiServices";

const {TextArea} = Input;

export default function EmpAddUpdateModel({
                                              isModelOpen,
                                              setIsModelOpen,
                                              selectedRecord,
                                              canManageDetail,
                                          }) {
    const {rolesData, updateAppDataField} = useAppData();
    const { isLoading, users: {addUpdateUser} } = useApiServices();

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
                    ...omit(selectedRecord, ["modulePermissions", "attendancesData"]),
                    role: selectedRecord?.role?._id,
                    companyId: selectedRecord?.companyId?._id,
                    dateOfBirth: selectedRecord.dateOfBirth ? dayjs(selectedRecord.dateOfBirth) : null,
                    dateOfJoining: selectedRecord.dateOfJoining ? dayjs(selectedRecord.dateOfJoining) : null,
                    dateOfLeaving: selectedRecord.dateOfLeaving ? dayjs(selectedRecord.dateOfLeaving) : null,
                    technology: selectedRecord.technology ? selectedRecord.technology.filter(entry => entry !== '') : [],
                };
                form.setFieldsValue(formData);
                setProfilePhoto(selectedRecord?.profilePhoto)
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

            formValues.dateOfBirth = formValues.dateOfBirth ? dayjs(formValues.dateOfBirth) : null;
            formValues.dateOfJoining = formValues.dateOfJoining ? dayjs(formValues.dateOfJoining) : null;
            formValues.dateOfLeaving = formValues.dateOfLeaving ? dayjs(formValues.dateOfLeaving) : null;
            formValues.profilePhoto = profilePhoto;
            if (isEditing) formValues.oldProfilePhoto = selectedRecord?.profilePhoto;

            for (const key in formValues) {
                if (formValues[key] !== undefined && formValues[key] !== null) {
                    if (Array.isArray(formValues[key])) {
                        formValues[key].forEach(item => formData.append(key, item));
                    } else {
                        formData.append(key, formValues[key]);
                    }
                }
            }

            await addUpdateUser(selectedRecord._id, formData, async (data) => {
                setIsModelOpen(false);
                updateAppDataField(AppDataFields.usersData, data);
            });

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
                                            onShowError={() => setProfilePhoto(null)}
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
                                        <ToggleLeft color={appColor.warning}/>
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
                                    <Col span={6}>
                                        <Form.Item name={appKeys.role} label={appString.role}>
                                            <Select
                                                placeholder="Select role"
                                                options={rolesData?.map(role => ({
                                                    label: role.roleName,
                                                    value: role._id,
                                                }))}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item name={appKeys.isActive} label={appString.active}
                                                   valuePropName="checked">
                                            <Switch/>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                        )}
                        <Card
                            title={(
                                <div className="flex items-center gap-2">
                                    <User color={appColor.danger}/>
                                    <div>{appString.personalDetails}</div>
                                </div>
                            )} styles={{body: {padding: 15}}}>
                            <Row gutter={16}>

                                <Col xs={24} sm={8}>
                                    <Form.Item name={appKeys.firstName} label={appString.firstName}
                                               rules={[{required: true, message: 'First name is required'}]}>
                                        <Input
                                            placeholder={`Enter ${appString.firstName.toLowerCase()}`}/>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={8}>
                                    <Form.Item name={appKeys.middleName} label={appString.middleName}
                                               rules={[{required: true, message: 'Middle name is required'}]}>
                                        <Input
                                            placeholder={`Enter ${appString.middleName.toLowerCase()}`}/>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={8}>
                                    <Form.Item name={appKeys.lastName} label={appString.lastName}
                                               rules={[{required: true, message: 'Last name is required'}]}>
                                        <Input
                                            placeholder={`Enter ${appString.lastName.toLowerCase()}`}/>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={7}>
                                    <Form.Item name={appKeys.mobileNumber} label={appString.mobileNumber}
                                        rules={[
                                            { required: true, message: `${appString.mobileNumber} is required` },
                                            { type: "tel", message: `Enter a valid ${appString.mobileNumber.toLowerCase()}` },
                                        ]}
                                    >
                                        <Input maxLength={10} type="tel"
                                            placeholder={`Enter ${appString.mobileNumber.toLowerCase()}`}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={7}>
                                    <Form.Item
                                        name={appKeys.emergencyContactNo}
                                        label={appString.emergencyContactNo}
                                        rules={[
                                            { required: true, message: `${appString.emergencyContactNo} is required` },
                                            { type: "tel", message: `Enter a valid ${appString.emergencyContactNo.toLowerCase()}` },
                                        ]}
                                    >
                                        <Input
                                            maxLength={10}
                                            type="tel"
                                            placeholder={`Enter ${appString.emergencyContactNo.toLowerCase()}`}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={10}>
                                    <Form.Item
                                        name={appKeys.emailAddress}
                                        label={appString.emailAddress}
                                        rules={[
                                            { required: true, message: `${appString.emailAddress} is required` },
                                            { type: "email", message: `Enter a valid ${appString.emailAddress.toLowerCase()}` },
                                        ]}
                                    >
                                        <Input
                                            type="email"
                                            placeholder={`Enter ${appString.emailAddress.toLowerCase()}`}
                                        />
                                    </Form.Item>
                                </Col>

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

                                <Col xs={12} sm={6}>
                                    <Form.Item name={appKeys.dateOfBirth} label={appString.dateOfBirth}
                                               rules={[{required: true, message: 'Date of birth is required'}]}>
                                        <DatePicker
                                            placeholder={`Select ${appString.dateOfBirth.toLowerCase()}`}
                                            rootClassName="w-full"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={12} sm={6}>
                                    <Form.Item name={appKeys.gender} label={appString.gender}
                                               rules={[{required: true, message: 'Gender is required'}]}>
                                        <Select
                                            options={Object.values(Gender).map(g => ({label: g, value: g}))}
                                            placeholder={`Select ${appString.gender.toLowerCase()}`}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={12} sm={6}>
                                    <Form.Item name={appKeys.bloodGroup} label={appString.bloodGroup}>
                                        <Select
                                            options={selectOptions(BloodGroup)}
                                            placeholder={`Select ${appString.bloodGroup.toLowerCase()}`}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={12} sm={6}>
                                    <Form.Item
                                        name={appKeys.pincode}
                                        label={appString.pincode}
                                        rules={[
                                            { required: false, message: `${appString.pincode} is required` },
                                            { type: "tel", message: `Enter a valid ${appString.pincode.toLowerCase()}` },
                                        ]}
                                    >
                                        <Input
                                            maxLength={6}
                                            type="tel"
                                            placeholder={`Enter ${appString.pincode.toLowerCase()}`}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12}>
                                    <Form.Item name={appKeys.address} label={appString.address}>
                                        <TextArea
                                            autoSize={{ minRows: 2, maxRows: 3 }}
                                            placeholder={`Enter ${appString.address.toLowerCase()}`}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12}>
                                    <Form.Item name={appKeys.skills} label={appString.skills}>
                                        <TextArea
                                            autoSize={{ minRows: 2, maxRows: 3 }}
                                            placeholder={`Enter ${appString.skills.toLowerCase()}`}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col span={24}>
                                    <Form.Item name={appKeys.technology} label={appString.technology}>
                                        <Select
                                            options={Technology}
                                            mode="multiple"
                                            placeholder={`Select ${appString.technology.toLowerCase()}`}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                        <Card
                            title={(
                                <div className="flex items-center gap-2">
                                    <CreditCard color={appColor.success}/>
                                    <div>{appString.financialDetails}</div>
                                </div>
                            )} styles={{body: {padding: 15}}}>
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name={appKeys.aadharNumber} label={appString.aadharNumber}>
                                        <Input
                                            maxLength={12}
                                            placeholder={`Enter ${appString.aadharNumber.toLowerCase()}`}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12}>
                                    <Form.Item name={appKeys.panNumber} label={appString.panNumber}>
                                        <Input
                                            maxLength={10}
                                            placeholder={`Enter ${appString.panNumber.toLowerCase()}`}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12}>
                                    <Form.Item name={appKeys.bankAccountNumber} label={appString.bankAccountNumber}>
                                        <Input
                                            placeholder={`Enter ${appString.bankAccountNumber.toLowerCase()}`}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12}>
                                    <Form.Item name={appKeys.ifscCode} label={appString.ifscCode}>
                                        <Input
                                            placeholder={`Enter ${appString.ifscCode.toLowerCase()}`}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12}>
                                    <Form.Item name={appKeys.dateOfJoining} label={appString.dateOfJoining}>
                                        <DatePicker
                                            rootClassName="w-full"
                                            placeholder={`Select ${appString.dateOfJoining.toLowerCase()}`}
                                        />
                                    </Form.Item>
                                </Col>

                                {canManageDetail && (
                                    <Col xs={24} sm={12}>
                                        <Form.Item name={appKeys.dateOfLeaving} label={appString.dateOfLeaving}>
                                            <DatePicker
                                                rootClassName="w-full"
                                                placeholder={`Select ${appString.dateOfLeaving.toLowerCase()}`}
                                            />
                                        </Form.Item>
                                    </Col>
                                )}
                            </Row>
                        </Card>
                    </div>
                </Form>
            </div>
        </Modal>
    );
}
