'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {
    Card, Row, Col, Avatar, Input, Spin, Empty, DatePicker, Button, Table, Tag
} from 'antd';
import {SearchOutlined, UserOutlined, ReloadOutlined} from '@ant-design/icons';
import dayjs from 'dayjs';
import apiCall, {HttpMethod} from '../../../api/apiServiceProvider';
import {endpoints} from '../../../api/apiEndpoints';
import {useAppData} from "../../../masterData/AppDataContext";
import {antTag, UserSelect} from "../../../components/CommonComponents";
import Masonry from "react-masonry-css";
import appString from "../../../utils/appString";
import {Clock, Edit, PenTool, UploadCloud} from "../../../utils/icons";
import {getLocalData, isAdmin} from "../../../dataStorage/DataPref";
import appKeys from "../../../utils/appKeys";
import {convertCamelCase, decryptValue} from "../../../utils/utils";
import appColor from "../../../utils/appColor";

export default function Page() {
    const {activeUsersData} = useAppData();
    const [allData, setAllData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState({
        user: isAdmin() ? null : getLocalData(appKeys._id),
        year: null,
        month: null,
    });

    const filteredData = useMemo(() => {
        if (!allData) return [];
        const query = searchText.toLowerCase();
        return allData.filter(
            data =>
                (
                    data?.empCode?.toLowerCase().includes(query) ||
                    data?.user?.fullName?.toLowerCase().includes(query)
                )
        );
    }, [allData, searchText]);

    const getQueryParams = () => {
        const params = new URLSearchParams();
        if (filters.user) params.append('user', filters.user);
        if (filters.year) params.append('year', filters.year);
        if (filters.month) params.append('month', filters.month);
        return params.toString();
    };

    const processPunchData = (punchList) => {
        const flat = [];
        punchList.forEach((entry, index) => {
            flat.push({key: index, type: entry.type.toUpperCase(), time: entry.time});
        });

        const main = {};
        const extra = [];
        flat.forEach((item, index) => {
            if (index < 6) {
                main[`col${index + 1}`] = item.time;
            } else {
                extra.push(item);
            }
        });
        return {main, extra};
    };

    const getPunchReportData = async (filterQuery) => {
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.getPunchReportsList + filterQuery,
            setIsLoading: setIsLoading,
            showSuccessMessage: false,
            successCallback: (data) => {
                console.log("data=>", data)
                handleDataConditionWise(data?.data);
            },
        });
    };

    const handleDataConditionWise = (data) => {
        const filteredPunchReport = isAdmin() ? data : data.filter((data) => data.user._id === getLocalData(appKeys._id));
        setAllData(filteredPunchReport);
    };

    React.useEffect(() => {
        const filterQuery = getQueryParams();
        getPunchReportData(filterQuery);
    }, [filters]);

    const getStatusTag = (status) => {
        const colorMap = {
            'A': 'red',
            'P': 'green',
            'WO': 'purple',
            'P/2': 'orange',
        };
        return antTag(status, colorMap[status] || 'default');
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            render: (date) => {
                return date ? date : '-';
            },
        },
        {
            title: 'IN 1',
            dataIndex: 'col1',
            render: (col1) => {
                return col1 ? col1 : '-';
            },
        },
        {
            title: 'OUT 1',
            dataIndex: 'col2',
            render: (col2) => {
                return col2 ? col2 : '-';
            },
        },
        {
            title: 'IN 2',
            dataIndex: 'col3',
            render: (col3) => {
                return col3 ? col3 : '-';
            },
        },
        {
            title: 'OUT 2',
            dataIndex: 'col4',
            render: (col4) => {
                return col4 ? col4 : '-';
            },
        },
        {
            title: 'IN 3',
            dataIndex: 'col5',
            render: (col5) => {
                return col5 ? col5 : '-';
            },
        },
        {
            title: 'OUT 3',
            dataIndex: 'col6',
            render: (col6) => {
                return col6 ? col6 : '-';
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: getStatusTag,
        },
        {
            title: 'Working Hours',
            dataIndex: 'workingHours',
            render: (workingHours) => {
                return workingHours ? workingHours : '-';
            },
        },
        {
            title: 'Missing Hours',
            dataIndex: 'missingHours',
            render: (missingHours) => {
                return missingHours ? missingHours : '-';
            },
        },
        {
            title: 'Is Take Leave',
            dataIndex: 'isLeaveOnDay',
            render: (_, record) => {
                return record.isLeaveOnDay ? <>{antTag('Yes', 'red')}{antTag(convertCamelCase(record.leaveCategory), 'blue')}{record.sandwichLeave ? antTag('Sandwich', 'purple') : null}{record.isUnexpected ? antTag('Unexpected', 'cyan') : null}</> : '-';
            },
        },
        {
            title: 'Actions', render: (_, record) => <Edit color={appColor.secondPrimary} onClick={() => {
                // handleEditClick(record)
            }}/>
        },
    ];

    const expandedRowRender = (record) => {
        if (!record.extraPunches.length) return null;

        // Group punches in pairs of IN and OUT
        const pairs = [];
        for (let i = 0; i < record.extraPunches.length; i += 2) {
            const inPunch = record.extraPunches[i];
            const outPunch = record.extraPunches[i + 1];
            pairs.push({in: inPunch?.time || '', out: outPunch?.time || ''});
        }

        return (
            <div style={{background: '#fafafa'}}>
                <b>Extra Punches:</b>
                <div style={{display: 'flex', flexWrap: 'wrap', marginTop: 8}}>
                    {pairs.map((_, idx) => (
                        <React.Fragment key={`label-${idx}`}>
                            <span style={{
                                width: 60,
                                fontWeight: 550,
                                textAlign: 'center',
                                marginRight: 25
                            }}>{`IN ${idx + 4}`}</span>
                            <span style={{
                                width: 60,
                                fontWeight: 550,
                                textAlign: 'center',
                                marginRight: 25
                            }}>{`OUT ${idx + 4}`}</span>
                        </React.Fragment>
                    ))}
                </div>
                <div style={{display: 'flex', flexWrap: 'wrap', marginTop: 4}}>
                    {pairs.map((pair, idx) => (
                        <React.Fragment key={`time-${idx}`}>
                            <span style={{
                                width: 60,
                                fontWeight: 500,
                                textAlign: 'center',
                                marginRight: 25
                            }}>{pair.in || "-"}</span>
                            <span style={{
                                width: 60,
                                fontWeight: 500,
                                textAlign: 'center',
                                marginRight: 25
                            }}>{pair.out || "-"}</span>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="flex flex-col gap-4">
                <Card>
                    <div className="p-4">
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={8} lg={8} xl={6} xxl={5}>
                                <Input
                                    prefix={<SearchOutlined/>}
                                    placeholder={appString.searchHint}
                                    onChange={e => setSearchText(e.target.value)}
                                    style={{width: "100%"}}
                                />
                            </Col>
                            <Col xs={0} sm={0} md={8} lg={8} xl={0} xxl={3}/>
                            <Col xs={24} sm={12} md={8} lg={8} xl={5} xxl={4}>
                                <UserSelect users={activeUsersData} value={filters.userId} onChange={(key) =>
                                    setFilters((prev) => ({...prev, userId: key}))
                                }/>
                            </Col>
                            <Col xs={12} sm={6} md={6} lg={6} xl={3} xxl={3}>
                                <DatePicker
                                    allowClear
                                    placeholder={appString.year}
                                    value={filters.year}
                                    picker="year"
                                    onChange={(val) => setFilters((prev) => ({...prev, year: val}))}
                                    style={{width: "100%"}}
                                />
                            </Col>
                            <Col xs={12} sm={6} md={6} lg={6} xl={3} xxl={3}>
                                <DatePicker
                                    allowClear
                                    placeholder={appString.month}
                                    value={filters.month}
                                    picker="month"
                                    onChange={(val) => setFilters((prev) => ({...prev, month: val}))}
                                    style={{width: "100%"}}
                                />
                            </Col>
                            <Col xs={12} sm={6} md={6} lg={6} xl={3} xxl={3}>
                                <Button type="primary" onClick={() => {

                                }}
                                        icon={<Clock/>}
                                        style={{width: "100%"}}>
                                    {appString.addTime}
                                </Button>
                            </Col>
                            <Col xs={12} sm={6} md={6} lg={6} xl={4} xxl={3}>
                                <Button type="primary" onClick={() => {

                                }}
                                        icon={<UploadCloud/>}
                                        style={{width: "100%"}}>
                                    {appString.uploadSheet}
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Card>
                <div>
                    {isLoading ? (
                        <div className="text-center py-20">
                            <Spin size="large"/>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <Empty />
                    ) : (
                        filteredData.map((user) => {
                            const dataSource = user.punchReport.map((report, index) => {
                                const {main, extra} = processPunchData(report.punchList);
                                return {
                                    key: index,
                                    _id: user._id,
                                    userId: user.user._id,
                                    fullName: user.user.fullName,
                                    empCode: user.empCode,
                                    date: report.date,
                                    status: report.status,
                                    workingHours: report.workingHours,
                                    missingHours: report.missingHours,
                                    isLeaveOnDay: report?.deductForDate?.isLeaveOnDay,
                                    leaveCategory: report?.deductForDate?.leaveCategory,
                                    sandwichLeave: report?.deductForDate?.sandwichLeave,
                                    isUnexpected: report?.deductForDate?.isUnexpected,
                                    ...main,
                                    extraPunches: extra,
                                };
                            });

                            return (
                                <Card key={user._id}>
                                    <Table
                                        columns={columns}
                                        dataSource={dataSource}
                                        title={() => (
                                            <div className="flex justify-between text-[16px] font-medium">
                                                <span>User Name: <span>{user.user?.fullName}</span></span>
                                                <span>Employee Code: <span>{user.empCode}</span></span>
                                            </div>
                                        )}
                                        expandable={{expandedRowRender}}
                                        pagination={false}
                                        scroll={{x: "max-content"}}
                                    />
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
}
