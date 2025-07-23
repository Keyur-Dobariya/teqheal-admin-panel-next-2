'use client';

import {decryptValue, profilePhotoManager} from "../../../utils/utils";
import appString from "../../../utils/appString";
import {
    getLabelByKey,
    reportTypeKey, reportTypeLabels
} from "../../../utils/enum";
import dayjs from "dayjs";
import appKeys from "../../../utils/appKeys";
import {antTag, UserSelect} from "../../../components/CommonComponents";
import {getLocalData, isAdmin} from "../../../dataStorage/DataPref";
import {
    Avatar,
    Button,
    Card,
    Col,
    DatePicker,
    Grid,
    Input,
    Popconfirm,
    Row,
    Select,
    Table,
    Tooltip
} from "antd";
import {
    Edit,
    Search,
    UploadCloud, EyeOff, Eye
} from "../../../utils/icons";
import {useAppData} from "../../../masterData/AppDataContext";
import React, {useEffect, useMemo, useState} from "react";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints";

import appColor from "../../../utils/appColor";
import LeaveAddUpdateModel from "../../../models/LeaveAddUpdateModel";
import {SalaryReportAddUpdateModel} from "../../../models/SalaryReportAddUpdateModel";

const {Option} = Select;

const {useBreakpoint} = Grid;

export default function Page() {

    const {activeUsersData} = useAppData();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [allData, setAllData] = useState([]);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const [isLeaveStatusChange, setIsLeaveStatusChange] = useState(false);
    const [isShowAmounts, setIsShowAmounts] = useState(false);
    const [publishRecord, setPublishRecord] = useState({
        month: null,
        year: null,
        isPublished: true,
    });

    const now = new Date();
    const prevMonth = now.getMonth();
    const defaultMonth = prevMonth === 0 ? 12 : prevMonth;
    const defaultYear = prevMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();

    const [filters, setFilters] = useState({
        reportType: reportTypeKey.punchWise,
        user: isAdmin() ? null : getLocalData(appKeys._id),
        year: defaultYear,
        month: defaultMonth,
    });

    const getQueryParams = () => {
        const params = new URLSearchParams();
        if (filters.reportType) params.append('reportType', filters.reportType);
        if (filters.user) params.append('user', filters.user);
        if (filters.year) params.append('year', filters.year);
        if (filters.month) params.append('month', filters.month);
        return params.toString();
    };

    useEffect(() => {
        const query = getQueryParams();
        getSalaryReportData(query);
    }, [filters]);

    const getSalaryReportData = async (query) => {
        await apiCall({
            method: HttpMethod.GET,
            url: isAdmin() ? endpoints.generateSalaryReports + query : endpoints.getUserWiseReport,
            setIsLoading,
            showSuccessMessage: false,
            successCallback: handleUpdatedData,
        });
    };

    const filteredData = useMemo(() => {
        if (!allData) return [];
        const roleWiseData = isAdmin() ? allData : allData.filter((leave) => leave.user._id === getLocalData(appKeys._id));
        const query = searchText.toLowerCase();
        return roleWiseData.filter(
            data =>
                (
                    data?.user?.fullName.toLowerCase().includes(query) ||
                    data?.leaveType?.toLowerCase().includes(query) ||
                    data?.leaveCategory?.toLowerCase().includes(query) ||
                    data?.reason?.toLowerCase().includes(query) ||
                    data?.rejectedReason?.toLowerCase().includes(query)
                )
        );
    }, [allData, searchText]);

    const handleUpdatedData = (data) => {
        setAllData(data.data);
    };

    const conditionWiseData = (isUnexpected) => {
        const leaveRecord = filteredData.filter((leave) => leave.isUnexpected !== true);
        const unexpectedRecord = filteredData.filter((leave) => leave.isUnexpected === true);
        return isUnexpected ? unexpectedRecord : leaveRecord;
    };

    const openModalWithLoading = (isEditMode, record = null) => {
        const loadingId = isEditMode ? record._id : 'add';
        setActionLoading(loadingId);

        const params = new URLSearchParams(getQueryParams());
        const json = {};
        for (const [key, value] of params.entries()) {
            json[key] = isNaN(value) ? value : Number(value);
        }

        setSelectedRecord({
            ...record,
            query: json,
            leaveData: record.leaveList,
            punchData: record.punchList
        });

        setTimeout(() => {
            setIsModelOpen(true);
            setActionLoading(null);
        }, 100);
    };

    const handleEditClick = (record) => {
        openModalWithLoading(true, record);
    };

    function formatMinutes(minutes) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        let formatted = '';
        if (hours > 0) {
            formatted += `${hours}h`;
        }
        if (remainingMinutes > 0) {
            formatted += ` ${remainingMinutes}m`;
        }

        if (!formatted && remainingMinutes === 0) {
            formatted = `${remainingMinutes}m`;
        }

        return formatted.trim();
    }

    const handleReportPublish = async () => {
        const params = new URLSearchParams(getQueryParams());
        const json = {};
        for (const [key, value] of params.entries()) {
            json[key] = isNaN(value) ? value : Number(value);
        }

        const body = {
            reportType: filters.reportType,
            month: filters.month,
            year: filters.year,
            query: json,
        }

        try {
            await apiCall({
                method: HttpMethod.POST,
                url: endpoints.publishSalaryReport,
                data: body,
                setIsLoading: setIsLoading,
                successCallback: (data) => {
                    setPublishRecord({
                        month: data.month,
                        year: data.year,
                        isPublished: isAdmin() ? data.isPublished : true
                    })
                    handleUpdatedData(data);
                },
            });
        } catch (error) {
            console.error("Form validation or API failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = [
        {
            title: appString.fullName,
            dataIndex: appKeys.user,
            key: 'user.fullName',
            hidden: !isAdmin(),
            render: (text, record) => (
                <div className="flex items-center gap-2">
                    <Avatar src={profilePhotoManager({url: record?.user?.profilePhoto, gender: record?.user?.gender})}
                            size="default"/>
                    <div className="flex-1 font-medium">{record?.user?.fullName}</div>
                </div>
            ),
        },
        {
            title: appString.reportTime,
            dataIndex: appKeys.date,
            key: appKeys.date,
            render: (date) => {
                const dateStr = new Date(date);
                const month = dateStr.toLocaleString("en-US", {month: "long"});
                return `${month}-${dateStr.getFullYear()}`;
            },
        },
        {
            title: appString.reportType,
            dataIndex: appKeys.reportType,
            key: appKeys.reportType,
            render: (reportType) => {
                return antTag(
                    getLabelByKey(reportType, reportTypeLabels), "blue"
                );
            },
        },
        {
            title: appString.basicSalary,
            dataIndex: appKeys.basicSalary,
            key: appKeys.basicSalary,
            render: (basicSalary) => {
                console.log("basicSalary", basicSalary)
                return antTag(
                    !isShowAmounts ? "***" : decryptValue(basicSalary) || "0", "purple"
                );
            },
        },
        {
            title: appString.totalDeductMinutes,
            dataIndex: appKeys.totalDeductMinutes,
            key: appKeys.totalDeductMinutes,
            render: (totalDeductMinutes) => {
                return totalDeductMinutes ? antTag(
                    formatMinutes(totalDeductMinutes), "red"
                ) : '-';
            },
        },
        {
            title: appString.deductionAmount,
            dataIndex: appKeys.deductionAmount,
            key: appKeys.deductionAmount,
            render: (deductionAmount) => {
                return antTag(
                    !isShowAmounts ? "***" : decryptValue(deductionAmount) || "0", "red"
                );
            },
        },
        {
            title: appString.bonus,
            dataIndex: appKeys.bonus,
            key: appKeys.bonus,
            render: (bonus) => {
                return antTag(
                    !isShowAmounts ? "***" : decryptValue(bonus) || "0", "green"
                );
            },
        },
        {
            title: appString.netSalary,
            dataIndex: appKeys.netSalary,
            key: appKeys.netSalary,
            render: (netSalary) => {
                return antTag(
                    !isShowAmounts ? "***" : decryptValue(netSalary) || "0", "blue"
                );
            },
        },
        {
            title: appString.action,
            dataIndex: appKeys.operation,
            fixed: "right",
            width: 50,
            render: (_, record) => {
                return (
                    <>
                        <div className="flex items-center justify-center">
                            <div className="cursor-pointer"
                                 onClick={() => handleEditClick(record)}
                            >
                                <Tooltip title={appString.edit}>
                                    {publishRecord.isPublished ? <Eye color={appColor.primary}/> :
                                        <Edit color={appColor.secondPrimary}/>}
                                </Tooltip>
                            </div>
                        </div>
                    </>
                );
            },
        },
    ];

    const TableFilterHeader = () => {
        return (
            <Row gutter={[16, 16]} align="middle" justify="end" wrap>
                {isAdmin() && (
                    <Col xs={24} sm={8} md={8} lg={8} xl={7} xxl={5}>
                        <UserSelect users={activeUsersData} value={filters.user} onChange={(key) =>
                            setFilters((prev) => ({...prev, user: key}))
                        }/>
                    </Col>
                )}
                <Col xs={24} sm={6} md={6} lg={6} xl={5} xxl={4}>
                    <Select
                        allowClear
                        value={filters.reportType}
                        style={{width: "100%"}}
                        onChange={(value) =>
                            setFilters((prev) => ({...prev, reportType: value}))
                        }
                    >
                        {reportTypeLabels.map((item) => (
                            <Option key={item.value} value={item.value}>
                                {item.label}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={12} sm={5} md={5} lg={5} xl={4} xxl={3}>
                    <DatePicker
                        allowClear={false}
                        picker="year"
                        value={dayjs().year(filters.year)}
                        onChange={(date) =>
                            setFilters((prev) => ({...prev, year: date ? date.year() : null}))
                        }
                        style={{width: "100%"}}
                    />
                </Col>
                <Col xs={12} sm={5} md={5} lg={5} xl={4} xxl={3}>
                    <DatePicker
                        allowClear={false}
                        picker="month"
                        format="MMMM"
                        value={dayjs(`${filters.year}-${String(filters.month).padStart(2, '0')}`, 'YYYY-MM')}
                        onChange={(date) =>
                            setFilters((prev) => ({
                                ...prev,
                                month: date ? date.month() + 1 : null,
                            }))
                        }
                        style={{width: "100%"}}
                    />
                </Col>
            </Row>
        );
    };

    return (
        <>
            <Card>
                <div className="flex justify-between items-center gap-2 p-3">
                    <Input
                        placeholder={appString.searchHint}
                        prefix={<Search/>}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        className="flex-1 max-w-90"
                    />
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outlined"
                            icon={isShowAmounts ? <EyeOff/> : <Eye/>}
                            onClick={() => setIsShowAmounts(!isShowAmounts)}
                        >
                            {!isMobile && (isShowAmounts ? appString.hideAmount : appString.showAmount)}
                        </Button>
                        {!publishRecord.isPublished && <Popconfirm
                            title="Report Publish"
                            description="Are you sure to publish selected month salary report?"
                            okText="Yes"
                            cancelText="No"
                            onConfirm={handleReportPublish}
                        >
                            <Button
                                type="primary"
                                icon={<UploadCloud/>}
                            >
                                {!isMobile && appString.publish}
                            </Button>
                        </Popconfirm>}
                    </div>
                </div>
            </Card>
            <div className="m-4"/>
            <Card>
                <Table
                    rowKey={(record) => record._id}
                    columns={columns}
                    title={() => (
                        <TableFilterHeader/>
                    )}
                    scroll={{x: "max-content"}}
                    dataSource={conditionWiseData(false)}
                    loading={isLoading}
                />
            </Card>
            {isModelOpen && <SalaryReportAddUpdateModel
                setIsModelOpen={setIsModelOpen}
                isModelOpen={isModelOpen}
                selectedRecord={selectedRecord}
                onSuccessCallback={(data) => {
                    handleUpdatedData(data);
                }}/>}
        </>
    );
}