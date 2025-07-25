'use client'

import React, {useState, useEffect, useRef, useLayoutEffect} from "react";
import {
    Avatar,
    Button, Card, Col,
    DatePicker, Divider, Drawer,
    Dropdown, Empty,
    Form,
    Image, Input,
    message,
    Modal, Popconfirm, Popover, Row, Select, Spin, Tabs,
    Tag,
    TimePicker,
    Tooltip, Badge,
    Upload
} from "antd";

import {
    CloseCircleOutlined,
    DeleteOutlined, DislikeFilled, DislikeOutlined, DownOutlined,
    FileOutlined, LikeFilled, LikeOutlined,
    LoadingOutlined, MessageFilled,
    PlusOutlined,
    UploadOutlined, UpOutlined
} from "@ant-design/icons";
import appColor, {getDarkColor} from "../../../utils/appColor";

import appKeys from "../../../utils/appKeys";
import appString from "../../../utils/appString";
import {getLocalData, isAdmin} from "../../../dataStorage/DataPref";
import {endpoints} from "../../../api/apiEndpoints";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {
    ApprovalStatus,
    BloodGroup,
    DateTimeFormat,
    Gender,
    getIconByKey,
    getKeyByLabel,
    getLabelByKey, projectTypeLabel,
    taskCategoryLabel,
    taskColumnLabel,
    taskColumnStatusLabel,
    taskPriorityLabel,
    taskStatusLabel,
    Technology,
    UserRole,
} from "../../../utils/enum";
import dayjs from "dayjs";
import {
    formatMessageTime,
    formatMessageTimeReal,
    getDataById,
    getTwoCharacterFromName,
    profilePhotoManager
} from "../../../utils/utils";
import {AppDataFields, useAppData} from "../../../masterData/AppDataContext";
import {useRouter} from "next/navigation";
import pageRoutes from "../../../utils/pageRoutes";
import {ArrowDown, ArrowUp, Box, Delete, FileText, MessageCircle, Trash, Users} from "../../../utils/icons";
import RichTextEditor from "../../../components/editor/RichTextEditor";

const {Option} = Select;
const {TextArea} = Input;

export const CommentSection = ({tasksData, employeeList}) => {

    const {
        updateAppDataField,
    } = useAppData();

    const updatedComments = tasksData && tasksData[appKeys.comments] ? tasksData[appKeys.comments].map((c) => ({
        ...c,
        sent: true,
    })) : [];

    const editorDisabledFunction = {
        // Header
        headerShow: false,
        showStatusBar: false,
        settings: true,
        findReplace: true,
        showHtml: true,
        fullScreen: true,

        // Text formatting
        bold: true,
        italic: true,
        underline: true,
        strikethrough: true,
        subscript: false,
        superscript: false,

        // Alignment
        alignLeft: true,
        alignCenter: true,
        alignRight: true,
        alignJustify: true,

        // Lists and indentation
        bulletList: true,
        numberedList: true,
        indent: false,
        outdent: false,

        // Block elements
        headings: true,
        blockquote: false,
        horizontalRule: false,
        codeBlock: false,

        // Media and links
        link: true,
        image: true,
        upload: true,
        table: true,

        // History
        undo: false,
        redo: false,
        clearAll: true,
        clearFormat: false,

        // Styling
        fontFamily: false,
        fontSize: false,
        textColor: true,
        backgroundColor: true,

        // Export
        saveHtml: false,
        copyHtml: false
    };

    const [showAllComments, setShowAllComments] = useState(false);
    const [comments, setComments] = useState(updatedComments);
    const hasScrolledRef = useRef(false);
    const scrollContainerRef = useRef(null);
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [expandedComments, setExpandedComments] = useState({});

    useEffect(() => {
        const evtSource = new EventSource(endpoints.tasksChange);

        evtSource.onmessage = (event) => {
            if (event.data) {
                updateAppDataField(AppDataFields.taskBoardData, JSON.parse(event.data));

                for (const statusKey in JSON.parse(event.data)) {
                    const tasksInStatus = JSON.parse(event.data)[statusKey];
                    const task = tasksInStatus.find(task => task.taskId === tasksData.taskId);
                    if (task) {
                        const updatedComments = task && task[appKeys.comments] ? task[appKeys.comments].map((c) => ({
                            ...c,
                            sent: true,
                        })) : [];

                        setComments(updatedComments);
                    }
                }
            }
        };

        evtSource.addEventListener('end', () => {
            console.log('Stream ended');
            evtSource.close();
        });
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!hasScrolledRef.current && scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
                hasScrolledRef.current = true;
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [comments]);

    // Group comments by parentId to create a threaded structure
    const groupCommentsByParent = (comments) => {
        const commentMap = {};
        const threadedComments = [];

        comments.forEach(comment => {
            comment.children = [];
            commentMap[comment._id] = comment;
        });

        comments.forEach(comment => {
            if (comment.parentId && commentMap[comment.parentId]) {
                commentMap[comment.parentId].children.push(comment);
            } else {
                threadedComments.push(comment);
            }
        });

        return threadedComments;
    };

    // Group comments by date
    const groupMessagesByDate = (comments) => {
        const groups = {};

        comments.forEach(comment => {
            const date = new Date(comment.commentTime);
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
            groups[label].push(comment);
        });

        return groups;
    };

    async function handleSendComment(text, parentId = null) {
        const newComment = {
            comment: text,
            commentTime: Date.now(),
            parentId,
            sent: false,
            tempId: Date.now(),
        };

        setComments((prev) => [...prev, newComment]);

        try {
            await apiCall({
                method: HttpMethod.POST,
                url: `${endpoints.postTaskComment}${tasksData["_id"]}`,
                data: newComment,
                setIsLoading: false,
                showSuccessMessage: false,
                successCallback: (data) => {
                    const updatedComments = data?.data.comments.map((c) => ({
                        ...c,
                        sent: true,
                    }));
                    setComments(updatedComments || tasksData[appKeys.comments]);
                },
            });
        } catch (error) {
            setComments((prev) =>
                prev.map((c) =>
                    c.tempId === newComment.tempId ? {...c, sent: false, failed: true} : c
                )
            );
            console.error('Failed to send comment');
        }
    }

    async function handleLikeDisLikeComment(commentId, type) {
        try {
            const newComment = {
                commentId: commentId,
                [type]: getLocalData(appKeys._id),
            };
            await apiCall({
                method: HttpMethod.POST,
                url: `${endpoints.postTaskComment}${tasksData["_id"]}`,
                data: newComment,
                setIsLoading: false,
                showSuccessMessage: false,
                successCallback: (data) => {
                    setComments(data?.data.comments || tasksData[appKeys.comments]);
                },
            });
        } catch (error) {
            console.error('Failed to send comment');
        }
    }

    const getFlattenedMessages = () => {
        const allComments = comments.sort((a, b) => new Date(a.commentTime) - new Date(b.commentTime));
        const threadedComments = groupCommentsByParent(allComments);
        const groupedMessages = groupMessagesByDate(threadedComments);
        const allMessages = [];

        Object.entries(groupedMessages).forEach(([dateLabel, msgs]) => {
            msgs.forEach((msg) => {
                allMessages.push({
                    ...msg,
                    dateLabel,
                });
            });
        });

        return allMessages.sort((a, b) => new Date(a.commentTime) - new Date(b.commentTime));
    };

    const allFlattenedMessages = getFlattenedMessages();
    const visibleMessages = showAllComments ? allFlattenedMessages : allFlattenedMessages.slice(-5);

    const groupedVisibleMessages = visibleMessages.reduce((acc, msg) => {
        if (!acc[msg.dateLabel]) acc[msg.dateLabel] = [];
        acc[msg.dateLabel].push(msg);
        return acc;
    }, {});

    const toggleExpand = (commentId) => {
        setExpandedComments((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }));
    };

    const RenderComment = ({comment, level = 0}) => {
        const sender = getDataById(employeeList, comment.commentBy);
        const parentId = comment?.parentId || null;
        const displayName = sender?.fullName || "";
        const profilePhoto = sender?.profilePhoto || "";
        const initials = getTwoCharacterFromName(displayName);

        const isFindLike = comment?.likes?.find(id => id === getLocalData(appKeys._id)) || false;
        const isFindDislike = comment?.dislikes?.find(id => id === getLocalData(appKeys._id)) || false;
        const isExpanded = expandedComments[comment._id] || false;

        return (
            <div style={{position: 'relative'}}>
                {level > 0 && (
                    <div
                        style={{
                            position: 'absolute',
                            left: (level - 1) * 40 + 15,
                            top: 0,
                            bottom: 0,
                            width: '2px',
                            backgroundColor: '#e0e0e0',
                            zIndex: 0,
                        }}
                    />
                )}
                <div style={{marginLeft: level * 40, position: 'relative', zIndex: 1}}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            marginBottom: '7px',
                            flexDirection: 'row',
                        }}
                    >
                        <div
                            style={{
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                backgroundColor: getDarkColor(initials),
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: 14,
                                color: '#fff',
                                margin: 5,
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
                        </div>
                        <div className="messageContainer" style={{flex: 1}}>
                            <div
                                style={{
                                    marginBottom: '4px',
                                    fontSize: '13px',
                                    fontWeight: '550',
                                    color: 'black',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                {displayName}
                                <span
                                    style={{
                                        marginLeft: '15px',
                                        fontSize: '11px',
                                        fontWeight: '450',
                                        color: '#4e4e4e',
                                    }}
                                >
                                    <MessageTime dateString={comment.commentTime}/>
                                </span>
                            </div>
                            {Array.isArray(comment.attachments) && comment.attachments.length > 0 && (
                                <div style={{marginTop: '5px'}}>
                                    <Image.PreviewGroup
                                        preview={{
                                            onChange: (current, prev) =>
                                                console.log(`current index: ${current}, prev index: ${prev}`),
                                        }}
                                    >
                                        {comment.attachments
                                            .filter((att) => att.attachmentType.startsWith('image'))
                                            .map((att, index) => (
                                                <Image
                                                    key={index}
                                                    src={att.url}
                                                    style={{
                                                        marginRight: 8,
                                                        marginBottom: 8,
                                                        maxWidth: '150px',
                                                    }}
                                                />
                                            ))}
                                    </Image.PreviewGroup>
                                </div>
                            )}
                            <div
                                dangerouslySetInnerHTML={{__html: comment.comment}}
                                style={{marginBottom: '4px'}}
                            />
                            <div className="commentManageRow">
                                <div className="commentLikeManageRow">
                                    <div className="commentBtn"
                                         onClick={() => handleLikeDisLikeComment(comment._id, 'like')}>
                                        <LikeFilled
                                            style={{color: isFindLike ? appColor.secondPrimary : appColor.secondary}}/>
                                        <div>{comment.likes?.length || 0}</div>
                                    </div>
                                    <div className="commentBtn"
                                         onClick={() => handleLikeDisLikeComment(comment._id, 'dislike')}>
                                        <DislikeFilled
                                            style={{color: isFindDislike ? appColor.secondPrimary : appColor.secondary}}/>
                                        <div>{comment.dislikes?.level || 0}</div>
                                    </div>
                                </div>
                                {!parentId && (
                                    <>
                                        <div
                                            className="commentBtn"
                                            onClick={() => {
                                                const commentReplyId = comment.tempId || comment._id;
                                                // setActiveReplyId(commentReplyId);
                                                if (commentReplyId !== activeReplyId) {
                                                    setActiveReplyId(commentReplyId);
                                                } else {
                                                    setActiveReplyId(null);
                                                }
                                            }}
                                        >
                                            <MessageFilled style={{color: appColor.secondary}}/>
                                            <div>Reply</div>
                                        </div>
                                        {comment.children && comment.children.length > 0 && (
                                            <div
                                                className="commentBtn"
                                                onClick={() => toggleExpand(comment._id)}
                                                style={{marginLeft: 10}}
                                            >
                                                {isExpanded ? <UpOutlined/> : <DownOutlined/>}
                                                <div>{isExpanded ? 'Hide Replies' : `Show ${comment.children.length} Replies`}</div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {activeReplyId === (comment.tempId || comment._id) && (
                        <div style={{marginLeft: (level + 1) * 40, marginTop: 8, marginBottom: 10}}>
                            <RichTextEditor customEnabledFunctions={editorDisabledFunction} onContentChange={async (content) => {
                                await handleSendComment(content, comment._id);
                                setActiveReplyId(null);
                            }}/>
                        </div>
                    )}
                    {comment.children && comment.children.length > 0 && isExpanded && (
                        <div>
                            {comment.children.map((child) => (
                                <RenderComment key={child._id} comment={child} level={level + 1}/>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Card
            title={(
                <div className="flex items-center gap-2">
                    <MessageCircle color={appColor.info}/>
                    <div>{appString.comments}</div>
                    <Badge style={{ fontSize: 12 }} count={comments.length} />
                </div>
            )}>
            <div className="p-4">
                <div>
                    <RichTextEditor customEnabledFunctions={editorDisabledFunction} onContentChange={handleSendComment}/>
                    {comments.length > 0 ? (
                        <div>
                            <div
                                ref={scrollContainerRef}
                                style={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                {Object.entries(groupedVisibleMessages).reverse().map(([dateLabel, msgs]) => (
                                    <div key={dateLabel}>
                                        <Divider
                                            style={{
                                                fontSize: '13px',
                                                fontWeight: '550',
                                                color: 'black',
                                                borderColor: '#cfcfcf',
                                            }}
                                        >
                                            {dateLabel}
                                        </Divider>
                                        {msgs.reverse().map((comment) => (
                                            <RenderComment key={comment._id} comment={comment}/>
                                        ))}
                                    </div>
                                ))}

                                {comments.length > 5 ? <Button icon={!showAllComments && comments.length > 5 ? <ArrowDown /> : <ArrowUp />} type="link" onClick={() => setShowAllComments(!showAllComments)}>
                                    {!showAllComments && comments.length > 5 ? 'Show more' : 'Show less'}
                                </Button> : null}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </Card>
    );
};

const MessageTime = ({dateString}) => {

    const [formattedTime, setFormattedTime] = useState(formatMessageTimeReal(dateString));

    useEffect(() => {
        const interval = setInterval(() => {
            setFormattedTime(formatMessageTimeReal(dateString));
        }, 10000);

        return () => clearInterval(interval);
    }, [dateString]);

    return <div>{formattedTime}</div>;
};