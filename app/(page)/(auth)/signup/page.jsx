'use client';

import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input } from "antd";
import { useRouter } from "next/navigation";
import appString from "../../../utils/appString";
import appKeys from "../../../utils/appKeys";
import pageRoutes from "../../../utils/pageRoutes";
import AnimatedDiv, {Direction} from "../../../components/AnimatedDiv";
import {useState} from "react";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints";
import validationRules from "../../../utils/validationRules";

export default function SignUp() {
    const [form] = Form.useForm();
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const onFormSubmit = async () => {
        try {
            await form.validateFields();

            const formData = form.getFieldsValue();
            await apiCall({
                method: HttpMethod.POST,
                url: endpoints.signUp,
                data: formData,
                setIsLoading: setLoading,
                successCallback: () => router.push(pageRoutes.loginPage),
            });
        } catch (error) {
            console.error("Submission error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatedDiv className="z-10 w-full max-w-110 p-4" style={{ marginLeft: "2px" }} direction={Direction.BOTTOM_TO_TOP}>
            <div className="font-medium text-2xl xl:text-3xl">{appString.signUpTitle}</div>
            <div className="w-[25px] h-[5px] rounded-xl bg-amber-500 my-2" />
            <div className="text-gray-500 text-sm mb-7 xl:text-base">{appString.signUpDes}</div>
            <Form
                form={form}
                name="signup"
                onKeyDown={null}
                initialValues={{ remember: true }}
            >
                <Form.Item
                    name={appKeys.fullName}
                    rules={validationRules[appKeys.fullName]}
                    hasFeedback
                >
                    <Input prefix={<UserOutlined />} placeholder={appString.fullName} />
                </Form.Item>
                <Form.Item
                    name={appKeys.emailAddress}
                    rules={validationRules[appKeys.emailAddress]}
                    hasFeedback
                >
                    <Input
                        prefix={<MailOutlined />}
                        maxLength={100}
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
        </AnimatedDiv>
    );
}