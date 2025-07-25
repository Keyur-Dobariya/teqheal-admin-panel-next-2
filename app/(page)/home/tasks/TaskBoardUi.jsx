'use client'

import {DragDropContext, Draggable, Droppable} from "@hello-pangea/dnd";
import {stageWiseColor} from "./taskPageUtils";
import {Button, Empty, Grid} from "antd";
import {TaskCard} from "./TaskCard";
import {ArrowDown} from "../../../utils/icons";
import React, {useEffect, useMemo, useState} from "react";
import {reorderTasksOnServer} from "../../../api/apiUtils";
import {getValueByLabel, taskColumnStatusLabel} from "../../../utils/enum";

const {useBreakpoint} = Grid;

export const TaskBoardUi = ({tasksByStatus, setTasksByStatus, activeUsersData, activeProjectData, handleTaskOpenClick}) => {

    const screens = useBreakpoint();

    const [taskLimits, setTaskLimits] = useState({});

    const mainContainerHeight = useMemo(() => {
        if (screens.xxl) {
            return "h-[calc(100vh-210px)]";
        } else if (screens.xl) {
            return "h-[calc(100vh-210px)]";
        } else if (screens.lg) {
            return "h-[calc(100vh-260px)]";
        } else if (screens.md) {
            return "h-[calc(100vh-260px)]";
        } else if (screens.sm) {
            return "h-[calc(100vh-260px)]";
        } else {
            return "h-[calc(100vh-370px)]";
        }
    }, [screens]);

    useEffect(() => {
        if (tasksByStatus.columns) {
            const limits = {};
            Object.values(tasksByStatus.columns).forEach(col => {
                limits[col.id] = 10;
            });
            setTaskLimits(limits);
        }
    }, [tasksByStatus]);

    const handleLoadMore = (columnId) => {
        setTaskLimits(prevLimits => ({
            ...prevLimits,
            [columnId]: prevLimits[columnId] + 10,
        }));
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
                taskStatus: getValueByLabel(destStage, taskColumnStatusLabel),
            }));

            // handleAddUpdateTaskApi(
            //     result.draggableId,
            //     getValueByLabel(destStage, taskColumnStatusLabel),
            //     destination.index
            // );

            reorderTasksOnServer(reorderedTasks);
        }
    };

    return (
        <div className={`${mainContainerHeight} p-3 overflow-x-auto`}>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className={`flex overflow-x-auto h-full`}
                     style={{scrollbarWidth: "none"}}>
                    {tasksByStatus.columns && Object.values(tasksByStatus.columns).map((column) => {

                        const tasksToShow = column.tasksList.slice(0, taskLimits[column.id] || 10);
                        const hasMore = column.tasksList.length > (taskLimits[column.id] || 10);

                        return (
                            <Droppable droppableId={column.id} key={column.id}>
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        style={{
                                            borderTop: `5px solid ${stageWiseColor(column.title)}`,
                                            maxHeight: "max-content",
                                        }}
                                        className="min-w-[250px] flex-1 bg-gray-50 m-2 flex flex-col border-1 border-gray-200 rounded-lg">
                                        <div
                                            className="text-[14px] font-medium text-black mx-3 mt-3 mb-1 text-center">{`${column.title}(${column.tasksList.length})`}</div>
                                        <div
                                            style={{
                                                overflowY: "auto",
                                                scrollbarWidth: "none",
                                                // paddingTop: 5,
                                                paddingBottom: 6
                                            }}
                                        >
                                            {tasksToShow.length === 0 ? (
                                                <Empty className="my-3" description="No Tasks"/>
                                            ) : (
                                                tasksToShow.map((task, index) => (
                                                    <Draggable key={task._id} draggableId={String(task._id)}
                                                               index={index}>
                                                        {(provided, snapshot) => {
                                                            const draggingClass = snapshot.isDragging ? 'dragging' : '';
                                                            return (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={`task-card ${draggingClass}`}
                                                                >
                                                                    <TaskCard task={task}
                                                                              activeUsersData={activeUsersData}
                                                                              projectData={activeProjectData}
                                                                              snapshot={snapshot}
                                                                              handleTaskOpenClick={() => handleTaskOpenClick(task)}
                                                                    />
                                                                </div>
                                                            );
                                                        }}
                                                    </Draggable>
                                                ))
                                            )}
                                            {provided.placeholder}
                                            {hasMore && (
                                                <div className="px-3 py-[6px]">
                                                    <Button className="w-full"
                                                            onClick={() => handleLoadMore(column.id)}
                                                            icon={<ArrowDown/>}
                                                    >Load More</Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        )
                    })}
                </div>
            </DragDropContext>
        </div>
    );
}