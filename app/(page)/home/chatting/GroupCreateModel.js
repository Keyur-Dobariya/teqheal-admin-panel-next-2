'use client';

import React, {useState} from "react";
import {Avatar, Input, Tooltip, Upload, Modal, Form, Select, Space} from "antd";
import {UsergroupAddOutlined, PlusOutlined, CloseOutlined} from "@ant-design/icons";
import {createChatRoom, singleFileUploadApi} from "./ChatApisConfig";
import {chatApiAction, uploadType} from "../../../utils/enum";
import {useAppData} from "../../../masterData/AppDataContext";
import {getDarkColor} from "../../../utils/appColor";
import {getTwoCharacterFromName} from "../../../utils/utils";
import appKeys from "../../../utils/appKeys";
import {getLocalData} from "../../../dataStorage/DataPref";
import {UserSelect} from "../../../components/CommonComponents";

const {Option} = Select;

const GroupCreateModel = ({onSuccess}) => {
    const {usersData} = useAppData();
    const availableUsers = usersData.filter(user => user._id !== getLocalData(appKeys._id));
    const [form] = Form.useForm();
    const [groupPhoto, setGroupPhoto] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleModalClose = () => setIsModalOpen(false);

    const handleSubmit = async () => {
        let groupPhotoUrl = '';
        if (groupPhoto) {
            await singleFileUploadApi({
                file: groupPhoto,
                folderType: uploadType.chatting,
                setIsLoading,
                onSuccess: (data) => (groupPhotoUrl = data?.data?.url),
            });
        }
        const body = {
            action: chatApiAction.createGroup,
            userIds: form.getFieldValue("members"),
            isGroup: true,
            groupName: form.getFieldValue("groupName"),
            groupPhoto: groupPhotoUrl,
        };
        await createChatRoom({
            body, setIsLoading, onSuccess: (data) => {
                onSuccess(data);
                handleModalClose();
            }
        });
    };

    return (
        <>
            <Tooltip title="Create Group">
                <UsergroupAddOutlined onClick={() => setIsModalOpen(true)}/>
            </Tooltip>
            <Modal
                title="Create Group Chat"
                open={isModalOpen}
                onCancel={handleModalClose}
                onOk={handleSubmit}
                confirmLoading={isLoading}
                centered
                width={450}
            >
                <div>
                    <Form form={form} layout="vertical">
                        <Form.Item name="groupPhoto"
                                   style={{display: "flex", justifyContent: "center", marginTop: "15px"}}>
                            <Upload
                                listType="picture-circle"
                                maxCount={1}
                                beforeUpload={(file) => {
                                    setGroupPhoto(file);
                                    return false;
                                }}
                                onRemove={() => setGroupPhoto(null)}
                            >
                                {groupPhoto ? null : (
                                    <button style={{border: 0, background: "none"}} type="button">
                                        <PlusOutlined/>
                                        <div style={{marginTop: 8}}>Upload</div>
                                    </button>
                                )}
                            </Upload>
                        </Form.Item>
                        <Form.Item
                            label="Group Name"
                            name="groupName"
                            rules={[{required: true, message: 'Group name is required'}]}
                        >
                            <Input placeholder="Enter group name"
                                   style={{height: "40px"}}/>
                        </Form.Item>
                        <Form.Item
                            label="Members"
                            name="members"
                            rules={[{required: true, message: 'Please select at least 2 members'}]}
                        >
                            <UserSelect users={availableUsers} isMultiple={true}/>
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        </>
    );
};

export default GroupCreateModel;
