'use client';

import React, {useEffect, useMemo, useRef, useState} from "react";
import {DragDropContext, Draggable, Droppable} from "@hello-pangea/dnd";
import {
    ArrowDown,
    Calendar,
    Check,
    ChevronsUp, Clock,
    Copy, Eye, EyeOff, FilePlus,
    Search,
} from "../../../utils/icons";
import {AppstoreOutlined, BarsOutlined} from '@ant-design/icons';
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Empty, Grid,
    Input,
    Popover,
    Row, Segmented,
    Select,
    Spin, Table,
    Tooltip
} from "antd";
import {
    getIconByKey,
    getValueByLabel,
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
import appColor, {getDarkColor} from "../../../utils/appColor";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints";
import {AppDataFields, useAppData} from "../../../masterData/AppDataContext";
import {contentCopy, getDataById, getTwoCharacterFromName} from "../../../utils/utils";
import appKeys from "../../../utils/appKeys";
import {showToast} from "../../../components/CommonComponents";
import appString from "../../../utils/appString";
// import {useRouter, useSearchParams} from "next/navigation";
import TaskAddUpdateSidebar from "../../../models/TaskAddUpdateSidebar";
import {reorderTasksOnServer} from "../../../api/apiUtils";
import {organizeTasksByStatus, stageWiseColor} from "./taskPageUtils";
import {TaskCard} from "./TaskCard";
import {FilterPopover} from "./FilterPopover";
import {TaskBoardUi} from "./TaskBoardUi";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const {Option} = Select;
const {RangePicker} = DatePicker;

const {useBreakpoint} = Grid;

export default function Page() {
    const {
        activeUsersData,
        activeClientData,
        activeProjectData,
        taskBoardData,
        updateAppDataField
    } = useAppData();

    // const router = useRouter();
    // const searchParams = useSearchParams();
    // const taskId = searchParams.get('task');
    const taskId = null;

    const [originalTasksByStatus, setOriginalTasksByStatus] = useState([]);
    const [tasksByStatus, setTasksByStatus] = useState([]);
    const [isAddTaskModelOpen, setAddTaskModelOpen] = useState(false);
    const [isShowFilterPopup, setIsShowFilterPopup] = useState(false);
    const [isTaskEditing, setIsTaskEditing] = useState(false);
    const [selectedTaskRecord, setSelectedTastRecord] = useState({});

    const [viewMode, setViewMode] = useState('board');

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
            if (event.data) {
                // console.log('Notification:', JSON.parse(event.data));
                updateAppDataField(AppDataFields.taskBoardData, JSON.parse(event.data) || taskBoardData);
                const taskRecord = getTaskById(taskId);
                setSelectedTastRecord({...taskRecord});
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

    const handleTaskAddClick = () => {
        setAddTaskModelOpen(true);
        setIsShowFilterPopup(false);
        setSelectedTastRecord({});
    };

    const handleTaskOpenClick = (taskDetail) => {
        setAddTaskModelOpen(true);
        setIsShowFilterPopup(false);
        setIsTaskEditing(true);
        // const params = new URLSearchParams(searchParams);
        // params.set('task', taskDetail.taskId);
        // router.push(`?${params.toString()}`);
        // navigate(`/tasks/${taskDetail.taskId}`);
        setSelectedTastRecord(taskDetail);
    };

    useEffect(() => {
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "200px",
                overflow: "hidden"
            }}>
                <Spin/>
            </div>
        );
    }

    const dataSource = taskColumnStatusLabel
        .map(({label, value}) => ({
            key: value,
            statusLabel: label,
            children: (tasksByStatus.columns?.[value]?.tasksList || []).map((task) => ({
                key: task._id,
                taskTitle: task.taskTitle,
                taskDescription: task.taskDescription,
                taskPriority: task.taskPriority,
                clientName: task.clientName,
            })),
        }))
        .filter(group => group.children.length > 0);


    const columns = [
        {
            title: 'Task Title',
            dataIndex: 'taskTitle',
            key: 'taskTitle',
        },
        {
            title: 'Description',
            dataIndex: 'taskDescription',
            key: 'taskDescription',
        },
        {
            title: 'Priority',
            dataIndex: 'taskPriority',
            key: 'taskPriority',
        },
        {
            title: 'Client',
            dataIndex: 'clientName',
            key: 'clientName',
            render: (text) => text || '-',
        },
    ];

    return (
        <>
            <div ref={taskBoardContainerRef} style={{marginRight: isAddTaskModelOpen ? 685 : 0}}>
                <Card title={(
                    <div className="py-4">
                        <Row gutter={[16, 16]} align="middle" wrap>
                            <Col xs={24} sm={16} md={12} lg={24} xl={8} xxl={7}>
                                <div className="flex justify-between items-center gap-3">
                                    <Segmented
                                        disabled
                                        value={viewMode}
                                        size="large"
                                        options={[
                                            {value: 'list', icon: <BarsOutlined/>},
                                            {value: 'board', icon: <AppstoreOutlined/>},
                                        ]}
                                        onChange={setViewMode}
                                    />
                                    <Input
                                        placeholder={appString.searchHint}
                                        prefix={<Search/>}
                                        onChange={(e) => {
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
                                        }}
                                        className="w-full flex-1 max-w-90"
                                    />
                                </div>
                            </Col>
                            <Col xs={0} sm={0} md={0} lg={0} xl={0} xxl={1}/>
                            <Col xs={24} sm={8} md={12} lg={7} xl={5} xxl={5}>
                                <Select
                                    placeholder="Select Client"
                                    allowClear
                                    style={{width: "100%"}}
                                    showSearch
                                    value={filters.client}
                                    onChange={(value) => {
                                        handleFilterChange('client', value);
                                        if (!value) {
                                            handleDataConditionWise(taskBoardData);
                                        }
                                    }}
                                    filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                                    options={activeClientData.map(client => ({
                                        label: client.clientName,
                                        value: client._id
                                    }))}
                                />
                            </Col>
                            <Col xs={24} sm={12} md={12} lg={7} xl={5} xxl={5}>
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
                                    style={{width: "100%"}}
                                    showSearch
                                    filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                                    options={filteredProjects.map(project => ({
                                        label: project.projectName,
                                        value: project._id
                                    }))}
                                />
                            </Col>
                            <Col xs={12} sm={6} md={6} lg={5} xl={3} xxl={3}>
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
                                        handleDataConditionWise(taskBoardData);
                                    }}
                                    filterTasks={filterTasks}
                                />
                            </Col>
                            <Col xs={12} sm={6} md={6} lg={5} xl={3} xxl={3}>
                                <Button
                                    type="primary"
                                    icon={<FilePlus/>}
                                    onClick={handleTaskAddClick}
                                    style={{ width: "100%" }}
                                >
                                    Add Task
                                </Button>
                            </Col>
                        </Row>
                    </div>
                )}>
                    {viewMode === 'board' ? (
                        <TaskBoardUi tasksByStatus={tasksByStatus} setTasksByStatus={setTasksByStatus} activeUsersData={activeUsersData} activeProjectData={activeProjectData} handleTaskOpenClick={handleTaskOpenClick}/>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={dataSource}
                            pagination={false}
                            expandable={{
                                defaultExpandAllRows: true,
                                expandIcon: ({expanded, onExpand, record}) =>
                                    record.children ? (
                                        <span
                                            onClick={e => onExpand(record, e)}
                                            style={{cursor: 'pointer', marginRight: 8}}
                                        >
          {expanded ? '▼' : '▶'}
        </span>
                                    ) : null,
                                rowExpandable: record => !!record.children,
                            }}
                            onRow={(record) => ({
                                onClick: () => {
                                    if (!record.children) {
                                        // handle task click here
                                        handleTaskOpenClick(record);
                                    }
                                }
                            })}
                        />
                    )}
                </Card>
            </div>

            {
                isAddTaskModelOpen ?
                    <TaskAddUpdateSidebar
                        isModelOpen={isAddTaskModelOpen}
                        setIsModelOpen={setAddTaskModelOpen}
                        employeeList={activeUsersData}
                        taskData={selectedTaskRecord}
                        projectData={activeProjectData}
                        clientRecord={activeClientData}
                        isEditing={isTaskEditing}
                        setIsEditing={setIsTaskEditing}
                        onSuccessCallback={(data) => {
                            handleDataConditionWise(data.data);
                        }}
                    /> : null
            }
        </>
    );
};