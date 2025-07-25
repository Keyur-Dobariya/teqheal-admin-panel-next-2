'use client'

import {Avatar, Card, Tooltip} from "antd";
import appColor, {getDarkColor} from "../../../utils/appColor";
import {contentCopy, getDataById, getTwoCharacterFromName} from "../../../utils/utils";
import {Clock, Copy} from "../../../utils/icons";
import {getIconByKey, getLabelByKey, taskCategoryLabel, taskPriorityLabel} from "../../../utils/enum";
import dayjs from "dayjs";
import React from "react";

export const TaskCard = ({task, activeUsersData, projectData, snapshot, handleTaskOpenClick}) => {

    const addedByUser = activeUsersData.find(emp => emp._id === task.taskAddedBy);

    let assignees = Array.isArray(task.taskAssignee) && task.taskAssignee.length > 0
        ? task.taskAssignee
            .filter(assignee => assignee && assignee.userId)
            .map(assignee =>
                activeUsersData.find(emp => emp._id === assignee.userId)
            )
            .filter(Boolean)
        : [];

    if (addedByUser && !assignees.some(emp => emp._id === addedByUser._id)) {
        assignees.push(addedByUser);
    }

    return (
        <div style={{padding: "6px 12px"}}>
            <Card hoverable style={{backgroundColor: snapshot.isDragging ? appColor.blueCardBg : ""}}>
                <>
                    <div className="p-3 flex flex-col gap-1 cursor-grab" onClick={handleTaskOpenClick}>
                        <div className="flex justify-between items-center">
                            <Tooltip title="Copy Task Link">
                                <div
                                    className="flex items-center gap-2 text-[13px] font-medium text-blue-700 cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const fullUrl = `${window.location.origin}${window.location.pathname}?task=${task.taskId}`;
                                        contentCopy(fullUrl, 'Task URL Copied!');
                                    }}>{`#${task.taskId}`}<Copy color={appColor.secondPrimary} size={15}/></div>
                            </Tooltip>
                            <Tooltip title={getLabelByKey(task.taskPriority, taskPriorityLabel)}>
                                <div
                                    className="cursor-pointer">{getIconByKey(task.taskPriority, taskPriorityLabel)}</div>
                            </Tooltip>
                        </div>
                        <div className="text-[14px] font-medium text-gray-900 mt-1">{task.taskTitle}</div>
                        {task.projectName && <div
                            className="text-[13px] text-gray-700">{getDataById(projectData, task.projectName)?.projectName}</div>}
                        <div className="flex justify-between items-center">
                            <span>{getLabelByKey(task.taskCategory, taskCategoryLabel)}</span>
                            <Avatar.Group max={{
                                count: 3,
                                style: {
                                    color: appColor.white,
                                    backgroundColor: appColor.primary,
                                    fontSize: "12px",
                                    fontWeight: "550"
                                },
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
                            <div
                                className="mb-2 mx-2 cursor-pointer bg-red-100 text-red-900 text-[12px] font-medium px-2 py-[2px] rounded-md text-center flex items-center justify-center gap-1"
                                title="Closed Time">
                                <Clock color="#82181a" size={13}/>
                                {dayjs(task.taskClosedTime[task.taskClosedTime.length - 1].closedAt).format("DD-MM-YYYY HH:mm:ss A")}
                            </div>
                        ) : null
                    }
                </>
            </Card>
        </div>
    );
};