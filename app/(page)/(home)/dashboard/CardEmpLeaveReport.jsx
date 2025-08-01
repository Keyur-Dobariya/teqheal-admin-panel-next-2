'use client';

import {Avatar, Button, Card, Col, List, Pagination, Row, Table} from "antd";
import {appColor, colorMap} from "../../../utils/appColor";
import {
    LineChartOutlined,
    CaretRightOutlined,
    PauseOutlined,
} from "@ant-design/icons";
import appString from "../../../utils/appString";
import {useState} from "react";
import {AlertTriangle, Box, Clock, Watch} from "../../../utils/icons";
import dayjs from "dayjs";
import {DateTimeFormat, getLabelByKey, leaveCategoryLabel, leaveLabelKeys, leaveTypeLabel} from "../../../utils/enum";
import {antTag, colorTag} from "../../../components/CommonComponents";
import {endpoints} from "../../../api/apiEndpoints";
import {getLocalData, isAdmin} from "../../../dataStorage/DataPref";
import {useAppData} from "../../../masterData/AppDataContext";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import appKeys from "../../../utils/appKeys";
import {capitalizeLastPathSegment} from "../../../utils/utils";

export default function CardEmpLeaveReport() {
    const {attendancesData} = useAppData();
    const [empReportData, setEmpReportData] = useState(attendancesData);
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();

    const [isLoading, setIsLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const paginatedData = [...empReportData].reverse().slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const getEmpReportData = async () => {
        try {
            const baseUrl = `${endpoints.userWiseAttendanceData}${getLocalData(
                appKeys._id
            )}`;
            let queryParams = [];

            if (startDate) {
                queryParams.push(`startDate=${startDate}`);
            }
            if (endDate) {
                queryParams.push(`endDate=${endDate}`);
            }

            const finalUrl =
                queryParams.length > 0
                    ? `${baseUrl}?${queryParams.join("&")}`
                    : baseUrl;

            await apiCall({
                method: HttpMethod.GET,
                url: finalUrl,
                setIsLoading,
                showSuccessMessage: false,
                successCallback: (data) => {
                    setEmpReportData(data?.data);
                },
            });
        } catch (error) {
            console.error("API Call Failed:", error);
        }
    };

    const onRangeChange = (dates, dateStrings) => {
        if (dates) {
            setStartDate(dateStrings[0]);
            setEndDate(dateStrings[1]);
            getEmpReportData();
        }
    };

    const leaveTableColumn = [
        Table.EXPAND_COLUMN,
        {
            title: capitalizeLastPathSegment(appKeys.leaveType),
            dataIndex: appKeys.leaveType,
            key: appKeys.leaveType,
            render: (leaveType) => {
                return antTag(
                    getLabelByKey(leaveType, leaveTypeLabel),
                    leaveType === leaveLabelKeys.fullDay ? "red" : leaveType === leaveLabelKeys.halfDay ? "blue" : "purple"
                );
            },
        },
        {
            title: capitalizeLastPathSegment(appKeys.hours),
            dataIndex: appKeys.hours,
            key: appKeys.hours,
        },
        {
            title: capitalizeLastPathSegment(appKeys.startDate),
            dataIndex: appKeys.startDate,
            key: appKeys.startDate,
            render: (startDate) => {
                return startDate ? dayjs(startDate).format("YYYY-MM-DD") : '-';
            },
        },
        {
            title: capitalizeLastPathSegment(appKeys.endDate),
            dataIndex: appKeys.endDate,
            key: appKeys.endDate,
            render: (endDate) => {
                return endDate ? dayjs(endDate).format("YYYY-MM-DD") : '-';
            },
        },
        {
            title: capitalizeLastPathSegment(appKeys.leaveCategory),
            dataIndex: appKeys.leaveCategory,
            key: appKeys.leaveCategory,
            render: (leaveCategory) => {
                return antTag(
                    getLabelByKey(leaveCategory, leaveCategoryLabel({disabledValues: []})),
                    leaveCategory === leaveLabelKeys.paid ? "red" : "green"
                );
            },
        },
        {
            title: capitalizeLastPathSegment(appKeys.isUnexpected),
            dataIndex: appKeys.isUnexpected,
            key: appKeys.isUnexpected,
            render: (isUnexpected) => {
                return antTag(
                    isUnexpected ? 'Yes' : 'No',
                    isUnexpected ? "red" : "green"
                );
            },
        },
        {
            title: capitalizeLastPathSegment(appKeys.status),
            dataIndex: appKeys.status,
            key: appKeys.status,
            render: (status) => {
                return antTag(
                    capitalizeLastPathSegment(status),
                    status === leaveLabelKeys.rejected ? "red" : status === leaveLabelKeys.approved ? "green" : "gold"
                );
            },
        },
        {
            title: capitalizeLastPathSegment(appKeys.sandwichLeave),
            dataIndex: appKeys.sandwichLeave,
            key: appKeys.sandwichLeave,
            render: (sandwichLeave) => {
                return antTag(
                    sandwichLeave ? 'Yes' : 'No',
                    sandwichLeave ? "red" : "green"
                );
            },
        },
    ];

    return (
        <div>
            <Table
                rowKey={(record) => record._id}
                pagination={false}
                columns={leaveTableColumn}
                dataSource={[]}
                scroll={{ x: "max-content", y: 280 }}
                style={{ scrollbarWidth: "none" }}
                loading={isLoading}
                bordered
                title={() => (
                    <div className="flex items-center gap-2">
                        <Box color={colorMap.K} />
                        <div className="font-[550] text-[15px]">{appString.leaveReport}</div>
                    </div>
                )}
            />
        </div>
    );
}