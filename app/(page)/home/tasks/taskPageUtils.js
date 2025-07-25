import {taskColumnLabel, taskColumnStatusLabel} from "../../../utils/enum";
import appColor from "../../../utils/appColor";

export const stageWiseColor = (stage) => {
    switch (stage) {
        case taskColumnLabel.ToDo:
            return appColor.secondPrimary;
        case taskColumnLabel.InProgress:
            return appColor.info;
        case taskColumnLabel.Testing:
            return appColor.warning;
        case taskColumnLabel.OnHold:
            return appColor.primary;
        case taskColumnLabel.Completed:
            return appColor.success;
        case taskColumnLabel.Reopened:
            return appColor.danger;
        default:
            return appColor.primary;
    }
};

export const organizeTasksByStatus = (tasks) => {
    return {
        columns: taskColumnStatusLabel.reduce((acc, {value, label}) => {
            const taskList = (tasks[value] || []).sort((a, b) => a.placementIndex - b.placementIndex);

            acc[value] = {
                id: value,
                title: label,
                tasksList: taskList,
            };
            return acc;
        }, {}),
        items: {},
    };
};