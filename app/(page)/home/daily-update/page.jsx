'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {
    Card, Row, Col, Avatar, Input, Spin, Empty, DatePicker, Button
} from 'antd';
import {SearchOutlined, UserOutlined, ReloadOutlined} from '@ant-design/icons';
import dayjs from 'dayjs';
import apiCall, {HttpMethod} from '../../../api/apiServiceProvider';
import {endpoints} from '../../../api/apiEndpoints';
import {useAppData} from "../../../masterData/AppDataContext";
import {UserSelect} from "../../../components/CommonComponents";
import Masonry from "react-masonry-css";
import appString from "../../../utils/appString";
import {PenTool} from "../../../utils/icons";
import {getLocalData, isAdmin} from "../../../dataStorage/DataPref";
import appKeys from "../../../utils/appKeys";

export default function DailyUpdatePage() {
    const {activeUsersData} = useAppData();
    const [allData, setAllData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState({
        userId: null,
        date: null,
        startDate: null,
        endDate: null,
    });

    const filteredData = useMemo(() => {
        if (!allData) return [];
        const query = searchText.toLowerCase();
        return allData.filter(
            data =>
                (
                    data?.user?.fullName?.toLowerCase().includes(query) ||
                    data?.todayWorkUpdate?.toLowerCase().includes(query) ||
                    data?.tomorrowPlanning?.toLowerCase().includes(query)
                )
        );
    }, [allData, searchText]);

    const breakpointColumnsObj = {
        default: 3,
        1100: 2,
        700: 1
    };

    const fetchUpdates = async (isReset) => {
        let apiUrl;

        if(isReset) {
            apiUrl = endpoints.getFilteredDailyUpdates;
        } else {
            const params = new URLSearchParams();

            if (filters.userId) params.append('userId', filters.userId);
            if (filters.startDate) {
                params.append('startDate', dayjs(filters.startDate).format('YYYY-MM-DD'));
            }
            if (filters.endDate) {
                params.append('endDate', dayjs(filters.endDate).format('YYYY-MM-DD'));
            }

            apiUrl = `${endpoints.getFilteredDailyUpdates}?${params.toString()}`;
        }

        await apiCall({
            method: HttpMethod.GET,
            url: apiUrl,
            showSuccessMessage: false,
            successCallback: (data) => {
                setAllData(data?.data || []);
            },
            setIsLoading: setIsLoading,
        });
    };

    useEffect(() => {
        fetchUpdates(true);
    }, []);

    const handleFilterChange = async () => {
        await fetchUpdates(false);
    };

    const handleResetFilters = async () => {
        setFilters({
            userId: null,
            date: null,
            startDate: null,
            endDate: null,
        });
        await fetchUpdates(true);
    };

    return (
        <>
            <div className="flex flex-col gap-4">
                <Card>
                    <div className="p-4">
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={8} lg={8} xl={5} xxl={5}>
                                <Input
                                    prefix={<SearchOutlined/>}
                                    placeholder={appString.searchHint}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    style={{width: "100%"}}
                                />
                            </Col>
                            <Col xs={0} sm={0} md={8} lg={8} xl={0} xxl={5}/>
                            <Col xs={24} sm={12} md={8} lg={8} xl={5} xxl={4}>
                                <UserSelect users={activeUsersData} value={filters.userId} onChange={(key) =>
                                    setFilters((prev) => ({...prev, userId: key}))
                                }/>
                            </Col>
                            <Col xs={12} sm={8} md={8} lg={8} xl={4} xxl={3}>
                                <DatePicker
                                    allowClear
                                    placeholder={appString.startDate}
                                    value={filters.startDate}
                                    onChange={(val) => setFilters((prev) => ({...prev, startDate: val}))}
                                    style={{width: "100%"}}
                                />
                            </Col>
                            <Col xs={12} sm={8} md={8} lg={8} xl={4} xxl={3}>
                                <DatePicker
                                    allowClear
                                    placeholder={appString.endDate}
                                    value={filters.endDate}
                                    onChange={(val) => setFilters((prev) => ({...prev, endDate: val}))}
                                    style={{width: "100%"}}
                                />
                            </Col>
                            <Col xs={12} sm={4} md={4} lg={4} xl={3} xxl={2}>
                                <Button type="primary" onClick={handleFilterChange}
                                        icon={<PenTool/>}
                                        style={{width: "100%"}}>
                                    Apply
                                </Button>
                            </Col>
                            <Col xs={12} sm={4} md={4} lg={4} xl={3} xxl={2}>
                                <Button
                                    icon={<ReloadOutlined/>}
                                    onClick={handleResetFilters}
                                    style={{width: "100%"}}
                                >

                                    Reset
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
                        <Empty/>
                    ) : (
                        <Masonry
                            breakpointCols={breakpointColumnsObj}
                            className="my-masonry-grid flex gap-4"
                            columnClassName="my-masonry-grid_column"
                        >
                            {filteredData.map((item) => (
                                <Card
                                    key={item._id}
                                    hoverable
                                    style={{ marginBottom: 16 }}
                                    title={
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                src={item.user?.profilePhoto}
                                                icon={<UserOutlined />}
                                                size="default"
                                            />
                                            <div>
                                                <div className="font-semibold">{item.user?.fullName}</div>
                                                <div className="text-gray-500 text-sm font-medium">
                                                    {dayjs(item.createdAt).format('DD MMM YYYY')}
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    bodyStyle={{ padding: 16 }}
                                >
                                    <div className="mb-3">
                                        <strong>Today:</strong>
                                        <div className="text-gray-700">{item.todayWorkUpdate}</div>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Tomorrow:</strong>
                                        <div className="text-gray-700">{item.tomorrowPlanning}</div>
                                    </div>
                                    {item.similarTasks && item.similarTasks.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-semibold text-blue-600 mb-2">🧠 Similar Tasks Detected</h4>
                                            <div className="space-y-3">
                                                {item.similarTasks.map((sim, index) => (
                                                    <div
                                                        key={index}
                                                        className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm shadow-sm"
                                                    >
                                                        <div className="flex flex-col gap-1">
                                                            <div className="font-medium text-gray-800">
                                                                📝 Task A: <span className="block text-gray-700 ml-2">{sim.task}</span>
                                                            </div>
                                                            <div className="font-medium text-gray-800">
                                                                📝 Task B: <span className="block text-gray-700 ml-2">{sim.similarWith}</span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 text-xs text-gray-500">
                                                            Similarity: <span className="font-semibold">{sim.similarity}</span> | Compared Date:{" "}
                                                            <span className="italic">{dayjs(sim.comparedDate).format("DD MMM YYYY")}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </Masonry>
                    )}
                </div>
            </div>
        </>
    );
}
