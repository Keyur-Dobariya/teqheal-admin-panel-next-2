'use client';

import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import { useRouter } from "next/navigation";
import appString from "../../../utils/appString";
import appKeys from "../../../utils/appKeys";
import { pageRoutes } from "../../../utils/pageRoutes";
import {useEffect, useState} from "react";
import AnimatedDiv, {Direction} from "../../../components/AnimatedDiv";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints";

export default function ForgotPassword() {
    const [form] = Form.useForm();
    const router = useRouter();
    // const { data } = router.query;

    // console.log("data=>", data);

    const [loading, setLoading] = useState(false);

    const onFormSubmit = async () => {
        try {
            await form.validateFields();

            const formData = form.getFieldsValue();
            await apiCall({
                method: HttpMethod.POST,
                url: endpoints.forgetPassSendOtp,
                data: formData,
                setIsLoading: setLoading,
                // successCallback: () => router.push(pageRoutes.loginPage),
            });
        } catch (error) {
            console.error("Submission error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatedDiv className="z-10 w-full max-w-110 p-4" style={{ marginLeft: "2px" }} direction={Direction.TOP_TO_BOTTOM}>
            <div className="font-medium text-2xl xl:text-3xl">{appString.forgotPassword}</div>
            <div className="w-[25px] h-[5px] rounded-xl bg-amber-500 my-2" />
            <div className="text-gray-500 text-sm mb-7 xl:text-base">{appString.forgotPasswordDes}</div>
            <Form
                form={form}
                name="forgotPassword"
                onKeyDown={null}
                initialValues={{ remember: true }}
            >
                <Form.Item
                    name={appKeys.emailAddress}
                    rules={[
                        { required: true, message: appString.emailAddressV1 },
                        {
                            pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: appString.emailAddressV2,
                        },
                    ]}
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
            </Form>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full my-2" onClick={onFormSubmit}>{appString.submit}</Button>
            <div className="text-gray-500 text-center my-2">
                {appString.rememberPassword}
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