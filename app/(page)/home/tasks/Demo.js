'use client';

import React, {useEffect, useRef, useState} from "react";
import {DragDropContext, Draggable, Droppable} from "@hello-pangea/dnd";
import {
    Calendar,
    Check,
    ChevronsUp,
    Copy,
    Filter,
    Plus,
    Search,
    ShoppingCart,
    Tag as TagIcon,
    User
} from "../../../utils/icons";
import {Avatar, Button, Col, DatePicker, Divider, Empty, Popover, Row, Select, Spin, Tooltip} from "antd";
import {
    getIconByKey,
    getKeyByLabel,
    getLabelByKey,
    taskCategoryLabel,
    taskColumnLabel,
    taskColumnStatusLabel,
    taskPriorityLabel,
    taskStatusLabel
} from "../../../utils/enum";
import dayjs from "dayjs";

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import appColor from "../../../utils/appColor";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints";
import {AppDataFields, useAppData} from "../../../masterData/AppDataContext";
import {getDataById, getTwoCharacterFromName} from "../../../utils/utils";
import appKeys from "../../../utils/appKeys";
import {showToast} from "../../../components/CommonComponents";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const {Option} = Select;
const {RangePicker} = DatePicker;

export default function Page() {
    const {
        activeUsersData,
        activeClientData,
        activeProjectData,
        taskBoardData,
        loginUserData,
        updateAppDataField
    } = useAppData();

    // const {taskId} = useParams();
    const taskId = null;

    const [originalTasksByStatus, setOriginalTasksByStatus] = useState([]);
    const [tasksByStatus, setTasksByStatus] = useState([]);
    const [isAddTaskModelOpen, setAddTaskModelOpen] = useState(false);
    const [isShowFilterPopup, setIsShowFilterPopup] = useState(false);
    const [isTaskEditing, setIsTaskEditing] = useState(false);
    const [selectedTaskRecord, setSelectedTastRecord] = useState({});

    const [listHeight, setListHeight] = useState(0);
    const taskBoardContainerRef = useRef(null);

    const [filteredProjects, setFilteredProjects] = useState([]);
    const [activeFilterCount, setActiveFilterCount] = useState(0);

    const [loading, setLoading] = useState(true);

    const initialFilters = {
        client: null,
        project: null,
        status: null,
        employee: null,
        dateRange: null,
        priority: null,
        category: null,
        createdAt: null,
        label: null,
    };

    const [filters, setFilters] = useState(initialFilters);

    const getTaskById = (taskId) => {
        for (const statusKey in taskBoardData) {
            const tasksInStatus = taskBoardData[statusKey];
            const task = tasksInStatus.find(task => task.taskId === taskId);
            if (task) {
                return task;
            }
        }
        return null;
    };

    useEffect(() => {
        if (taskId) {
            const taskRecord = getTaskById(taskId);
            if (taskRecord) {
                setAddTaskModelOpen(true);
                setIsShowFilterPopup(false);
                setIsTaskEditing(true);
                setSelectedTastRecord(taskRecord);
            }
        }
    }, [taskId]);

    const handleResize = () => {
        if (taskBoardContainerRef.current) {
            const containerHeight = taskBoardContainerRef.current.offsetHeight;
            setListHeight(containerHeight - 50);
        }
    };

    useEffect(() => {
        const evtSource = new EventSource(`${endpoints.tasksChange}userId=${localStorage.getItem(appKeys._id)}&role=${localStorage.getItem(appKeys.role)}`);

        evtSource.onmessage = (event) => {
            if(event.data) {
                // console.log('Notification:', JSON.parse(event.data));
                updateAppDataField(AppDataFields.taskBoardData, JSON.parse(event.data) || taskBoardData);
                const taskRecord = getTaskById(taskId);
                setSelectedTastRecord({ ...taskRecord });
            }
        };

        evtSource.addEventListener('end', () => {
            console.log('Stream ended');
            evtSource.close();
        });

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        handleResize();
        window.addEventListener("resize", handleResize);
    }, [loading]);

    useEffect(() => {
        if (filters.client) {
            handleFilterChange('project', null);
            setFilteredProjects([]);
            const clientDetail = getDataById(activeClientData, filters.client);
            if (clientDetail) {
                filterTasks();
                const projects = clientDetail ? clientDetail.projects : [];
                setFilteredProjects(projects);
            }
        } else {
            handleFilterChange('client', null);
            handleFilterChange('project', null);
            setFilteredProjects([]);
        }
    }, [filters.client]);

    useEffect(() => {
        if (filters.project) {
            filterTasks();
        }
    }, [filters.project]);

    useEffect(() => {
        const areAllFiltersNull = Object.values(filters).every(value => value === null);
        if (areAllFiltersNull) return;

        const count = Object.values(filters).filter(val => val !== null && val !== undefined).length;
        setActiveFilterCount(count);
        filterTasks();
    }, [filters]);

    const handleFilterChange = (filterType, value) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [filterType]: value,
        }));
    };

    const organizeTasksByStatus = (tasks) => {
        return {
            columns: taskColumnStatusLabel.reduce((acc, {key, label}) => {
                const taskList = (tasks[key] || []).sort((a, b) => a.placementIndex - b.placementIndex);

                acc[key] = {
                    id: key,
                    title: label,
                    tasksList: taskList,
                };
                return acc;
            }, {}),
            items: {},
        };
    };

    useEffect(() => {
        handleDataConditionWise(taskBoardData);
        setOriginalTasksByStatus(organizeTasksByStatus(taskBoardData));
    }, [taskBoardData]);

    const handleDataConditionWise = (data) => {
        setTasksByStatus(organizeTasksByStatus(data));
    };

    const filterTasks = () => {
        if (!originalTasksByStatus) return;

        const filteredTasks = {};

        Object.entries(originalTasksByStatus.columns).forEach(([statusKey, column]) => {
            const filtered = column.tasksList.filter((task) => {
                let isMatch = true;

                if (filters.client && task.clientName !== filters.client) isMatch = false;
                if (filters.project && task.projectName !== filters.project) isMatch = false;
                if (filters.status && task.taskStatus !== filters.status) isMatch = false;
                if (filters.priority && task.taskPriority !== filters.priority) isMatch = false;
                if (filters.category && task.taskCategory !== filters.category) isMatch = false;
                if (filters.label && task.taskLabels !== filters.label) isMatch = false;

                if (
                    filters.employee &&
                    !task.taskAssignee.some(
                        (assignee) => assignee?.userId?.toString() === filters.employee?.toString()
                    )
                ) {
                    isMatch = false;
                }

                if (filters.createdAt) {
                    const selectedDate = dayjs(filters.createdAt).startOf("day");
                    const taskDate = dayjs(task.createdAt).startOf("day");
                    if (!taskDate.isSame(selectedDate, "day")) isMatch = false;
                }

                if (filters.dateRange) {
                    const [startDate, endDate] = filters.dateRange;
                    const startFilterDate = dayjs(startDate).startOf("day");
                    const endFilterDate = dayjs(endDate).endOf("day");

                    const rawStart = task.taskStartDate || task.createdAt;
                    const rawEnd =
                        task.taskEndDate || task.taskClosedTime?.slice(-1)[0]?.closedAt || rawStart;

                    const parse = (date) =>
                        date ? dayjs(date, "DD-MM-YYYY hh:mm:ss A", true) : null;

                    const taskStartDate = parse(rawStart);
                    const taskEndDate = parse(rawEnd);

                    const isOverlap =
                        taskStartDate &&
                        taskEndDate &&
                        taskStartDate.isSameOrBefore(endFilterDate, "day") &&
                        taskEndDate.isSameOrAfter(startFilterDate, "day");

                    if (!isOverlap) isMatch = false;
                }

                return isMatch;
            });

            filteredTasks[statusKey] = filtered;
        });

        setTasksByStatus(organizeTasksByStatus(filteredTasks));
    };

    const onDragEnd = (result) => {
        const {source, destination} = result;

        if (!destination) return;

        const sourceStage = source.droppableId;
        const destStage = destination.droppableId;

        // Clone current tasks object
        const updatedTasks = {...tasksByStatus};

        const sourceTasks = [...(updatedTasks.columns[sourceStage]?.tasksList || [])];
        const destTasks = [...(updatedTasks.columns[destStage]?.tasksList || [])];

        const [movedTask] = sourceTasks.splice(source.index, 1);

        // Move the task into the correct index in the destination
        if (sourceStage === destStage) {
            // Drop within same column at a different position
            sourceTasks.splice(destination.index, 0, movedTask);
            updatedTasks.columns[sourceStage].tasksList = sourceTasks;
            setTasksByStatus(updatedTasks);

            // 🔄 Reorder all tasks in this column
            const reorderedTasks = sourceTasks.map((task, index) => ({
                _id: task._id,
                placementIndex: index,
            }));

            // 🔥 Call backend to persist new order
            reorderTasksOnServer(reorderedTasks);
        } else {
            // Moved to another column
            destTasks.splice(destination.index, 0, movedTask);
            updatedTasks.columns[sourceStage].tasksList = sourceTasks;
            updatedTasks.columns[destStage].tasksList = destTasks;

            setTasksByStatus(updatedTasks);

            const reorderedTasks = destTasks.map((task, index) => ({
                _id: task._id,
                placementIndex: index,
                taskStatus: getKeyByLabel(destStage, taskColumnStatusLabel),
            }));

            // handleAddUpdateTaskApi(
            //     result.draggableId,
            //     getKeyByLabel(destStage, taskColumnStatusLabel),
            //     destination.index
            // );

            reorderTasksOnServer(reorderedTasks);
        }
    };

    const reorderTasksOnServer = async (reorderedTasks) => {
        try {
            await apiCall({
                method: HttpMethod.PATCH,
                url: endpoints.taskReorder,
                data: {updates: reorderedTasks},
                setIsLoading: false,
                showSuccessMessage: false,
                successCallback: () => {
                },
            });
        } catch (error) {
            console.error("API Call Failed:", error);
        }
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

    const handleTaskAddClick = () => {
        setAddTaskModelOpen(true);
        setIsShowFilterPopup(false);
        setSelectedTastRecord({});
    };

    const handleTaskOpenClick = (taskDetail) => {
        setAddTaskModelOpen(true);
        setIsShowFilterPopup(false);
        setIsTaskEditing(true);
        // navigate(`/tasks/${taskDetail.taskId}`);
        setSelectedTastRecord(taskDetail);
    };

    useEffect(() => {
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div style={{display: "flex", justifyContent: "center", alignItems: "center", marginTop: "200px", overflow: "hidden"}}>
                <Spin />
            </div>
        );
    }

    return (
        <>
            <div ref={taskBoardContainerRef}>
                <Row gutter={[16, 16]} style={{margin: "15px 0px"}}>
                    <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                        <SearchTextFieldNew
                            field={{
                                name: "search",
                                placeholder: "Search Data",
                                prefix: <Search/>,
                                onChange: (e) => {
                                    const searchText = e.target.value.toLowerCase();
                                    const filteredTasks = {};
                                    Object.entries(originalTasksByStatus.columns).forEach(([statusKey, column]) => {
                                        filteredTasks[statusKey] = column.tasksList.filter((task) => {
                                            return (
                                                task.taskTitle?.toLowerCase().includes(searchText) ||
                                                task.taskDescription?.toLowerCase().includes(searchText) ||
                                                task.taskId?.toLowerCase().includes(searchText)
                                            );
                                        });
                                    });
                                    setTasksByStatus(organizeTasksByStatus(filteredTasks));
                                },
                            }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                        <Select
                            placeholder="Select Client"
                            allowClear
                            style={{width: "100%", height: "38px"}}
                            showSearch
                            value={filters.client}
                            onChange={(value) => {
                                handleFilterChange('client', value);
                                if (!value) {
                                    handleDataConditionWise(taskBoardData);
                                }
                            }}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {activeClientData.map((client) => (
                                <Option key={client._id} value={client._id}>
                                    {client.clientName}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                        <Select
                            allowClear
                            placeholder="Select Project"
                            disabled={!filters.client}
                            value={filters.project}
                            onChange={(value) => {
                                handleFilterChange('project', value);
                                if (!value) {
                                    handleDataConditionWise(taskBoardData);
                                }
                            }}
                            style={{width: "100%", height: "40px"}}
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {filteredProjects.map((project) => (
                                <Option key={project._id} value={project._id}>
                                    {project.projectName}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={12} sm={6} md={6} lg={3} xl={3}>
                        <FilterPopover
                            employeeRecord={activeUsersData}
                            activeClientData={activeClientData}
                            isShowFilterPopup={isShowFilterPopup}
                            setIsShowFilterPopup={setIsShowFilterPopup}
                            activeFilterCount={activeFilterCount}
                            setActiveFilterCount={setActiveFilterCount}
                            filteredProjects={filteredProjects}
                            filters={filters}
                            handleFilterChange={handleFilterChange}
                            handleClearClick={() => {
                                setFilters(initialFilters);
                                // setIsShowFilterPopup(false);
                                handleDataConditionWise(taskBoardData);
                            }}
                            filterTasks={() => {
                                filterTasks();
                            }}
                        />
                    </Col>
                    <Col xs={12} sm={6} md={6} lg={3} xl={3}>
                        <div
                            className="addUpdateCommonBtn"
                            onClick={handleTaskAddClick}
                        >
                            <Plus/>
                            <div>Add Task</div>
                        </div>
                    </Col>
                </Row>
                <div className="h-screen overflow-x-auto">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div style={{display: 'flex', overflowX: 'auto', paddingRight: isAddTaskModelOpen ? 685 : 0}}>
                            {tasksByStatus.columns && Object.values(tasksByStatus.columns).map((column) => (
                                <Droppable droppableId={column.id} key={column.id}>
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            style={{
                                                borderTop: `5px solid ${stageWiseColor(column.title)}`,
                                                height: "100%",
                                            }}
                                            className="min-w-[250px] flex-1 h-full bg-blue-100 p-2 m-3 flex flex-col">
                                            <div
                                                className="text-[15px] font-medium text-black my-5 text-center">{`${column.title}(${column.tasksList.length})`}</div>
                                            <div
                                                style={{
                                                    overflowY: "auto",
                                                }}
                                            >
                                                <div style={{
                                                    // overflowY: "auto",
                                                    // height: "100%",
                                                    maxHeight: listHeight - 100,
                                                }}>
                                                    {column.tasksList.length === 0 ? (
                                                        <Empty />
                                                    ) : (
                                                        column.tasksList.map((task, index) => (
                                                            <Draggable key={task._id} draggableId={String(task._id)}
                                                                       index={index}>
                                                                {(provided, snapshot) => {
                                                                    const draggingClass = snapshot.isDragging ? 'dragging' : '';
                                                                    return (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            className={`task-card ${draggingClass} bg-white p-3 mt-5 cursor-grab`}
                                                                            // onClick={() => handleTaskOpenClick(task)}
                                                                        >
                                                                            <TaskCard task={task}
                                                                                      employeeRecord={activeUsersData}
                                                                                      projectData={activeProjectData}
                                                                                      handleTaskOpenClick={() => handleTaskOpenClick(task)}
                                                                            />
                                                                        </div>
                                                                    );
                                                                }}
                                                            </Draggable>
                                                        ))
                                                    )}
                                                </div>
                                                {provided.placeholder}
                                            </div>
                                        </div>
                                    )}
                                </Droppable>
                            ))}
                        </div>
                    </DragDropContext>
                </div>
            </div>
            {/*{*/}
            {/*    isAddTaskModelOpen ?*/}
            {/*        <TaskAddUpdateSidebar*/}
            {/*            isModelOpen={isAddTaskModelOpen}*/}
            {/*            setIsModelOpen={setAddTaskModelOpen}*/}
            {/*            employeeList={activeUsersData}*/}
            {/*            taskData={selectedTaskRecord}*/}
            {/*            projectData={activeProjectData}*/}
            {/*            clientRecord={activeClientData}*/}
            {/*            isEditing={isTaskEditing}*/}
            {/*            setIsEditing={setIsTaskEditing}*/}
            {/*            onSuccessCallback={(data) => {*/}
            {/*                handleDataConditionWise(data.data);*/}
            {/*            }}*/}
            {/*        /> : null*/}
            {/*}*/}

        </>
    );
};

const TaskCard = ({task, employeeRecord, projectData, handleTaskOpenClick}) => {

    const addedByUser = employeeRecord.find(emp => emp._id === task.taskAddedBy);

    let assignees = Array.isArray(task.taskAssignee) && task.taskAssignee.length > 0
        ? task.taskAssignee
            .filter(assignee => assignee && assignee.userId)
            .map(assignee =>
                employeeRecord.find(emp => emp._id === assignee.userId)
            )
            .filter(Boolean)
        : [];

    if (addedByUser && !assignees.some(emp => emp._id === addedByUser._id)) {
        assignees.push(addedByUser);
    }

    return (
        <div onClick={handleTaskOpenClick}>
            <div className="categoryAssigneeRow">
                <div className="taskCardId" onClick={(e) => {
                    e.stopPropagation();
                    const fullUrl = window.location.href;
                    navigator.clipboard.writeText(`${fullUrl}/${task.taskId}`);
                    showToast('success', 'Task URL Copied!')
                }}>{`#${task.taskId}`}<Copy className="taskCopyIconStyle"/></div>
                <Tooltip title={getLabelByKey(task.taskPriority, taskPriorityLabel)}>
                    <div className="taskCardStatus"
                         style={{cursor: "pointer"}}>{getIconByKey(task.taskPriority, taskPriorityLabel)}</div>
                </Tooltip>
            </div>
            <div>
                <div className="taskCardTitle">{task.taskTitle}</div>
                <div
                    className="taskCardProject">{task.projectName ? getDataById(projectData, task.projectName)?.projectName : ""}</div>
                <div className="categoryAssigneeRow">
                    <div className="taskCardCategory">
                        <span>{getLabelByKey(task.taskCategory, taskCategoryLabel)}</span>
                    </div>
                    <div>
                        <Avatar.Group max={{
                            count: 3,
                            style: { color: appColor.white, backgroundColor: appColor.primary, fontSize: "12px", fontWeight: "550" },
                        }} size={27}>
                            {assignees.map(user => (
                                <Tooltip key={user._id} title={user.fullName}>
                                    <Avatar
                                        src={user.profilePhoto || null}
                                        style={{
                                            backgroundColor: !user.profilePhoto ? getDarkColor(user.fullName) : undefined,
                                            color: appColor.white,
                                            cursor: 'pointer',
                                            fontSize: "12px"
                                        }}
                                    >
                                        {!user.profilePhoto && getTwoCharacterFromName(user.fullName)}
                                    </Avatar>
                                </Tooltip>
                            ))}
                        </Avatar.Group>
                    </div>
                </div>
                {
                    task.taskClosedTime && task.taskClosedTime.length > 0 ? (
                        <div className="startEndDate">
                            <strong>Last Closed
                                Time: </strong>{dayjs(task.taskClosedTime[task.taskClosedTime.length - 1].closedAt).format("DD-MM-YYYY HH:mm:ss A")}
                        </div>
                    ) : null
                }
            </div>
        </div>
    );
};

const FilterPopover = ({
                           employeeRecord,
                           activeClientData,
                           isShowFilterPopup,
                           setIsShowFilterPopup,
                           activeFilterCount,
                           setActiveFilterCount,
                           filteredProjects,
                           filters,
                           handleFilterChange,
                           handleClearClick,
                           filterTasks
                       }) => {

    // const [activeFilterCount, setActiveFilterCount] = useState(0);

    return (
        <Popover
            trigger="click"
            open={isShowFilterPopup}
            placement="bottom"
            onOpenChange={(newVisible) => {
                setIsShowFilterPopup(newVisible);
            }}
            content={
                <div>
                    <div style={{fontWeight: "500", marginBottom: "10px"}}>Filters</div>

                    <LabelContentRow label="Client:" icon={<Calendar size={18}/>}>
                        <Select
                            showSearch
                            value={filters.client}
                            placeholder="Select Client"
                            onChange={(value) => {
                                handleFilterChange('client', value);
                            }}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                            allowClear
                            style={{width: "100%", height: "37px"}}
                        >
                            {activeClientData.map(client => (
                                <Option key={client._id} value={client._id}>{client.clientName}</Option>
                            ))}
                        </Select>
                    </LabelContentRow>

                    <Divider style={{margin: "8px 0"}}/>

                    <LabelContentRow label="Project:" icon={<Calendar size={18}/>}>
                        <Select
                            showSearch
                            disabled={!filters.client}
                            value={filters.project}
                            placeholder="Select Project"
                            onChange={(value) => {
                                handleFilterChange('project', value);
                            }}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                            allowClear
                            style={{width: "100%", height: "37px"}}
                        >
                            {filteredProjects.map(project => (
                                <Option key={project._id} value={project._id}>
                                    {project.projectName}
                                </Option>
                            ))}
                        </Select>
                    </LabelContentRow>

                    <Divider style={{margin: "8px 0"}}/>

                    <LabelContentRow label="Date:" icon={<Calendar size={18}/>}>
                        <RangePicker value={filters.dateRange}
                                     onChange={(dates) => {
                                         handleFilterChange('dateRange', dates);
                                     }} size="small"
                                     style={{width: "100%", height: "37px"}}/>
                    </LabelContentRow>

                    <Divider style={{margin: "8px 0"}}/>

                    <LabelContentRow label="Status:" icon={<Check size={18}/>}>
                        <Select
                            size="small"
                            placeholder="Select status"
                            style={{width: "100%", height: 37}}
                            value={filters.status}
                            onChange={(value) => {
                                handleFilterChange('status', value);
                            }}
                            allowClear
                        >
                            {taskColumnStatusLabel.map((item) => (
                                <Option key={item.key} value={item.key}>
                                    {item.label}
                                </Option>
                            ))}
                        </Select>
                    </LabelContentRow>

                    <Divider style={{margin: "8px 0"}}/>

                    <LabelContentRow label="Priority:" icon={<ChevronsUp/>}>
                        <Select
                            size="small"
                            placeholder="Select Priority"
                            style={{width: "100%", height: 37, borderRadius: 10}}
                            value={filters.priority}
                            onChange={(value) => {
                                handleFilterChange('priority', value);
                            }}
                            allowClear
                        >
                            {taskPriorityLabel.map((item) => (
                                <Option key={item.key} value={item.key}>
                                    <div>{getIconByKey(item.key, taskPriorityLabel)}{getLabelByKey(item.key, taskPriorityLabel)}</div>
                                </Option>
                            ))}
                        </Select>
                    </LabelContentRow>

                    <Divider style={{margin: "8px 0"}}/>

                    <LabelContentRow label="To:" icon={<User size={18}/>}>
                        <Select
                            size="small"
                            placeholder="Select Employee"
                            value={filters.employee}
                            onChange={(value) => {
                                handleFilterChange('employee', value);
                            }}
                            style={{width: "100%", height: "37px"}}
                            optionLabelProp="label"
                            allowClear
                        >
                            {employeeRecord.map((emp, index) => {
                                return (
                                    <Option
                                        key={emp._id}
                                        value={emp._id}
                                        label={
                                            <span>
                      <Avatar
                          size="small"
                          src={emp.profilePhoto || null}
                          style={{marginRight: 8}}
                      >
                        {emp.fullName?.charAt(0)}
                      </Avatar>
                                                {emp.fullName}
                    </span>
                                        }
                                    >
                  <span style={{display: "flex", alignItems: "center"}}>
                    <Avatar
                        size="small"
                        src={emp.profilePhoto || null}
                        style={{marginRight: 8}}
                    >
                      {emp.fullName?.charAt(0)}
                    </Avatar>
                      {emp.fullName}
                  </span>
                                    </Option>
                                );
                            })}
                        </Select>
                    </LabelContentRow>

                    <Divider style={{margin: "8px 0"}}/>

                    <LabelContentRow label="Category:" icon={<ShoppingCart size={18}/>}>
                        <Select
                            size="small"
                            placeholder="Select Category"
                            style={{width: "100%", height: 37, borderRadius: 10}}
                            value={filters.category}
                            onChange={(value) => {
                                handleFilterChange('category', value);
                            }}
                            allowClear
                        >
                            {taskCategoryLabel.map((item) => (
                                <Option key={item.key} value={item.key}>
                                    <div>{getIconByKey(item.key, taskCategoryLabel)}{getLabelByKey(item.key, taskCategoryLabel)}</div>
                                </Option>
                            ))}
                        </Select>
                    </LabelContentRow>

                    <Divider style={{margin: "8px 0"}}/>

                    <LabelContentRow label="Label:" icon={<TagIcon size={18}/>}>
                        <Select
                            size="small"
                            placeholder="Select Label"
                            style={{width: "100%", height: 37, borderRadius: 10}}
                            value={filters.label}
                            onChange={(value) => {
                                handleFilterChange('label', value);
                            }}
                            allowClear
                        >
                            {taskStatusLabel.map((item) => (
                                <Option key={item.key} value={item.key}>
                                    <div>{getIconByKey(item.key, taskStatusLabel)}{getLabelByKey(item.key, taskStatusLabel)}</div>
                                </Option>
                            ))}
                        </Select>
                    </LabelContentRow>

                    <Divider style={{margin: "8px 0"}}/>

                    <LabelContentRow label="Created At:" icon={<Calendar size={18}/>}>
                        <DatePicker value={filters.createdAt}
                                    disabledDate={(current) => {
                                        return current && current > dayjs().endOf('day');
                                    }}
                                    onChange={(dates) => {
                                        handleFilterChange('createdAt', dates);
                                    }} size="small"
                                    style={{width: "100%", height: "37px"}}/>
                    </LabelContentRow>

                    <Divider style={{margin: "8px 0"}}/>

                    <div style={{display: "flex", gap: 8}}>
                        <Button
                            block
                            style={{fontWeight: 500, flex: 1, height: 37}}
                            onClick={() => {
                                setIsShowFilterPopup(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            block
                            style={{fontWeight: 500, flex: 1, height: 37}}
                            disabled={Object.values(filters).filter(val => val !== null && val !== undefined).length <= 0}
                            onClick={() => {
                                setActiveFilterCount(0);
                                handleClearClick();
                            }}
                            type="primary"
                        >
                            Reset
                        </Button>
                        {/*<Button*/}
                        {/*    block*/}
                        {/*    style={{fontWeight: 500, flex: 1, height: 37}}*/}
                        {/*    // disabled={Object.values(filters).filter(val => val !== null && val !== undefined).length <= 0}*/}
                        {/*    onClick={() => {*/}
                        {/*        if (Object.values(filters).filter(val => val !== null && val !== undefined).length <= 0) {*/}
                        {/*            setIsShowFilterPopup(false);*/}
                        {/*        } else {*/}
                        {/*            setActiveFilterCount(0);*/}
                        {/*            handleClearClick();*/}
                        {/*        }*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    {Object.values(filters).filter(val => val !== null && val !== undefined).length <= 0 ? "Cancel" : "Reset"}*/}
                        {/*</Button>*/}
                        {/*<Button*/}
                        {/*    block*/}
                        {/*    style={{fontWeight: 500, flex: 1, height: 37}}*/}
                        {/*    onClick={() => {*/}
                        {/*        setIsShowFilterPopup(false);*/}
                        {/*        const count = Object.values(filters).filter(val => val !== null && val !== undefined).length;*/}
                        {/*        setActiveFilterCount(count);*/}
                        {/*        filterTasks();*/}
                        {/*    }}*/}
                        {/*    type="primary"*/}
                        {/*>*/}
                        {/*    Filter*/}
                        {/*</Button>*/}
                    </div>

                </div>
            }
        >
            <div
                className="filterButtonWrapper"
            >
                <div
                    className="filterTaskButton"
                    onClick={() => setIsShowFilterPopup(!isShowFilterPopup)}
                    style={{cursor: "pointer"}}
                >
                    <Filter className="commonIconStyle"/>
                    <div>Filters</div>
                </div>
                {activeFilterCount > 0 && (
                    <div className="filterBadge">
                        <div className="filterBadgeCount" onClick={() => {
                            setActiveFilterCount(0);
                            handleClearClick();
                        }}>
                            {activeFilterCount}
                        </div>
                    </div>
                )}
            </div>
        </Popover>
    );
};

const LabelContentRow = ({label, icon, children}) => {
    return (
        <div style={{marginBottom: 10, display: "flex", alignItems: "center"}}>
            <div style={{width: "35%", display: "flex", alignItems: "center"}}>
                {icon && <span style={{marginRight: 4}}>{icon}</span>}
                {label}
            </div>
            <div style={{width: "65%"}}>
                {children}
            </div>
        </div>
    );
};