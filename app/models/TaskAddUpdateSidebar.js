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
import appColor, {getDarkColor} from "../utils/appColor";

import appKeys from "../utils/appKeys";
import appString from "../utils/appString";
import {getLocalData, isAdmin} from "../dataStorage/DataPref";
import {endpoints} from "../api/apiEndpoints";
import apiCall, {HttpMethod} from "../api/apiServiceProvider";
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
} from "../utils/enum";
import dayjs from "dayjs";
import {
    formatMessageTime,
    formatMessageTimeReal,
    getDataById,
    getTwoCharacterFromName,
    profilePhotoManager
} from "../utils/utils";
// import Editor from "../components/Editor";
import {AppDataFields, useAppData} from "../masterData/AppDataContext";
import {useRouter} from "next/navigation";
import pageRoutes from "../utils/pageRoutes";
import {ArrowDown, ArrowUp, Box, Delete, FileText, MessageCircle, Trash, Users} from "../utils/icons";
import {UserSelect} from "../components/CommonComponents";
import RichTextEditor from "../components/editor/RichTextEditor";
import {CommentSection} from "../(page)/home/tasks/CommentSection";

const {Option} = Select;
const {TextArea} = Input;

const taskTabList = {
    details: 'details',
    history: 'history',
}

export default function TaskAddUpdateSidebar({
                                                 isModelOpen,
                                                 setIsModelOpen,
                                                 employeeList,
                                                 taskData,
                                                 projectData,
                                                 clientRecord,
                                                 isEditing,
                                                 setIsEditing,
                                                 onSuccessCallback,
                                             }) {

    const [internalOpen, setInternalOpen] = useState(false);
    const [taskDataValue, setTaskDataValue] = useState(taskData);
    const [selectedTab, setSelectedTab] = useState(taskTabList.details);

    useEffect(() => {
        if (isModelOpen) {
            setInternalOpen(true);
        } else {
            const timer = setTimeout(() => {
                setInternalOpen(false);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [isModelOpen]);

    const router = useRouter();

    const loginUserData = getDataById(employeeList, getLocalData(appKeys._id));

    const parseDate = (dateString) => {
        if (!dateString) return null;

        const customParsed = dayjs(dateString, "DD-MM-YYYY hh:mm:ss A", true);
        if (customParsed.isValid()) return customParsed;

        const isoParsed = dayjs(dateString);
        if (isoParsed.isValid()) return isoParsed;

        return null;
    };

    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [form] = Form.useForm();
    const containerRef = useRef(null);

    const [selectedClient, setSelectedClient] = useState(null);
    const [filteredProjects, setFilteredProjects] = useState([]);

    useEffect(() => {
        if (taskDataValue[appKeys.clientName]) {
            const clientDetail = getDataById(clientRecord, taskDataValue[appKeys.clientName]);
            setSelectedClient(clientDetail ? clientDetail._id : null);
            const projects = clientDetail ? clientDetail.projects : [];
            setFilteredProjects(projects);
        }
    }, []);

    const defaultTaskValues = {
        [appKeys.projectName]: taskDataValue[appKeys.projectName] ? getDataById(projectData, taskDataValue[appKeys.projectName])?._id : undefined,
        [appKeys.taskTitle]: taskDataValue[appKeys.taskTitle] || "",
        [appKeys.taskDescription]: taskDataValue[appKeys.taskDescription] || "",
        [appKeys.taskStatus]: taskDataValue[appKeys.taskStatus] || getKeyByLabel(taskColumnLabel.ToDo, taskColumnStatusLabel),
        [appKeys.taskPriority]: taskDataValue[appKeys.taskPriority] || taskPriorityLabel[0].key,
        [appKeys.taskCategory]: taskDataValue[appKeys.taskCategory] || "development",
        [appKeys.taskAssignee]: taskDataValue[appKeys.taskAssignee] ? taskDataValue[appKeys.taskAssignee] : [{userId: loginUserData._id}],
        [appKeys.taskLabels]: taskDataValue[appKeys.taskLabels] || "toDo",
        [appKeys.taskStartDate]: parseDate(taskDataValue[appKeys.taskStartDate]),
        [appKeys.taskEndDate]: parseDate(taskDataValue[appKeys.taskEndDate]),
        [appKeys.comments]: taskDataValue[appKeys.comments] || [],
        [appKeys.taskEstimatedTime]: taskDataValue[appKeys.taskEstimatedTime] || null,
        [appKeys.taskAttachments]: taskDataValue[appKeys.taskAttachments] || [],
        [appKeys.clientName]: taskDataValue[appKeys.clientName] ? getDataById(clientRecord, taskDataValue[appKeys.clientName])?._id : null,
        [appKeys.taskAddedBy]: taskDataValue[appKeys.taskAddedBy] || getLocalData(appKeys._id),
        "createdAt": taskDataValue["createdAt"] || null,
    };

    const [tasksValues, setTasksValues] = useState(defaultTaskValues);

    useEffect(() => {
        if (selectedClient) {
            const clientDetail = getDataById(clientRecord, selectedClient);
            if (clientDetail) {
                const projects = clientDetail ? clientDetail.projects : [];
                setFilteredProjects(projects);
            }
        }
    }, [selectedClient]);

    useEffect(() => {
        if (isEditing) {
            form.setFieldsValue(tasksValues);

            const taskAttachmentsLive = taskDataValue[appKeys.taskAttachments]?.map((attachment, index) => ({
                uid: `${Date.now()}_${index}`,
                name: attachment.url?.split('/').pop() || 'file.png',
                url: attachment.url,
            })) || [];

            // setFileList(taskAttachmentsLive);

            setTasksValues((prev) => ({
                ...prev,
                [appKeys.taskAttachments]: taskAttachmentsLive,
            }));
            setSelectedClient(taskDataValue[appKeys.clientName]);

        }
    }, []);

    const resetTaskValues = () => {
        setTasksValues(defaultTaskValues);
        form.resetFields();
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    };

    const handleEditCancel = () => {
        setIsModelOpen(false);
        setIsEditing(false);
        router.push(pageRoutes.tasks);
        resetTaskValues();
    };

    const handleFieldChange = (changedValues, allValues) => {
        form.setFieldsValue(allValues);
        if (isEditing) {
            setTasksValues((prev) => ({
                ...prev,
                [appKeys.clientName]: allValues[appKeys.clientName],
                [appKeys.projectName]: allValues[appKeys.projectName],
                [appKeys.taskTitle]: allValues[appKeys.taskTitle],
                [appKeys.taskDescription]: allValues[appKeys.taskDescription],
            }));
        } else {
            setTasksValues((prev) => ({
                ...prev,
                [appKeys.clientName]: allValues[appKeys.clientName],
                [appKeys.projectName]: allValues[appKeys.projectName],
                [appKeys.taskTitle]: allValues[appKeys.taskTitle],
                [appKeys.taskDescription]: allValues[appKeys.taskDescription],
                [appKeys.taskAddedBy]: getLocalData(appKeys._id),
            }));
        }
    };

    const handleSelectUser = (user) => {
        if (!tasksValues.taskAssignee.some((u) => u.userId.toString() === user._id)) {
            setTasksValues((prev) => ({
                ...prev,
                taskAssignee: [
                    ...prev.taskAssignee,
                    {
                        userId: user._id,
                    },
                ],
            }));
        }
    };

    const handleRemoveUser = (userId) => {
        setTasksValues((prev) => ({
            ...prev,
            taskAssignee: prev.taskAssignee.filter((user) => user.userId !== userId),
        }));
    };

    const menu = {
        items: employeeList.map((user) => ({
            key: user._id,
            label: (
                <div
                    onClick={() => handleSelectUser(user)}
                    style={{display: "flex", alignItems: "center", gap: "10px"}}
                >
                    <Avatar src={profilePhotoManager({url: user.profilePhoto, gender: user.gender})} size="small"/>
                    {user.fullName}
                </div>
            ),
        })),
    };

    const handleAddUpdateTaskApi = async () => {
        try {
            // await form.validateFields([
            //     appKeys.clientName,
            //     appKeys.taskTitle,
            //     appKeys.taskDescription,
            //     appKeys.taskStartDate,
            //     appKeys.taskEndDate,
            // ]);

            // let uploadedAttachments = [];

            // if (newFileList.length > 0) {
            //
            //     const formData = new FormData();
            //     newFileList.forEach((file) => {
            //         formData.append("taskAttachment", file);
            //     });
            //
            //     await apiCall({
            //         method: HttpMethod.POST,
            //         url: endpoints.uploadFiles,
            //         data: formData,
            //         isMultipart: true,
            //         setIsLoading: setIsLoading,
            //         successCallback: (data) => {
            //             if (data.data) {
            //                 uploadedAttachments = data.data;
            //             }
            //         },
            //     });
            // }

            // const existingAttachments = tasksValues[appKeys.taskAttachments] || [];
            // const allAttachments = [...existingAttachments, ...uploadedAttachments];


            const finalTaskData = {
                ...tasksValues,
                [appKeys.projectName]: tasksValues[appKeys.projectName] || "",
                // [appKeys.taskAttachments]: allAttachments,
            };

            await apiCall({
                method: HttpMethod.POST,
                url: !isEditing
                    ? endpoints.updateTask
                    : `${endpoints.updateTask}/${taskDataValue["_id"]}`,
                data: finalTaskData,
                setIsLoading: setIsLoading,
                successCallback: (data) => {
                    handleEditCancel();
                    onSuccessCallback(data);
                },
            });
        } catch (error) {
            console.error("Form validation or API failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTaskApi = async () => {
        await apiCall({
            method: HttpMethod.DELETE,
            url: `${endpoints.deleteTask}${taskDataValue._id}`,
            setIsLoading: setIsDeleteLoading,
            successCallback: (data) => {
                handleEditCancel();
                onSuccessCallback(data);
            },
        });
    };

    const taskDetailTabUi = () => {
        return (
            <Form
                form={form}
                layout="vertical"
                onValuesChange={handleFieldChange}
            >
                <>
                    <div className="flex flex-col gap-5 py-3">
                        <Card
                            title={(
                                <div className="flex items-center gap-2">
                                    <FileText color={appColor.secondPrimary}/>
                                    <div>{appString.basicInfo}</div>
                                </div>
                            )}>
                            <div className="pt-4 px-4">
                                <Row gutter={16}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name={appKeys.clientName} label={appString.clientName}
                                                   span={12} rules={[
                                            {
                                                required: true,
                                                message: "Client Selection Required"
                                            }
                                        ]}>
                                            <Select
                                                placeholder="Select Client"
                                                allowClear
                                                showSearch
                                                options={clientRecord.map(client => ({
                                                    label: client.clientName,
                                                    value: client._id
                                                }))}
                                                filterOption={(input, option) =>
                                                    option.label?.toLowerCase().includes(input.toLowerCase())
                                                }
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name={appKeys.projectName} label={appString.projectName}
                                                   style={{marginBottom: 0}}>
                                            <Select
                                                placeholder="Select Project"
                                                disabled={!selectedClient}
                                                style={{height: '40px'}}
                                                showSearch
                                                filterOption={(input, option) =>
                                                    option.children.toLowerCase().includes(input.toLowerCase())
                                                }
                                            >
                                                {filteredProjects.map(project => (
                                                    <Option key={project._id} value={project._id}>
                                                        {project.projectName}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item name={appKeys.taskTitle} label={appString.taskTitle}>
                                            <Input
                                                placeholder={`Enter ${appString.taskTitle.toLowerCase()}`}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item name={appKeys.taskDescription}
                                                   label={appString.taskDescription}>
                                            <TextArea
                                                autoSize={{minRows: 2, maxRows: 3}}
                                                placeholder={`Enter ${appString.taskDescription.toLowerCase()}`}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        </Card>
                        <CommentSection tasksData={taskDataValue} employeeList={employeeList} span={24}/>
                        <Card
                            title={(
                                <div className="flex items-center gap-2">
                                    <Box color={appColor.danger}/>
                                    <div>{appString.taskInfo}</div>
                                </div>
                            )}>
                            <div className="pt-4 px-4">
                                <Row gutter={16}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name={appKeys.taskStatus} label={appString.taskStatus}>
                                            <Select options={taskColumnStatusLabel}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name={appKeys.taskPriority} label={appString.taskPriority}>
                                            <Select
                                                placeholder="Select Priority"
                                                options={taskPriorityLabel.map((item) => ({
                                                    label: (
                                                        <div className="flex items-center gap-1 text-[14px]">
                                                            {item.icon}
                                                            {item.label}
                                                        </div>
                                                    ),
                                                    value: item.value,
                                                }))}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item name={appKeys.taskStartDate} label={appString.taskStartDate}>
                                            <DatePicker
                                                placeholder={appString.taskStartDate}
                                                style={{width: '100%'}}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item name={appKeys.taskEndDate} label={appString.taskEndDate}>
                                            <DatePicker
                                                placeholder={appString.taskEndDate}
                                                style={{width: '100%'}}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name={appKeys.taskCategory} label={appString.taskCategory}>
                                            <Select showSearch options={taskCategoryLabel}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item name={appKeys.taskAssignee} label={appString.taskAssignee}>
                                            <UserSelect users={employeeList}
                                                        placeholder={`Select ${appString.taskAssignee.toLowerCase()}`}
                                                        isMultiple={true}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <div
                                            className="text-[12px] font-medium">{dayjs(tasksValues["createdAt"]).format("DD, MMM YYYY [at] hh:mm A")}</div>
                                    </Col>
                                </Row>
                            </div>
                        </Card>
                    </div>
                </>
            </Form>
        );
    }

    const historyTabUi = () => {
        return (
            <TaskHistory taskHistory={taskDataValue.taskHistory} employeeList={employeeList}/>
        );
    }

    const taskTabItems = [
        {
            key: taskTabList.details,
            label: '📋 Details',
        },
        ...(isAdmin()
            ? [
                {
                    key: taskTabList.history,
                    label: '🕓 History',
                },
            ]
            : []),
    ];

    return (
        <Drawer
            title="Manage Task"
            placement="right"
            onClose={handleEditCancel}
            onCancel={handleEditCancel}
            open={internalOpen}
            maskClosable={false}
            mask={false}
            width={700}
            styles={{
                body: {
                    height: "100%",
                    overflow: "hidden",
                    padding: `${taskTabItems.length > 1 ? '0' : '10px'} 20px 15px 20px`,
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}
        >
            <div className="h-full flex flex-col">
                {taskTabItems.length > 1 && <Tabs
                    defaultActiveKey={taskTabList.details}
                    items={taskTabItems}
                    onChange={setSelectedTab}
                />}
                <div
                    ref={containerRef}
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        scrollbarWidth: "none",
                    }}>
                    {taskTabList.details === selectedTab && taskDetailTabUi()}
                    {taskTabList.history === selectedTab && historyTabUi()}
                </div>
                <div className="flex justify-between items-center gap-3 mt-3">
                    {isEditing && isAdmin() && (
                        <Tooltip title="Delete Task">
                            <Popconfirm
                                title={appString.deleteConfirmation}
                                onConfirm={handleDeleteTaskApi}
                                style={{margin: "0"}}
                            >
                                <Button icon={<Trash />} color="danger" variant="solid" loading={isDeleteLoading}>
                                    Delete
                                </Button>
                            </Popconfirm>
                        </Tooltip>
                    )}
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px"}}>
                        <Button color="default" variant="outlined" onClick={handleEditCancel}>
                            Cancel
                        </Button>
                        <Button color="primary" variant="solid" onClick={handleAddUpdateTaskApi} loading={isLoading}>
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </Drawer>

    );
}

const formatDate = (date) => {
    return dayjs(date).format('DD-MM-YYYY HH:mm:ss');
};

const stageWiseColor = (stage) => {
    switch (stage) {
        case taskColumnLabel.ToDo:
            return appColor.primary;
        case taskColumnLabel.InProgress:
            return appColor.info;
        case taskColumnLabel.Testing:
            return appColor.warning;
        case taskColumnLabel.OnHold:
            return appColor.secondary;
        case taskColumnLabel.Completed:
            return appColor.success;
        case taskColumnLabel.Reopened:
            return appColor.danger;
        default:
            return "#FFFFFF";
    }
};

const priorityWiseColor = (priorityKey) => {
    const priority = taskPriorityLabel.find((p) => p.value === priorityKey);
    return priority ? priority.color : "#FFFFFF";
};

const TaskHistory = ({taskHistory, employeeList}) => {
    const groupedHistory = [];

    taskHistory.forEach((historyItem, index) => {
        if (index === 0 || historyItem.changedBy !== taskHistory[index - 1].changedBy) {
            groupedHistory.push({
                user: getDataById(employeeList, historyItem.changedBy),
                changes: [historyItem],
            });
        } else {
            groupedHistory[groupedHistory.length - 1].changes.push(historyItem);
        }
    });

    return (
        <div style={{ overflow: "hidden" }}>
            {groupedHistory.length > 0 ? groupedHistory.map((group, index) => {
                return (
                    <div key={index} style={{overflow: "hidden"}}>
                        {group.user ? <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                            {
                                group.user.profilePhoto ? <Avatar size="default" src={group.user.profilePhoto}/> :
                                    <Avatar size="default" style={{
                                        backgroundColor: appColor.primary,
                                        color: appColor.white
                                    }}>{getTwoCharacterFromName(group.user.fullName)}</Avatar>
                            }
                            <div className="text-[14px] text-gray-900">
                                <strong>{group.user.fullName}</strong> made {group.changes.length} changes<br/>{}</div>
                        </div> : null}
                        <div style={{ margin: "10px 10px 10px 42px" }}>
                            {group.changes.map((change, i) => {

                                if (change.fieldName === appKeys.taskTitle) {
                                    return (
                                        <div>
                                            <div className="text-[13px] text-gray-600 my-2 flex gap-2" key={i}>
                                                <strong>Title: </strong>
                                                <span className="d-inline">
                        Change from "<em>{change.oldValue}</em>" to "<em>{change.newValue}</em>"
                      </span>
                                            </div>
                                            <div className="text-[13px] pb-2 border-b-1 border-gray-300">
                                                at {formatDate(change.changeTime)}
                                            </div>
                                        </div>
                                    );
                                }

                                if (change.fieldName === appKeys.taskDescription) {
                                    return (
                                        <div>
                                            <div className="text-[13px] text-gray-600 my-2 flex gap-2" key={i}>
                                                <strong>Description: </strong>
                                                <span className="d-inline">
                        Change from "<em>{change.oldValue}</em>" to "<em>{change.newValue}</em>"
                      </span>
                                            </div>
                                            <div className="text-[13px] pb-2 border-b-1 border-gray-300">
                                                at {formatDate(change.changeTime)}
                                            </div>
                                        </div>
                                    );
                                }

                                if (change.fieldName === appKeys.taskStartDate) {
                                    return (
                                        <div>
                                            <div className="text-[13px] text-gray-600 my-2 flex gap-2" key={i}>
                                                <strong>Start Date: </strong>
                                                <span className="d-inline">
                        Change from "<em>{change.oldValue}</em>" to "<em>{change.newValue}</em>"
                      </span>
                                            </div>
                                            <div className="text-[13px] pb-2 border-b-1 border-gray-300">
                                                at {formatDate(change.changeTime)}
                                            </div>
                                        </div>
                                    );
                                }

                                if (change.fieldName === appKeys.taskEndDate) {
                                    return (
                                        <div>
                                            <div className="text-[13px] text-gray-600 my-2 flex gap-2" key={i}>
                                                <strong>End Date: </strong>
                                                <span className="d-inline">
                        Change from "<em>{change.oldValue}</em>" to "<em>{change.newValue}</em>"
                      </span>
                                            </div>
                                            <div className="text-[13px] pb-2 border-b-1 border-gray-300">
                                                at {formatDate(change.changeTime)}
                                            </div>
                                        </div>
                                    );
                                }

                                if (change.fieldName === appKeys.taskEstimatedTime) {
                                    return (
                                        <div>
                                            <div className="text-[13px] text-gray-600 my-2 flex gap-2" key={i}>
                                                <strong>Estimated Time: </strong>
                                                <span className="d-inline">
                        Change from "<em>{change.oldValue}</em>" to "<em>{change.newValue}</em>"
                      </span>
                                            </div>
                                            <div className="text-[13px] pb-2 border-b-1 border-gray-300">
                                                at {formatDate(change.changeTime)}
                                            </div>
                                        </div>
                                    );
                                }

                                if (change.fieldName === appKeys.taskStatus) {
                                    const oldLabel = getLabelByKey(change.oldValue, taskColumnStatusLabel);
                                    const newLabel = getLabelByKey(change.newValue, taskColumnStatusLabel);
                                    const oldLabelColor = `${stageWiseColor(oldLabel)}`;
                                    const newLabelColor = `${stageWiseColor(newLabel)}`;

                                    return (
                                        <div>
                                            <div className="text-[13px] text-gray-600 my-2 flex gap-2" key={i}><strong>Status: </strong>
                                                <Tag style={{
                                                    backgroundColor: `${oldLabelColor}20`,
                                                    color: oldLabelColor,
                                                    fontSize: "12px"
                                                }}>{oldLabel}</Tag>
                                                <div style={{marginRight: "10px"}}>→</div>
                                                <Tag style={{
                                                    backgroundColor: `${newLabelColor}20`,
                                                    color: newLabelColor,
                                                    fontSize: "12px"
                                                }}>{newLabel}</Tag>
                                            </div>
                                            <div className="text-[13px] pb-2 border-b-1 border-gray-300">
                                                Changed at {formatDate(change.changeTime)}
                                            </div>
                                        </div>
                                    );
                                }

                                if (change.fieldName === appKeys.taskCategory) {
                                    const oldLabel = getLabelByKey(change.oldValue, taskCategoryLabel);
                                    const newLabel = getLabelByKey(change.newValue, taskCategoryLabel);

                                    return (
                                        <div>
                                            <div className="text-[13px] text-gray-600 my-2 flex gap-2" key={i}><strong>Category: </strong>
                                                <Tag style={{
                                                    backgroundColor: `${appColor.danger}20`,
                                                    color: appColor.danger,
                                                    fontSize: "12px"
                                                }}>{oldLabel}</Tag>
                                                <div style={{marginRight: "10px"}}>→</div>
                                                <Tag style={{
                                                    backgroundColor: `${appColor.success}20`,
                                                    color: appColor.success,
                                                    fontSize: "12px"
                                                }}>{newLabel}</Tag>
                                            </div>
                                            <div className="text-[13px] pb-2 border-b-1 border-gray-300">
                                                Changed at {formatDate(change.changeTime)}
                                            </div>
                                        </div>
                                    );
                                }

                                if (change.fieldName === appKeys.taskPriority) {
                                    const oldLabelIcon = getIconByKey(change.oldValue, taskPriorityLabel);
                                    const newLabelIcon = getIconByKey(change.newValue, taskPriorityLabel);
                                    const oldLabel = getLabelByKey(change.oldValue, taskPriorityLabel);
                                    const newLabel = getLabelByKey(change.newValue, taskPriorityLabel);
                                    const oldLabelColor = priorityWiseColor(change.oldValue);
                                    const newLabelColor = priorityWiseColor(change.newValue);

                                    return (
                                        <div>
                                            <div className="text-[13px] text-gray-600 my-2 flex gap-2" key={i}><strong>Priority: </strong>
                                                <Tag style={{
                                                    backgroundColor: `${oldLabelColor}20`,
                                                    color: oldLabelColor,
                                                    fontSize: "12px"
                                                }}><div className="flex items-center gap-2 py-1">{oldLabelIcon}{oldLabel}</div></Tag>
                                                <div style={{marginRight: "10px"}}>→</div>
                                                <Tag style={{
                                                    backgroundColor: `${newLabelColor}20`,
                                                    color: newLabelColor,
                                                    fontSize: "12px"
                                                }}><div className="flex items-center gap-2 py-1">{newLabelIcon}{newLabel}</div></Tag>
                                            </div>
                                            <div className="text-[13px] pb-2 border-b-1 border-gray-300">
                                                Changed at {formatDate(change.changeTime)}
                                            </div>
                                        </div>
                                    );
                                }

                                if (change.fieldName === appKeys.taskLabels) {
                                    const oldLabel = getLabelByKey(change.oldValue, taskStatusLabel);
                                    const newLabel = getLabelByKey(change.newValue, taskStatusLabel);

                                    return (
                                        <div>
                                            <div className="text-[13px] text-gray-600 my-2 flex gap-2" key={i}><strong>Label: </strong>
                                                <Tag style={{
                                                    backgroundColor: `${appColor.danger}20`,
                                                    color: appColor.danger,
                                                    fontSize: "12px"
                                                }}>{oldLabel}</Tag>
                                                <div style={{marginRight: "10px"}}>→</div>
                                                <Tag style={{
                                                    backgroundColor: `${appColor.success}20`,
                                                    color: appColor.success,
                                                    fontSize: "12px"
                                                }}>{newLabel}</Tag>
                                            </div>
                                            <div className="text-[13px] pb-2 border-b-1 border-gray-300">
                                                Changed at {formatDate(change.changeTime)}
                                            </div>
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    </div>
                );
            }) : <Empty/>}
        </div>
    );
};