'use client';

import {Avatar, Button, Card, Col, DatePicker, Grid, List, Pagination, Row, Table} from "antd";
import {appColor, colorMap} from "../../../utils/appColor";
import {
    LineChartOutlined,
    CaretRightOutlined,
    PauseOutlined,
} from "@ant-design/icons";
import appString from "../../../utils/appString";
import {useMemo, useState} from "react";
import {AlertTriangle, Clock, Watch} from "../../../utils/icons";
import dayjs from "dayjs";
import {DateTimeFormat} from "../../../utils/enum";
import {colorTag} from "../../../components/CommonComponents";
import {endpoints} from "../../../api/apiEndpoints";
import {getLocalData} from "../../../dataStorage/DataPref";
import appKeys from "../../../utils/appKeys";
import {useAppData} from "../../../masterData/AppDataContext";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
const { useBreakpoint } = Grid;
const { RangePicker } = DatePicker;

export default function CardEmpAttendanceReport() {
    const screens = useBreakpoint();
    const {attendancesData} = useAppData();
    const [empReportData, setEmpReportData] = useState(attendancesData);
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();

    const [isLoading, setIsLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const paginatedData = useMemo(() => {
        return [...empReportData].reverse().slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
        );
    }, [empReportData, currentPage, pageSize]);

    const empReportTableColumn = () => [
        {
            title: "Date",
            dataIndex: "createdAt",
            key: "createdAt",
            align: 'center',
            render: (createdAt) => {
                if (!createdAt) return "-";
                return <div className="w-20 flex justify-center items-center text-center">{dayjs(createdAt).format(DateTimeFormat.DDMMMMYYYY)}</div>;
            },
        },
        {
            title: "Total Hours",
            dataIndex: "totalHours",
            key: "totalHours",
            align: 'center',
            render: (totalHours) => {
                return colorTag(totalHours, appColor.secondPrimary);
            },
        },
        {
            title: "Working Hours",
            dataIndex: "workingHours",
            key: "workingHours",
            align: 'center',
            render: (workingHours) => {
                return colorTag(workingHours, appColor.success);
            },
        },
        {
            title: "Break Hours",
            dataIndex: "breakHours",
            key: "breakHours",
            align: 'center',
            render: (breakHours) => {
                return colorTag(breakHours, appColor.danger);
            },
        },
        {
            title: "Late Arrival",
            dataIndex: "lateArrival",
            key: "lateArrival",
            align: 'center',
            render: (lateArrival) => {
                return colorTag(lateArrival, appColor.warning);
            },
        },
        {
            title: "Overtime",
            dataIndex: "overtime",
            key: "overtime",
            align: 'center',
            render: (overtime) => {
                return colorTag(overtime, appColor.info);
            },
        },
    ];

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

    const rangePresets = [
        { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
        { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
        { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
        { label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
    ];

    const onRangeChange = (dates, dateStrings) => {
        if (dates) {
            setStartDate(dateStrings[0]);
            setEndDate(dateStrings[1]);
            getEmpReportData();
        }
    };

    return (
        <div>
            <Table
                pagination={false}
                columns={empReportTableColumn()}
                dataSource={paginatedData}
                // scroll={{ x: true, y: !screens.xl ? 300 : 240 }}
                // scroll={{ x: true, scrollToFirstRowOnChange: true }}
                loading={isLoading}
                bordered
                title={() => (
                    <div className="flex items-center gap-2">
                        <LineChartOutlined style={{color: colorMap.F}} />
                        <div className="flex-1 font-[550] text-[15px]">{appString.attendanceReport}</div>
                        <RangePicker presets={rangePresets} onChange={onRangeChange} />
                    </div>
                )}
                footer={() => (
                    <div className="flex justify-center">
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={empReportData.length}
                            onChange={(page, size) => {
                                setCurrentPage(page);
                                setPageSize(size);
                            }}
                            showSizeChanger={false}
                        />
                    </div>
                )}
            />
        </div>
    );
}