import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Switch,
    Table,
    TimePicker,
    Tooltip
} from "antd";
import appKeys from "../../../utils/appKeys";
import {Calendar, Clock, Edit, Home, Key, Monitor, Save, UploadCloud} from "../../../utils/icons";
import appString from "../../../utils/appString";
import React, {useEffect, useState} from "react";
import appColor from "../../../utils/appColor";
import {convertCamelCase} from "../../../utils/utils";
import dayjs from "dayjs";
import apiCall, {HttpMethod} from "../../../api/apiServiceProvider";
import {endpoints} from "../../../api/apiEndpoints";
import {antTag} from "../../../components/CommonComponents";

const timeFormat = "HH:mm";

export const CardDailyTime = ({isMobile}) => {

    const [data, setData] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [recordUpdateLoading, setRecordUpdateLoading] = useState(false);
    const [isDataPostLoading, setIsDataPostLoading] = useState(false);
    const [month, setMonth] = useState(dayjs());
    const [year, setYear] = useState(dayjs());

    const getDailyTime = async (month, year, setLoading, successCallback) => {
        return apiCall({
            method: HttpMethod.GET,
            url: `${endpoints.getDailyTime}?month=${month.format('MM')}&year=${year.format('YYYY')}`,
            setIsLoading: setLoading,
            showSuccessMessage: false,
            successCallback,
        });
    };

    const updateDailyTime = async () => {
        const values = await form.validateFields();
        const payload = {
            startTime: values.startTimeMoment?.format(timeFormat) || null,
            endTime: values.endTimeMoment?.format(timeFormat) || null,
            breakAllow: values.breakAllow,
        };

        return apiCall({
            method: HttpMethod.POST,
            url: `${endpoints.updateTime}/${editingRow}`,
            data: payload,
            setIsLoading: setRecordUpdateLoading,
            successCallback: () => {
                setEditingRow(null);
                fetchData();
            },
        });
    };

    const insertYearlyData = async () => {
        return apiCall({
            method: HttpMethod.POST,
            url: endpoints.insertYearlyData,
            setIsLoading: setIsDataPostLoading,
            successCallback: () => {
                fetchData();
            },
        });
    };

    const fetchData = async () => {
        await getDailyTime(month, year, setIsLoading, (res) => {
            const mappedData = res.data.map((item) => ({
                ...item,
                startTimeMoment: item.startTime ? dayjs(item.startTime, timeFormat) : null,
                endTimeMoment: item.endTime ? dayjs(item.endTime, timeFormat) : null,
            }));
            setData(mappedData);
        });
    };

    useEffect(() => {
        fetchData();
    }, [month, year]);

    const onEdit = (record) => {
        form.setFieldsValue({
            startTimeMoment: record.startTime ? dayjs(record.startTime, timeFormat) : null,
            endTimeMoment: record.endTime ? dayjs(record.endTime, timeFormat) : null,
            breakAllow: record.breakAllow,
        });
        setEditingRow(record._id);
    };

    const formatTotalHour = (decimalHour) => {
        const hours = Math.floor(decimalHour);
        const minutes = Math.round((decimalHour - hours) * 60);
        return `${hours}h ${minutes}m`;
    };

    const columns = [
        {
            title: appString.date,
            dataIndex: appKeys.date,
        },
        {
            title: appString.startTime,
            dataIndex: appKeys.startTime,
            render: (_, record) =>
                editingRow === record._id ? (
                    <Form.Item name={appKeys.startTimeMoment} noStyle>
                        <TimePicker format={timeFormat}/>
                    </Form.Item>
                ) : (
                    record.startTime ? record.startTime : '-'
                ),
        },
        {
            title: appString.endTime,
            dataIndex: appKeys.endTime,
            render: (_, record) =>
                editingRow === record._id ? (
                    <Form.Item name={appKeys.endTimeMoment} noStyle>
                        <TimePicker format={timeFormat}/>
                    </Form.Item>
                ) : (
                    record.endTime ? record.endTime : '-'
                ),
        },
        {
            title: appString.breakAllow,
            dataIndex: appKeys.breakAllow,
            render: (breakAllow, record) =>
                editingRow === record._id ? (
                    <Form.Item name="breakAllow" valuePropName="checked" noStyle>
                        <Switch/>
                    </Form.Item>
                ) : antTag(
                    breakAllow ? 'Yes' : 'No',
                    breakAllow ? "green" : "red"
                ),
        },
        {
            title: appString.isLeaveOnDay,
            dataIndex: appKeys.isLeaveOnDay,
            render: (isLeaveOnDay) => {
                return isLeaveOnDay ? antTag(
                    isLeaveOnDay ? 'Yes' : 'No',
                    isLeaveOnDay ? "red" : "green"
                ) : '-';
            },
        },
        {
            title: appString.totalHour,
            dataIndex: appKeys.totalHour,
            render: (totalHour) => {
                return antTag(
                    formatTotalHour(totalHour),
                    "blue"
                );
            },
        },
        {
            title: appString.action,
            fixed: "right",
            render: (_, record) =>
                editingRow === record._id ? (
                    <span>
            <Button type="link" loading={recordUpdateLoading} onClick={updateDailyTime}>
              Update
            </Button>
            <Button type="link" onClick={() => setEditingRow(null)}>
              Cancel
            </Button>
          </span>
                ) : (
                    <div
                        className="flex justify-center items-center cursor-pointer"
                        onClick={() => onEdit(record)}>
                        <Tooltip title={appString.edit}>
                            <Edit color={appColor.secondPrimary}/>
                        </Tooltip>
                    </div>
                ),
        },
    ];

    return (
        <>
            <Form form={form} component={false}>
                <Card>
                    <Table
                        dataSource={data}
                        columns={columns}
                        rowKey="_id"
                        loading={isLoading}
                        title={() => (
                            <div className="flex justify-between items-center gap-3">
                                {!isMobile && <div className="text-base font-medium">{appString.dailyTime}</div>}
                                <div className="flex-1 flex justify-end items-center gap-3">
                                    <DatePicker
                                        rootClassName={`${isMobile ? "flex-1" : ""}`}
                                        picker="month"
                                        value={month}
                                        onChange={(value) => {
                                            if (value) {
                                                setMonth(value);
                                            }
                                        }}
                                    />
                                    <DatePicker
                                        rootClassName={`${isMobile ? "flex-1" : ""}`}
                                        picker="year"
                                        value={year}
                                        onChange={(value) => {
                                            if (value) {
                                                setYear(value);
                                            }
                                        }}
                                    />
                                    <Button
                                        type="primary"
                                        icon={<UploadCloud/>}
                                        loading={isDataPostLoading}
                                        onClick={insertYearlyData}
                                    >
                                        {!isMobile && appString.insertYearlyData}
                                    </Button>
                                </div>
                            </div>
                        )}
                    />
                </Card>
            </Form>
        </>
    )
}