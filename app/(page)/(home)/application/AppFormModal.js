'use client'

import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, InputNumber, Collapse } from "antd";
import { addApp, updateApp, addAppVersion } from "./appApiUtils";

export default function AppFormModal({ visible, onClose, onSuccess, editApp }) {
    const [form] = Form.useForm();
    const [isAddingVersion, setIsAddingVersion] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (editApp) {
            form.setFieldsValue(editApp);
        } else {
            form.resetFields();
            setIsAddingVersion(false);
        }
    }, [editApp, visible]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editApp && isAddingVersion) {
                await addAppVersion(editApp._id, {
                    versionName: values.versionName,
                    versionCode: values.versionCode,
                    versionConfig: {}, // send blank or custom versionConfig
                }, setIsLoading, () => {

                });
            } else if (editApp) {
                await updateApp(editApp._id, values, setIsLoading, () => {

                });
            } else {
                await addApp(values, setIsLoading, () => {

                });
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.log("eror=>", err)
        }
    };

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            onOk={handleSubmit}
            title={editApp ? "Edit App" : "Add App"}
            okText={isAddingVersion ? "Add Version" : "Save"}
        >
            <Form form={form} layout="vertical">
                <Form.Item name="appName" label="App Name" rules={[{ required: true }]}>
                    <Input disabled={!!editApp} />
                </Form.Item>
                <Form.Item name="description" label="Description">
                    <Input.TextArea />
                </Form.Item>
                <Form.Item name="packageName" label="Package Name" rules={[{ required: true }]}>
                    <Input disabled={!!editApp} />
                </Form.Item>
                <Form.Item name="icon" label="App Icon URL">
                    <Input />
                </Form.Item>

                <Collapse>
                    <Collapse.Panel header="Version Info" key="1">
                        <Form.Item name="versionName" label="Version Name" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="versionCode" label="Version Code" rules={[{ required: true }]}>
                            <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                    </Collapse.Panel>
                </Collapse>

                {editApp && (
                    <Button
                        type="dashed"
                        onClick={() => setIsAddingVersion(!isAddingVersion)}
                        block
                        style={{ marginTop: 16 }}
                    >
                        {isAddingVersion ? "Cancel New Version" : "Add New Version"}
                    </Button>
                )}
            </Form>
        </Modal>
    );
};

// export default function AppFormModal({ open, onClose, onSuccess, appData }) {
//     const [form] = Form.useForm();
//     const [isAddVersion, setIsAddVersion] = useState(false);
//
//     const isEdit = !!appData;
//
//     useEffect(() => {
//         if (appData) {
//             form.setFieldsValue(appData);
//         } else {
//             form.resetFields();
//         }
//         setIsAddVersion(false);
//     }, [appData, form]);
//
//     const handleFinish = async (values) => {
//         const url = isEdit && isAddVersion
//             ? `${endpoints.updateApp}/${appData._id}`
//             : endpoints.addApp;
//
//         const data = isAddVersion
//             ? {
//                 ...appData,
//                 versionName: values.versionName,
//                 versionCode: values.versionCode,
//                 versionConfig: values.versionConfig,
//             }
//             : values;
//
//         await apiCall({ method: HttpMethod.POST, url, data });
//         onSuccess();
//     };
//
//     return (
//         <Modal
//             title={isEdit ? (isAddVersion ? "Add New Version" : "Edit App") : "Add App"}
//             open={open}
//             onCancel={onClose}
//             footer={[
//                 <Button key="cancel" onClick={onClose}>Cancel</Button>,
//                 <Button key="submit" type="primary" onClick={() => form.submit()}>
//                     Submit
//                 </Button>
//             ]}
//             width={900}
//         >
//             {isEdit && !isAddVersion && (
//                 <Button type="dashed" onClick={() => setIsAddVersion(true)} style={{ marginBottom: 20 }}>
//                     + Add New Version
//                 </Button>
//             )}
//
//             <Form layout="vertical" form={form} onFinish={handleFinish}>
//                 {!isAddVersion && (
//                     <>
//                         <Form.Item name="appName" label="App Name" rules={[{ required: true }]}> <Input /> </Form.Item>
//                         <Form.Item name="description" label="Description"> <Input.TextArea /> </Form.Item>
//                         <Form.Item name="packageName" label="Package Name" rules={[{ required: true }]}> <Input /> </Form.Item>
//                         <Form.Item name="appIcon" label="App Icon URL"> <Input /> </Form.Item>
//                     </>
//                 )}
//
//                 <Divider orientation="left">Version Info</Divider>
//
//                 <Form.Item name="versionName" label="Version Name" rules={[{ required: true }]}> <Input /> </Form.Item>
//                 <Form.Item name="versionCode" label="Version Code" rules={[{ required: true }]}> <InputNumber min={1} /> </Form.Item>
//
//                 <Collapse defaultActiveKey={["1"]}>
//                     <Panel header="Version Config Settings" key="1">
//                         <Form.Item name={["versionConfig", "splashTime"]} label="Splash Time (ms)"> <InputNumber /> </Form.Item>
//                         <Form.Item name={["versionConfig", "maxVer"]} label="Max Version"> <InputNumber /> </Form.Item>
//                         <Form.Item name={["versionConfig", "adEnabled"]} label="Ad Enabled" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "alEnabled"]} label="AL Enabled" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "forcedInt"]} label="Forced Interstitial" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "adPref"]} label="Ad Preference"> <Input /> </Form.Item>
//                         <Form.Item name={["versionConfig", "adFirstServe"]} label="Ad First Serve"> <Input /> </Form.Item>
//                         <Form.Item name={["versionConfig", "adRoundRobin"]} label="Ad Round Robin" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "nativePreload"]} label="Native Preload" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "nativeAdPref"]} label="Native Ad Preference"> <Input /> </Form.Item>
//                         <Form.Item name={["versionConfig", "nativeFirstServe"]} label="Native First Serve"> <Input /> </Form.Item>
//                         <Form.Item name={["versionConfig", "nativeRoundRobin"]} label="Native Round Robin" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "showFbRectBanner"]} label="Show FB Rect Banner" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "bannerAdPref"]} label="Banner Ad Preference"> <Input /> </Form.Item>
//                         <Form.Item name={["versionConfig", "bannerFirstServe"]} label="Banner First Serve"> <Input /> </Form.Item>
//                         <Form.Item name={["versionConfig", "bannerRoundRobin"]} label="Banner Round Robin" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "inHouseEnabled"]} label="In-House Enabled" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "iapEnabled"]} label="IAP Enabled" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "appOpenEnabled"]} label="App Open Enabled" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "splashAppOpenEnabled"]} label="Splash App Open Enabled" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "backPressEnabled"]} label="Back Press Enabled" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "rewardVideoEnabled"]} label="Reward Video Enabled" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "rewardIntEnabled"]} label="Reward Int Enabled" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "intType"]} label="Interstitial Type"> <Input /> </Form.Item>
//                         <Form.Item name={["versionConfig", "intSkip"]} label="Interstitial Skip"> <InputNumber /> </Form.Item>
//                         <Form.Item name={["versionConfig", "intClickInterval"]} label="Click Interval"> <InputNumber /> </Form.Item>
//                         <Form.Item name={["versionConfig", "intTimeInterval"]} label="Time Interval"> <InputNumber /> </Form.Item>
//                         <Form.Item name={["versionConfig", "intRandom"]} label="Interstitial Random" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "nativeRandom"]} label="Native Random" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "smallNativeRandom"]} label="Small Native Random" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "bannerRandom"]} label="Banner Random" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "appOpenBackFill"]} label="App Open BackFill" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "intBackFill"]} label="Int BackFill" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "nativeBackFill"]} label="Native BackFill" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "smallNativeBackFill"]} label="Small Native BackFill" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "bannerBackFill"]} label="Banner BackFill" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "rewardVideoBackFill"]} label="Reward Video BackFill" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "rewardIntBackFill"]} label="Reward Int BackFill" valuePropName="checked"> <Switch /> </Form.Item>
//                         <Form.Item name={["versionConfig", "adBtnBGColor"]} label="Ad Button BG Color"> <Input type="color" /> </Form.Item>
//                         <Form.Item name={["versionConfig", "adBtnTxtColor"]} label="Ad Button Text Color"> <Input type="color" /> </Form.Item>
//                         <Form.Item name={["versionConfig", "ppLink"]} label="Privacy Policy Link"> <Input /> </Form.Item>
//                         <Form.Item name={["versionConfig", "feedBackId"]} label="Feedback Email"> <Input /> </Form.Item>
//                         <Form.Item name={["versionConfig", "appOpenId"]} label="App Open ID"> <Input /> </Form.Item>
//                         {/* Add list inputs or JSON fields for ad IDs as needed */}
//                     </Panel>
//                 </Collapse>
//             </Form>
//         </Modal>
//     );
// }
