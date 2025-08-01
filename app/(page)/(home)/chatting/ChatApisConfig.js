'use client';

import {endpoints} from "../../../api/apiEndpoints";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {chatApiAction} from "../../../utils/enum";

export const createChatRoom = async ({body, setIsLoading, onSuccess}) => {
    try {
        await apiCall({
            method: HttpMethod.POST,
            url: endpoints.chatApi,
            data: body,
            setIsLoading: setIsLoading,
            showSuccessMessage: false,
            successCallback: onSuccess,
        });
    } catch (error) {
        console.log("createChatRoom Error->", error);
    }
};

export const fetchMessages = async ({roomId, setIsLoading, onSuccess}) => {
    if (!roomId) return;
    try {
        await apiCall({
            method: HttpMethod.GET,
            url: `${endpoints.chatApi}?action=${chatApiAction.getMessages}&roomId=${roomId}`,
            setIsLoading: setIsLoading,
            showSuccessMessage: false,
            successCallback: (data) => {
                if(data?.data && data?.data?.messages && data?.data?.messages?.length > 0) {
                    onSuccess(data?.data?.messages);
                } else {
                    onSuccess([]);
                }
            },
        });
    } catch (error) {
        console.log("fetchMessages Error->", error);
    }
};

export const sendMessageToAPI = async ({newComment, setIsLoading, onSuccess}) => {
    try {
        await apiCall({
            method: HttpMethod.POST,
            url: endpoints.chatApi,
            data: newComment,
            setIsLoading: setIsLoading,
            showSuccessMessage: false,
            successCallback: (data) => {
                if(data?.data && data?.data?.messages && data?.data?.messages?.length > 0) {
                    onSuccess(data?.data?.messages);
                } else {
                    onSuccess([]);
                }
            }
        });
    } catch (error) {
        console.log("sendMessageToAPI Error->", error);
    }
};

export const singleFileUploadApi = async ({file, folderType, setIsLoading, onSuccess}) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", folderType);

        await apiCall({
            method: HttpMethod.POST,
            url: endpoints.upload,
            data: formData,
            setIsLoading: setIsLoading,
            isMultipart: true,
            showSuccessMessage: false,
            successCallback: onSuccess,
        });
    } catch (error) {
        console.log("singleFileUploadApi Error->", error);
    }
};

export const multipleFileUploadApi = async ({files, folderType, setIsLoading, onSuccess}) => {
    try {
        const formData = new FormData();
        files.forEach(file => {
            formData.append("file[]", file);
        });
        formData.append("type", folderType);

        await apiCall({
            method: HttpMethod.POST,
            url: endpoints.uploadMultiFiles,
            data: formData,
            setIsLoading: setIsLoading,
            isMultipart: true,
            showSuccessMessage: false,
            successCallback: onSuccess,
        });
    } catch (error) {
        console.log("multipleFileUploadApi Error->", error);
    }
};

export const deleteFileUploadApi = async ({fileUrl, setIsLoading, onSuccess}) => {
    try {
        await apiCall({
            method: HttpMethod.POST,
            url: endpoints.uploadMultiFiles,
            data: {
                fileUrl: fileUrl,
            },
            setIsLoading: setIsLoading,
            isMultipart: true,
            showSuccessMessage: false,
            successCallback: onSuccess,
        });
    } catch (error) {
        console.log("deleteFileUploadApi Error->", error);
    }
};

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

const getFlattenedMessages = (messages) => {
    const allMessages = messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
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

export const groupMessages = (messages) => {
    return getFlattenedMessages(messages).reduce((acc, msg) => {
        if (!acc[msg.dateLabel]) acc[msg.dateLabel] = [];
        acc[msg.dateLabel].push(msg);
        return acc;
    }, {});
};