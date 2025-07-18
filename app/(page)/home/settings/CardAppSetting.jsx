import {Button, Card, Col, Form, Input, InputNumber, Row, Switch, TimePicker} from "antd";
import appKeys from "../../../utils/appKeys";
import {Calendar, Clock, Home, Key, Monitor, Save} from "../../../utils/icons";
import appString from "../../../utils/appString";
import React, {useEffect, useState} from "react";
import appColor from "../../../utils/appColor";
import {convertCamelCase} from "../../../utils/utils";
import dayjs from "dayjs";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints";
import {AppDataFields, useAppData} from "../../../masterData/AppDataContext";

const months = {
    january: "january",
    february: "february",
    march: "march",
    april: "april",
    may: "may",
    june: "june",
    july: "july",
    august: "august",
    september: "september",
    october: "october",
    november: "november",
    december: "december",
};

const SectionHeader = ({icon, title}) => (
    <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
            {icon}
            <div className="font-[550] text-[15px]">{title}</div>
        </div>
    </div>
);

export const CardAppSetting = ({isMobile}) => {
    const {settings, updateAppDataField} = useAppData();
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (settings) {
            const {appSettings = {}, monthlyTotalHours = {}} = settings;

            const flatData = {
                ...appSettings,
                ...monthlyTotalHours,
                officeStartTime: dayjs(appSettings.officeStartTime, 'h:mm a'),
                officeEndTime: dayjs(appSettings.officeEndTime, 'h:mm a'),
            };

            form.setFieldsValue(flatData);
        }
    }, []);

    const updateAppSetting = async () => {
        try {
            const formValues = form.getFieldsValue(true);
            await apiCall({
                method: HttpMethod.POST,
                url: endpoints.updateSetting,
                data: formValues,
                setIsLoading: setIsLoading,
                successCallback: (data) => {
                    const responseData = data?.data;
                    updateAppDataField(AppDataFields.settings, responseData);
                },
            });
        } catch (error) {
            console.error("API Call Failed:", error);
        }
    };

    return (
        <>
            <Card>
                <div className="p-3 flex justify-between items-center gap-3">
                    <div className="text-base font-medium">{appString.appSetting}</div>
                    <Button
                        type="primary"
                        icon={<Save/>}
                        loading={isLoading}
                        onClick={updateAppSetting}
                    >
                        {!isMobile && appString.save}
                    </Button>
                </div>
            </Card>
            <div className="m-4"/>
            <Form
                form={form}
                layout="vertical"
                onValuesChange={(changedValues, allValues) => {
                    form.setFieldsValue(allValues);

                    const appSettings = {};
                    const monthlyTotalHours = {};
                    const monthKeys = Object.keys(months);

                    Object.entries(allValues).forEach(([key, value]) => {
                        if (monthKeys.includes(key)) {
                            monthlyTotalHours[key] = value;
                        } else {
                            appSettings[key] = value;
                        }
                    });

                    const payload = {
                        appSettings,
                        monthlyTotalHours
                    };

                    form.setFieldsValue(payload);
                }}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={12} lg={12} xl={8} xxl={6}>
                        <Card title={<SectionHeader icon={<Key color={appColor.danger}/>}
                                                    title={appString.adminSetting}/>}>
                            <div className="px-4 pt-4">
                                <Form.Item name={appKeys.adminEmail} label={appString.adminEmail}>
                                    <Input
                                        placeholder={`Enter ${appString.adminEmail.toLowerCase()}`}/>
                                </Form.Item>
                            </div>
                        </Card>
                        <div className="m-4"/>
                        <Card title={<SectionHeader icon={<Clock color={appColor.success}/>}
                                                    title={appString.officeTimeSetting}/>}>
                            <div className="px-4 pt-4">
                                <Form.Item name={appKeys.officeStartTime} label={appString.officeStartTime}>
                                    <TimePicker
                                        rootClassName="w-full"
                                        use12Hours
                                        format="h:mm a"
                                    />
                                </Form.Item>
                                <Form.Item name={appKeys.officeEndTime} label={appString.officeEndTime}>
                                    <TimePicker
                                        rootClassName="w-full"
                                        use12Hours
                                        format="h:mm a"
                                    />
                                </Form.Item>
                                <Form.Item name={appKeys.breakDuration} label={appString.breakDuration}>
                                    <InputNumber max={100} placeholder={appString.breakDuration}
                                                 style={{width: "100%"}}/>
                                </Form.Item>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12} xl={8} xxl={6}>
                        <Card title={<SectionHeader icon={<Monitor color={appColor.primary}/>}
                                                    title={appString.screenshots}/>}>
                            <div className="px-4 pt-4">
                                <Form.Item name={appKeys.screenshotTime} label={appString.screenshotTime}>
                                    <InputNumber max={60}
                                                 placeholder={`Enter ${appString.screenshotTime.toLowerCase()}`}
                                                 style={{width: "100%"}}/>
                                </Form.Item>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name={appKeys.isTakeScreenShot} label={appString.isTakeScreenShot}>
                                            <Switch/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name={appKeys.showScreenShot} label={appString.showScreenShot}>
                                            <Switch/>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        </Card>
                        <div className="m-4"/>
                        <Card title={<SectionHeader icon={<Home color={appColor.info}/>}
                                                    title={appString.leaveSettings}/>}>
                            <div className="px-4 pt-4">
                                <Form.Item name={appKeys.yearlyPaidLeave} label={appString.yearlyPaidLeave}>
                                    <InputNumber max={50} placeholder={appString.yearlyPaidLeave}
                                                 style={{width: "100%"}}/>
                                </Form.Item>
                                <Form.Item name={appKeys.monthlyMaxPaidLeave} label={appString.monthlyMaxPaidLeave}>
                                    <InputNumber max={50} placeholder={appString.monthlyMaxPaidLeave}
                                                 style={{width: "100%"}}/>
                                </Form.Item>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={8} xxl={12}>
                        <Card title={<SectionHeader icon={<Calendar color={appColor.secondPrimary}/>}
                                                    title={appString.monthlyTotalHours}/>}>
                            <div className="px-4 pt-4">
                                <Row gutter={16}>
                                    {Object.values(months).map((month) => (
                                        <Col key={month} xs={12} sm={8} md={6} lg={6} xl={8} xxl={6}>
                                            <Form.Item
                                                name={month}
                                                label={convertCamelCase(month)}
                                            >
                                                <InputNumber max={500}
                                                             placeholder={`Enter ${appString.hours.toLowerCase()}`}
                                                             style={{width: "100%"}}/>
                                            </Form.Item>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </>
    )
}