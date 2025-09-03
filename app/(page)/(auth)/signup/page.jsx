'use client';

import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from "@ant-design/icons";
import {Button, Checkbox, Col, Form, Input, Row} from "antd";
import {useRouter, useSearchParams} from "next/navigation";
import appString from "../../../utils/appString";
import appKeys from "../../../utils/appKeys";
import { pageRoutes } from "../../../utils/pageRoutes";
import AnimatedDiv, {Direction} from "../../../components/AnimatedDiv";
import {Suspense, useEffect, useState} from "react";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints";
import validationRules from "../../../utils/validationRules";
import {AppDataFields, useAppData} from "../../../masterData/AppDataContext";
import CardProfilePage from "../../(home)/CardProfilePage";
import {showToast} from "../../../components/CommonComponents";

function ProfileContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [form] = Form.useForm();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [isCompanyLoading, setIsCompanyLoading] = useState(false);
    const [companyRecord, setCompanyRecord] = useState(null);

    const onFormSubmit = async () => {
        if(companyRecord) {
            try {
                await form.validateFields();

                const formData = form.getFieldsValue();

                const postData = {
                    ...formData,
                    companyId: companyRecord.companyId
                }

                await apiCall({
                    method: HttpMethod.POST,
                    url: endpoints.signUp,
                    data: postData,
                    setIsLoading: setLoading,
                    successCallback: () => router.push(pageRoutes.loginPage),
                });
            } catch (error) {
                console.error("Submission error:", error);
            } finally {
                setLoading(false);
            }
        } else {
            showToast('error', 'Unauthorized access. Please use the invitation link to sign up.');
        }
    };

    useEffect(() => {
        if(token) {
            getCompanyByJoinToken();
        }
    }, [token]);

    useEffect(() => {
        if (companyRecord) {
            setTimeout(() => {
                form.setFieldsValue({ emailAddress: companyRecord.adminEmail });
            }, 0);
        }
    }, [companyRecord]);

    const getCompanyByJoinToken = async () => {
        await apiCall({
            method: HttpMethod.POST,
            url: endpoints.getCompanyByJoinToken,
            data: {
                token: token
            },
            setIsLoading: setIsCompanyLoading,
            showSuccessMessage: false,
            successCallback: (data) => {
                if(data?.data) {
                    setCompanyRecord(data?.data);
                }
            },
        });
    };

    return <AnimatedDiv className="z-10 w-full max-w-110 p-4" style={{ marginLeft: "2px" }} direction={Direction.BOTTOM_TO_TOP}>
        <div className="font-medium text-2xl xl:text-3xl">{appString.signUpTitle}</div>
        <div className="w-[25px] h-[5px] rounded-xl bg-amber-500 my-2" />
        {companyRecord ? (
            <div className="text-gray-500 text-sm mb-7 xl:text-base">
                Let's register and connect with{" "}
                <span className="text-blue-950 font-medium">{companyRecord?.companyName}</span>{" "}
                to get the things done together and faster.
            </div>
        ) : (
            <div className="text-gray-500 text-sm mb-7 xl:text-base">{appString.signUpDes}</div>
        )}
        <Form
            form={form}
            name="signup"
            onKeyDown={null}
            disabled={!companyRecord}
            initialValues={{ remember: true }}
        >
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name={appKeys.firstName}
                        rules={validationRules[appKeys.firstName]}
                        hasFeedback
                    >
                        <Input prefix={<UserOutlined />} placeholder={appString.firstName} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name={appKeys.lastName}
                        rules={validationRules[appKeys.lastName]}
                        hasFeedback
                    >
                        <Input prefix={<UserOutlined />} placeholder={appString.lastName} />
                    </Form.Item>
                </Col>
            </Row>
            <Form.Item
                name={appKeys.emailAddress}
                rules={validationRules[appKeys.emailAddress]}
                hasFeedback
            >
                <Input
                    prefix={<MailOutlined />}
                    maxLength={100}
                    disabled={companyRecord}
                    placeholder={appString.emailAddress}
                    inputMode="email"
                    type="email"
                />
            </Form.Item>
            <Form.Item
                name={appKeys.mobileNumber}
                rules={validationRules[appKeys.mobileNumber]}
                hasFeedback
            >
                <Input
                    prefix={<PhoneOutlined rotate={90} />}
                    maxLength={10}
                    placeholder={appString.mobileNumber}
                    inputMode="numeric"
                    type="tel"
                />
            </Form.Item>
            <Form.Item
                name={appKeys.password}
                rules={validationRules[appKeys.password]}
                hasFeedback
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder={appString.password}
                    type="password"
                />
            </Form.Item>
            <Form.Item
                name={appKeys.confirmPassword}
                rules={validationRules[appKeys.confirmPassword](form.getFieldValue)}
                hasFeedback
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder={appString.confirmPassword}
                    type="password"
                />
            </Form.Item>
        </Form>
        <div className="my-3 flex items-center gap-2">
            <Checkbox />
            <div className="text-[15px]">
                {appString.agreeWith}{" "}
                <span className="cursor-pointer text-blue-700 font-medium hover:text-blue-500">
                            {appString.termsAndC}
                        </span>{" "}
                and{" "}
                <span className="cursor-pointer text-blue-700 font-medium hover:text-blue-500">
                            {appString.privacyP}
                        </span>.
            </div>
        </div>
        <Button type="primary" loading={loading} className="w-full my-2" onClick={onFormSubmit}>{appString.signUp}</Button>
        <div className="text-gray-500 text-center my-2">
            {appString.alreadyAcc}
            <span
                className="cursor-pointer text-blue-700 font-semibold hover:text-blue-500"
                onClick={() => router.push(pageRoutes.loginPage)}
            >
                        {" "}
                {appString.signIn}
                    </span>
        </div>
    </AnimatedDiv>;
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading Profile...</div>}>
            <ProfileContent />
        </Suspense>
    );
}