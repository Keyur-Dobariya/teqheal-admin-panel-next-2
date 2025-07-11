'use client'

import {createContext, useContext, useReducer} from "react";

const AppDataContext = createContext(undefined, undefined);

export const AppDataFields = {
    dashboardData: "dashboardData",
    loginUserData: "loginUserData",
    usersData: "usersData",
    clientsData: "clientsData",
    projectsData: "projectsData",
    leavesData: "leavesData",
    basicSalaryData: "basicSalaryData",
    eventsData: "eventsData",
    holidayData: "holidayData",
    taskBoardData: "taskBoardData",
    attendancesData: "attendancesData",
    settings: "settings",
    chatRoomsData: "chatRoomsData",
};

const defaultFieldValues = {
    [AppDataFields.dashboardData]: null,
    [AppDataFields.loginUserData]: null,
};

export const initialState = Object.keys(AppDataFields).reduce((acc, key) => {
    const field = AppDataFields[key];
    acc[field] = field in defaultFieldValues ? defaultFieldValues[field] : [];
    return acc;
}, {});

function appDataReducer(state, action) {
    switch (action.type) {
        case "masterData":
            return {
                ...state,
                ...action.payload,
            };
        case "updateField":
            return {
                ...state,
                [action.field]: action.value,
            };
        default:
            return state;
    }
}

export const AppDataProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appDataReducer, initialState);

    const setAllMasterData = (data) => {
        dispatch({ type: "masterData", payload: data });
    };

    const updateAppDataField = (field, value) => {
        dispatch({ type: "updateField", field, value });
    };

    const getLocalData = (key) => {
        return localStorage.getItem(key);
    };

    return (
        <AppDataContext.Provider value={{ ...state, setAllMasterData, updateAppDataField, getLocalData }}>
            {children}
        </AppDataContext.Provider>
    );

};

export const useAppData = () => useContext(AppDataContext);
