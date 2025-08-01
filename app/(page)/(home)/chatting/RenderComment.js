'use client';

import React, {useState} from "react";
import {Image, Skeleton} from "antd";
import {
    CheckCircleFilled,
    LoadingOutlined,
    ExclamationCircleOutlined, CheckCircleOutlined,
} from "@ant-design/icons";
import {MoreVertical} from '../../../utils/icons';
import {
    getTwoCharacterFromName,
    getDataById,
    getFileExtension,
    getFileIcon,
    isImageExtension,
} from "../../../utils/utils";
import {EllipsisMiddle, MessageReplyContainer} from "./MessageSection";
import ContextMenuPopover from "./ContextMenuPopover";
import {PreviewableImage} from "./PreviewableImage";
import {getDarkColor} from "../../../utils/appColor";
import {getLocalData} from "../../../dataStorage/DataPref";
import appKeys from "../../../utils/appKeys";

export const RenderComment = ({employeeList, message, idx, msgs, itemRefs, focusMessageById, handleMenuClick}) => {
    const sender = getDataById(employeeList, message.sender._id || message.sender);
    const displayName = sender?.fullName || "Unknown";
    const profilePhoto = sender?.profilePhoto || "";
    const initials = getTwoCharacterFromName(displayName);
    const isMe = sender._id === getLocalData(appKeys._id);
    const isFirstInGroup =
        idx === 0 || msgs[idx - 1].sender._id !== message.sender._id;
    const isLastInGroup =
        idx === msgs.length - 1 || msgs[idx + 1].sender._id !== message.sender._id;

    const messageSending = getDataById(msgs, message._id)?.sent === false;
    const messageSent = getDataById(msgs, message._id)?.sent === true;
    const messageFailed = getDataById(msgs, message._id)?.failed === true;
    const hasOtherUserReadMessage = Object.keys(message?.isReadBy || {}).some(
        userId => userId !== getLocalData(appKeys._id) && message.isReadBy[userId]
    ) || false;

    const handleClick = (value, fileUrl) => {
        handleMenuClick(value, fileUrl, message, sender);
    }

    const MessageSendingStatus = () => {
        if (isMe && isLastInGroup) {
            if (messageFailed) {
                return <ExclamationCircleOutlined size={11}/>;
            } else if (messageSending) {
                return <LoadingOutlined size={11}/>;
            } else if (messageSent) {
                return <CheckCircleOutlined size={11}/>;
            } else if (hasOtherUserReadMessage) {
                return <CheckCircleFilled size={11}/>;
            } else {
                return <CheckCircleOutlined size={11}/>;
            }
        } else {
            return <CheckCircleOutlined size={11} style={{color: "transparent"}}/>;
        }
    }

    return (
        <div key={message._id} ref={itemRefs} className="commentWrapper"
             style={{position: 'relative'}}>
            <div style={{position: 'relative', zIndex: 1}}>
                {!isMe && <div style={{
                    marginLeft: 45,
                    marginBottom: "3px"
                }}>
                    {isFirstInGroup ? <span className="senderName">{displayName}</span> : null}
                </div>}
                <div className={`messageItem ${isMe ? "messageSent" : "messageReceived"}`}>
                    {!isMe && <div>
                        {isFirstInGroup ? <div className="avatar"
                                               style={{
                                                   backgroundColor: getDarkColor(initials),
                                               }}
                        >
                            {profilePhoto ? (
                                <img
                                    src={profilePhoto}
                                    alt={displayName}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                />
                            ) : (
                                initials
                            )}
                        </div> : <div style={{
                            width: 30,
                            height: 30,
                        }}></div>}
                    </div>}
                    {isMe ? <div style={{marginLeft: "-5px", alignSelf: "end", marginBottom: "8px"}}>
                        <MessageSendingStatus/>
                    </div> : null}
                    <div>
                        {Array.isArray(message.attachments) && message.attachments.length > 0 ? (
                            <div style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                                {message.attachments.every(att => isImageExtension(att.fileType)) && message.attachments.length > 1 ? (
                                    <div
                                        className={`messageItemHov ${isMe ? "messageSent" : "messageReceived"}`}
                                        style={{display: "flex", gap: "8px"}}>
                                        <div className="attachmentsGroup">
                                            <Image.PreviewGroup>
                                                {message.attachments.map((att, index) => {
                                                    return (
                                                        <Image
                                                            title={att.fileName}
                                                            key={index}
                                                            src={att.fileUrl}
                                                            width={150}
                                                            style={{maxHeight: 150, objectFit: "cover"}}
                                                        />
                                                    );
                                                })}
                                            </Image.PreviewGroup>
                                        </div>
                                        <span className="messageTime">
                            {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                </span>
                                    </div>
                                ) : (
                                    <div>
                                        {message.attachments.map((att, index) => (
                                            <div
                                                className={`messageItemHov ${isMe ? "messageSent" : "messageReceived"}`}
                                                style={{display: "flex", gap: "8px"}}>
                                                <ContextMenuPopover isFile={true} fileUrl={att.fileUrl} isMe={isMe}
                                                                    handleClick={handleClick}>
                                                    <div key={index} className="attachments" title={att.fileName}>
                                                        {isImageExtension(att.fileUrl) ? (
                                                            <PreviewableImage key={index} src={att.fileUrl}/>
                                                        ) : (
                                                            <>
                                                                <img src={getFileIcon(att.fileUrl)} alt="file"
                                                                     width={45}
                                                                     height={45}/>
                                                                <div style={{flex: 1, gap: 3}}>
                                                                    <EllipsisMiddle>{String(att.fileName)}</EllipsisMiddle>
                                                                    <div style={{fontSize: '11px', color: '#999'}}>
                                                                        {getFileExtension(att.fileUrl).toUpperCase()} &bull; {new Date(message.createdAt).toLocaleTimeString([], {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                    </div>
                                                                </div>
                                                                <ContextMenuPopover isFile={true} fileUrl={att.fileUrl}
                                                                                    isMe={isMe}
                                                                                    handleClick={handleClick}
                                                                                    dynamicClick={true}>
                                                                    <MoreVertical
                                                                        className="commonIconStyle"
                                                                        style={{cursor: "pointer"}}
                                                                    />
                                                                </ContextMenuPopover>
                                                            </>
                                                        )}
                                                    </div>
                                                </ContextMenuPopover>
                                                <span className="messageTime">
                            {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : null}
                        {message.message ? <div className={`messageItemHov ${isMe ? "messageSent" : "messageReceived"}`}
                                                style={{display: "flex", gap: "8px"}}>
                            <ContextMenuPopover isFile={false} isMe={isMe} handleClick={handleClick}>
                                <div
                                    className="messageContainer messageText"
                                    style={{gap: "5px"}}
                                >
                                    {message.replyMessageId ? <MessageReplyContainer replyData={{
                                        sender: sender,
                                        message: message,
                                        isFile: message.replyMessageIsFile,
                                        replyMessageId: message.replyMessageId,
                                        replyMessageValue: message.replyMessageValue,
                                    }} setReplyData={null} isClosable={false} onClick={(messageId) => {
                                        focusMessageById(messageId);
                                    }}/> : null}
                                    <div>
                                        {message.message}
                                    </div>
                                </div>
                            </ContextMenuPopover>
                            <span className="messageTime">
                            {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                </span>
                        </div> : null}
                    </div>
                </div>
            </div>
        </div>
    );
};