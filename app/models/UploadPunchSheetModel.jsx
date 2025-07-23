'use client'

import React, {useRef, useState} from "react";
import {Form, Modal, Upload} from "antd";
import { InboxOutlined } from '@ant-design/icons';
import appString from "../utils/appString";
import {endpoints} from "../api/apiEndpoints";
import apiCall, {HttpMethod} from "../api/apiServiceProvider";
import appKeys from "../utils/appKeys";
import {UserSelect} from "../components/CommonComponents";
const { Dragger } = Upload;

export default function UploadPunchSheetModel({
                                                  isModelOpen,
                                                  setIsModelOpen,
                                                  activeUsersData,
                                                  onSuccessCallback,
                                              }) {
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef(null);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const modelTitle = appString.uploadPunchSheet;

    const handleCancel = () => {
        setIsModelOpen(false);
        form.resetFields();
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    };

    const handleAddUpdateRecord = async () => {
        try {
            await form.validateFields();

            const formData = new FormData();

            formData.append(
                "sheet",
                form.getFieldValue("sheet")
            );

            formData.append("userId", form.getFieldValue(appKeys.user));

            await apiCall({
                method: HttpMethod.POST,
                url: endpoints.punchSheetUploadAndGetData,
                data: formData,
                isMultipart: true,
                setIsLoading: setIsLoading,
                successCallback: (data) => {
                    setIsModelOpen(false);
                    onSuccessCallback(data);
                },
            });
        } catch (error) {
            console.error("Form validation/API call failed:", error);
        }
    };

    return (
        <Modal
            title={<div className="font-medium text-base">{modelTitle}</div>}
            maskClosable={false}
            centered
            open={isModelOpen}
            width={400}
            onOk={handleAddUpdateRecord}
            onCancel={handleCancel}
            confirmLoading={isLoading}
            okText={modelTitle}
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
                    <Form.Item name={appKeys.user} label={"User"}
                               rules={[{required: true, message: 'Please select User!'}]} span={24}>
                        <UserSelect users={activeUsersData}/>
                    </Form.Item>
                    <Form.Item name="sheet" label={"Upload Punch Sheet"}
                               rules={[{required: true, message: 'Upload Punch Sheet'}]} span={24}>
                        <Dragger name="sheet"
                                multiple={false}
                                fileList={fileList}
                                onRemove={() => {
                                    setFileList([]);
                                }}
                                customRequest={({file, onSuccess}) => {
                                    form.setFieldsValue({
                                        "sheet": file,
                                    });

                                    const uploadedImageUrl = URL.createObjectURL(file);

                                    setFileList([
                                        {
                                            uid: "1",
                                            name: file.name,
                                            url: uploadedImageUrl,
                                        },
                                    ]);

                                    onSuccess();
                                }}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        </Dragger>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
}
