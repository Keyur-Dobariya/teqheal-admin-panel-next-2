'use client';

import React, {useEffect, useState, useRef, useCallback} from "react";
import {
    Avatar,
    Badge,
    Input,
    Button,
    Spin,
    Tooltip, Image, Col, Popover, Upload, Form, Select, Mentions,
} from "antd";
import {
    SmileOutlined,
    CloseCircleOutlined,
    SendOutlined,
    PaperClipOutlined,
    LoadingOutlined,
    DeleteOutlined,
} from "@ant-design/icons";

import appColor from "../../../utils/appColor";
import {chatApiAction, uploadType} from "../../../utils/enum";
import {
    getFileExtension,
    getFileIcon, isAudioExtension,
    isImageExtension,
    isVideoExtension
} from "../../../utils/utils";
import appKeys from "../../../utils/appKeys";
import EmojiPicker from "emoji-picker-react";

import {Typography} from 'antd';
import {fetchMessages, groupMessages, multipleFileUploadApi, sendMessageToAPI} from "./ChatApisConfig";
import {RenderComment} from "./RenderComment";
import {endpoints} from "../../../api/apiEndpoints";
import {getLocalData} from "../../../dataStorage/DataPref";

const {Option} = Select;

const {Text} = Typography;

export const MessageSection = ({roomId, employeeList, selectedRoomFullData}) => {

    const [messagesResponseData, setMessagesResponseData] = useState([]);

    const [isMsgSentLoading, setIsMsgSentLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const scrollContainerRef = useRef(null);
    const [replyData, setReplyData] = useState(null);
    const [inputEditedValue, setInputEditedValue] = useState({});
    const [droppableFiles, setDroppableFiles] = useState([]);

    const itemRefs = useRef([]);

    useEffect(() => {
        fetchMessages({
            roomId, setIsLoading, onSuccess: (responseData) => {
                const updatedMessages = responseData && responseData.length > 0
                    ? responseData.map((m) => ({...m, sent: true}))
                    : [];
                setMessagesResponseData(updatedMessages);
                itemRefs.current = updatedMessages.map((_, index) => itemRefs.current[index] ?? React.createRef());
            }
        })
    }, [roomId]);

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
        messagesResponseData.forEach((message) => {
            if (!itemRefs.current[message._id]) {
                itemRefs.current[message._id] = React.createRef();
            }
        });
    }, [messagesResponseData]);

    const focusMessageById = (messageId) => {
        const messageRef = itemRefs.current[messageId]?.current;

        if (messageRef) {
            messageRef.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    };

    useEffect(() => {
        const eventSource = new EventSource(`${endpoints.chatUpdates}userId=${getLocalData(appKeys._id)}`);

        eventSource.onmessage = (event) => {
            const updatedData = JSON.parse(event.data);
            console.log('Received chat updates:', updatedData);

            if (roomId && updatedData?.messages?.[roomId]) {
                setMessagesResponseData(updatedData.messages[roomId].messages);
                itemRefs.current = updatedData.messages[roomId].messages.map((_, index) => itemRefs.current[index] ?? React.createRef());
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE error:', error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    async function handleSendComment(message, files, messageId) {
        if (!message && (!files || files.length <= 0)) {
            return;
        }

        const messageType = determineMessageType(files);
        const newComment = createNewComment(message, files, messageType, messageId);

        if (!messageId) {
            setMessagesResponseData((prev) => [...prev, newComment]);
        }

        try {
            await sendMessageToAPI({
                newComment, setIsLoading: setIsMsgSentLoading, onSuccess: (responseData) => {
                    const updatedMessages = responseData && responseData.length > 0
                        ? responseData.map((m) => ({...m, sent: true}))
                        : [];
                    setMessagesResponseData(updatedMessages);
                    itemRefs.current = updatedMessages.map((_, index) => itemRefs.current[index] ?? React.createRef());
                }
            });
        } catch (error) {
            setMessagesResponseData((prev) =>
                prev.map((c) =>
                    c.tempId === newComment.tempId ? {...c, sent: false, failed: true} : c
                )
            );
        }
    }

    function determineMessageType(files) {
        if (!files || files.length === 0) return 'text';

        if (files.every(file => isImageExtension(file.fileUrl))) return 'image';
        if (files.every(file => isVideoExtension(file.fileUrl))) return 'video';
        if (files.every(file => isAudioExtension(file.fileUrl))) return 'audio';

        return 'file';
    }

    function createNewComment(message, files, messageType, messageId) {
        return {
            action: chatApiAction.sendMessage,
            message,
            attachments: files,
            messageType,
            messageId,
            roomId: roomId,
            sender: getLocalData(appKeys._id),
            createdAt: Date.now(),
            sent: false,
            tempId: Date.now(),
            replyMessageId: replyData?.replyMessageId || null,
            replyMessageValue: replyData?.replyMessageValue || null,
        };
    }

    const groupMessagesByDate = (messages) => {
        const groups = {};

        messages.forEach(message => {
            const date = new Date(message.createdAt);
            const now = new Date();

            const todayStr = now.toDateString();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            let label = '';
            if (date.toDateString() === todayStr) label = 'Today';
            else if (date.toDateString() === yesterdayStr) label = 'Yesterday';
            else label = new Intl.DateTimeFormat('en-GB', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                }).format(date);

            if (!groups[label]) groups[label] = [];
            groups[label].push(message);
        });

        return groups;
    };

    const getFlattenedMessages = () => {
        const allMessages = messagesResponseData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const groupedMessages = groupMessagesByDate(allMessages);
        const allMessagesData = [];

        Object.entries(groupedMessages).forEach(([dateLabel, msgs]) => {
            msgs.forEach((msg) => {
                allMessagesData.push({
                    ...msg,
                    dateLabel,
                });
            });
        });

        return allMessagesData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    };

    const allFlattenedMessages = getFlattenedMessages();

    const groupedVisibleMessages = allFlattenedMessages.reduce((acc, msg) => {
        if (!acc[msg.dateLabel]) acc[msg.dateLabel] = [];
        acc[msg.dateLabel].push(msg);
        return acc;
    }, {});

    const handleMenuClick = (value, fileUrl, message, sender) => {
        if (value === 'edit') {
            setInputEditedValue({
                message: message.message,
                messageId: message._id,
            });
        } else if (value === 'reply') {
            setReplyData({
                replyMessageId: message._id,
                replyMessageValue: fileUrl || message.message,
                isFile: !!fileUrl,
                sender: sender,
                message: message,
            });
        } else if (value === 'copy') {
            if (fileUrl) {
                navigator.clipboard.writeText(fileUrl)
                    .then(() => showToast('success', 'Link Copied!'))
                    .catch(err => showToast('error', 'Failed to copy'));
            } else {
                showToast('error', 'Link not found')
            }
        } else if (value === 'download') {
            if (fileUrl) {
                const link = document.createElement("a");
                link.href = fileUrl;
                link.target = "_blank";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                showToast('error', 'Link not found')
            }
        } else if (value === 'delete') {

        }
        // setContextMenuVisible(false);
    }

    const handleDrop = useCallback((event) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        setDroppableFiles(files);
    }, []);

    const handleDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
    }, []);

    return (
        <div className="flex flex-1 flex-col items-center overflow-hidden">
            <div className="flex flex-1 flex-col items-center overflow-y-auto w-full" style={{ scrollbarWidth: "thin" }} ref={scrollContainerRef}>
                {isLoading ?
                    <div style={{flex: 1, display: "flex", justifyContent: "center", alignItems: "center"}}>
                        <Spin tip="Loading messages..." style={{marginTop: 30}}/>
                    </div> : <div className="flex-1 px-4 mt-1 max-w-[800px] w-full">
                        {messagesResponseData.length > 0 ? (
                            <Col
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                span={24}>
                                {Object.entries(groupedVisibleMessages).map(([dateLabel, msgs]) => (
                                    <div key={dateLabel} className="mb-4 relative">
                                        <div className="sticky top-0 z-10 flex justify-center">
                                            <div className="text-[11px] font-semibold text-white bg-[#3c3c3c] text-center px-[10px] py-[3px] inline-block rounded-full">
                                                {dateLabel}
                                            </div>
                                        </div>
                                        {msgs.map((message, idx) => (
                                            <RenderComment key={message._id} employeeList={employeeList}
                                                           message={message} idx={idx} msgs={msgs}
                                                           itemRefs={itemRefs.current[message._id]}
                                                           focusMessageById={(messageId) => {
                                                               focusMessageById(messageId);
                                                           }} handleMenuClick={handleMenuClick}/>
                                        ))}
                                    </div>
                                ))}
                            </Col>
                        ) : (
                            <div className="text-center text-[#888] p-5 text-sm">
                                No messages yet.
                            </div>
                        )}
                    </div>}
            </div>
            <ChatInput replyData={replyData} setReplyData={setReplyData} droppableFiles={droppableFiles} setDroppableFiles={setDroppableFiles} inputEditedValue={inputEditedValue}
                       setInputEditedValue={setInputEditedValue} selectedRoomFullData={selectedRoomFullData}
                       handleSendComment={handleSendComment}/>
        </div>
    );
};

export const MessageReplyContainer = ({replyData, setReplyData, isClosable = true, onClick}) => {
    return (
        replyData ? <div className="px-[10px] py-[7px] bg-[#f4f4f4] rounded cursor-pointer border border-[#e6e6e6]" onClick={(e) => {
            e.stopPropagation();
            if (!isClosable) {
                onClick(replyData.replyMessageId);
            }
        }}>
            <div style={{display: "flex", gap: "10px"}}>
                <div style={{width: "2px", background: "#aeaeae", borderRadius: "3px"}}/>
                <div style={{flex: 1}}>
                    <div style={{fontSize: "11px", color: "#9f9f9f"}}>
                        {replyData.sender.fullName} &bull; {new Date(replyData.message.createdAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    })}
                    </div>
                    <div
                        style={{fontSize: "11px", display: "flex", alignItems: "center", color: "#9f9f9f", gap: "5px"}}>
                        {replyData.isFile ? <div>
                            <img src={getFileIcon(replyData.replyMessageValue)} alt="file" width={20} height={20}/>
                        </div> : null}
                        {replyData.isFile ?
                            <EllipsisMiddle>{replyData.replyMessageValue.substring(replyData.replyMessageValue.lastIndexOf('/') + 1)}</EllipsisMiddle> :
                            <EllipsisMiddle>{String(replyData.replyMessageValue)}</EllipsisMiddle>}
                    </div>
                </div>
                {isClosable ? <CloseCircleOutlined style={{cursor: "pointer"}} onClick={() => {
                    if (isClosable) {
                        setReplyData(null);
                    }
                }}/> : null}
            </div>
        </div> : null
    );
}

export const ChatInput = ({
                              replyData,
                              setReplyData,
                              droppableFiles,
                              setDroppableFiles,
                              inputEditedValue,
                              setInputEditedValue,
                              selectedRoomFullData,
                              handleSendComment,
                          }) => {

    const otherMembers = selectedRoomFullData.members.filter(m => m._id !== getLocalData(appKeys._id));

    const messageKey = 'message';
    const [popoverVisible, setPopoverVisible] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const mainContainerRef = useRef(null);
    const textAreaRef = useRef(null);
    const [form] = Form.useForm();

    const handleContainerClick = () => {
        if (textAreaRef.current === document.activeElement) {
            return;
        }
        mainContainerRef.current.focus();
        textAreaRef.current.focus();
    };

    useEffect(() => {
        form.setFieldValue(messageKey, inputEditedValue.message);
    }, [inputEditedValue]);

    const [pendingFiles, setPendingFiles] = useState([]);

    const beforeUpload = (file) => {
        setPendingFiles((prevFiles) => [...prevFiles, file]);
        return false;
    };

    useEffect(() => {
        if(droppableFiles.length > 0) {
            setPendingFiles((prevFiles) => [...prevFiles, ...droppableFiles]);
        }
    }, [droppableFiles]);

    const handleSendClick = async () => {
        setInputEditedValue((prevData) => ({
            ...prevData,
            message: form.getFieldValue(messageKey),
        }));
        if (pendingFiles.length > 0) {
            await multipleFileUploadApi({
                files: pendingFiles,
                folderType: uploadType.chatting,
                setIsLoading: setIsUploading,
                onSuccess: (data) => {
                    handleSendComment(form.getFieldValue(messageKey), data?.data || [], inputEditedValue.messageId)
                    setPendingFiles([]);
                    setDroppableFiles([]);
                }
            })
        } else {
            handleSendComment(form.getFieldValue(messageKey), [], inputEditedValue.messageId);
        }
        setInputEditedValue({});
        form.setFieldValue(messageKey, "");
    };

    const handleKeyDown = async (e) => {
        const mentionsDropdownOpen = document.querySelector('.ant-mentions-dropdown') !== null;

        if (e.key === "Enter" && !e.shiftKey) {
            if (mentionsDropdownOpen) {
                return;
            }

            e.preventDefault();
            await handleSendClick();
        }
    };

    const handleEmojiClick = (emoji) => {
        form.setFieldValue(messageKey, form.getFieldValue(messageKey) + emoji.emoji);
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFieldChange = (changedValues, allValues) => {
        form.setFieldsValue(allValues);
    };

    return (
        <div className="flex flex-col p-[10px] gap-[15px] max-w-[800px] w-full">
            {pendingFiles && pendingFiles.length > 0 ? (
                <div className="flex items-center bg-[#fbfbfb] rounded-[10px] border border-[#d3d3d3] p-[10px] gap-[10px] w-full overflow-x-auto scrollbar-thin scrollbar-thumb-[rgba(100,100,100,0.5)] scrollbar-track-transparent">
                    {pendingFiles.map((file) => {
                        const isImage = isImageExtension(file);
                        const fileSrc = typeof file === 'string' ? file : URL.createObjectURL(file);

                        return (
                            <div
                                key={file.uid}
                                className="flex items-center min-w-[220px] max-w-[220px] w-full gap-[10px] rounded-[10px] border border-[#e8e8e8] bg-white p-[7px]"
                                title={file.name}
                            >
                                {isImage ? (
                                    <Image
                                        src={fileSrc}
                                        width={45}
                                        height={45}
                                    />
                                ) : (
                                    <img src={getFileIcon(file)} alt="file" width={45} height={45}/>
                                )}
                                <div style={{flex: 1, gap: 3}}>
                                    <EllipsisMiddle>{String(file.name)}</EllipsisMiddle>
                                    <div style={{fontSize: '11px', color: '#999'}}>
                                        {getFileExtension(file).toUpperCase()} &bull; {formatBytes(file.size)}
                                    </div>
                                </div>
                                {isUploading ? <Spin indicator={<LoadingOutlined spin/>}/> : <Tooltip title="Remove">
                                    <DeleteOutlined
                                        onClick={() =>
                                            setPendingFiles(prevFiles =>
                                                prevFiles.filter(prevFile => prevFile !== file)
                                            )
                                        }
                                        style={{
                                            color: appColor.danger,
                                            fontSize: '16px',
                                            cursor: 'pointer'
                                        }}
                                    />
                                </Tooltip>}
                            </div>
                        );
                    })}
                </div>
            ) : null}
            <Form form={form} onValuesChange={handleFieldChange}>
                <div
                    className="flex flex-col p-[10px] px-[8px] gap-[10px] bg-[#fbfbfb] rounded-[10px] border border-[#e6e6e6] transition-all duration-300 ease-in-out focus-within:border-[#7367F0] focus-within:shadow-[0_0_5px_rgba(115,103,240,0.6)] hover:border-[#7367F0]"
                    ref={mainContainerRef}
                    tabIndex="0"
                    onClick={handleContainerClick}
                >
                    <MessageReplyContainer replyData={replyData} setReplyData={setReplyData} isClosable={true}/>
                    <div className="flex items-end">
                        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                            <Popover
                                content={
                                    <EmojiPicker onEmojiClick={handleEmojiClick}/>
                                }
                                title="Pick an Emoji"
                                trigger="click"
                                open={popoverVisible}
                                onOpenChange={(newVisible) => setPopoverVisible(newVisible)}
                            >
                                <Button
                                    icon={<SmileOutlined/>}
                                    className="fieldIcon"
                                    type="text"
                                />
                            </Popover>
                        </div>
                        <Form.Item name="message" style={{marginBottom: "0px", flex: 1}}>
                            <Mentions
                                ref={textAreaRef}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                autoSize={{ minRows: 1, maxRows: 5 }}
                                onSelect={(option) => {
                                    console.log("option=>", option.value);
                                }}
                                style={{
                                    border: "none",
                                    outline: "none",
                                    background: "transparent",
                                    boxShadow: "none",
                                }}
                            >
                                {otherMembers.map(member => (
                                    <Option key={member._id} value={member.fullName}>
                                        <Avatar
                                            src={member.profilePhoto}
                                            size="small"
                                            style={{ marginRight: 8 }}
                                        />
                                        {member.fullName}
                                    </Option>
                                ))}
                            </Mentions>
                        </Form.Item>
                        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                            <Upload
                                showUploadList={false}
                                beforeUpload={beforeUpload}
                                pastable
                                multiple
                            >
                                <Tooltip title="Select Files">
                                    <Button
                                        icon={<PaperClipOutlined/>}
                                        className="fieldIcon"
                                        type="text"
                                    />
                                </Tooltip>
                            </Upload>
                            <div
                                style={{
                                    height: "25px",
                                    width: "1px",
                                    backgroundColor: "#c1c1c1",
                                    margin: "0px 15px",
                                }}
                            ></div>
                            <Badge count={pendingFiles.length} size="small" offset={[-7, 7]}>
                                <Tooltip title="Send">
                                    <Button
                                        icon={<SendOutlined/>}
                                        disabled={isUploading}
                                        className="fieldIcon"
                                        onClick={handleSendClick}
                                        type="text"
                                    />
                                </Tooltip>
                            </Badge>
                        </div>
                    </div>
                </div>
            </Form>
        </div>
    );
};

export const EllipsisMiddle = ({children}) => {
    const fileNameWithExtension = children.split('/').pop();
    const extensionLength = fileNameWithExtension.split('.').pop().length;
    const start = children.slice(0, children.length - extensionLength);
    const suffix = children.slice(-extensionLength).trim();
    return (
        <Text ellipsis={{suffix}}>
            {start}
        </Text>
    );
};