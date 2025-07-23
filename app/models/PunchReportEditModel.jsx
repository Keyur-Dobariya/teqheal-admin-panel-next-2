'use client'

import React, {useEffect, useRef, useState} from "react";
import {Card, Col, Form, Input, Modal, Row, Select, TimePicker} from "antd";

import appString from "../utils/appString";
import {endpoints} from "../api/apiEndpoints";
import apiCall, {HttpMethod} from "../api/apiServiceProvider";
import appKeys from "../utils/appKeys";
import dayjs from "dayjs";
import {Compass, User} from "../utils/icons";
import appColor from "../utils/appColor";

export default function PunchReportEditModel({
                                             isModelOpen,
                                             setIsModelOpen,
                                             selectedRecord,
                                             onSuccessCallback,
                                         }) {
    const [punchReportData, setPunchReportData] = useState(selectedRecord);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef(null);
    const isEditing = !!selectedRecord;
    const modelTitle = appString.updatePunchReport;

    useEffect(() => {
        if (isModelOpen) {
            setPunchReportData(selectedRecord);
        }
    }, [isModelOpen, isEditing, selectedRecord]);

    const handleCancel = () => {
        setIsModelOpen(false);
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    };

    const generateUpdatedPunchJson = () => {
        const punchList = [];

        for (let i = 0; i < 9; i++) {
            const inKey = `punchIn${i + 1}`;
            const outKey = `punchOut${i + 1}`;

            const originalIn = selectedRecord[inKey] || "";
            const originalOut = selectedRecord[outKey] || "";
            const currentIn = punchReportData[inKey] || "";
            const currentOut = punchReportData[outKey] || "";

            if (currentIn && currentIn !== originalIn) {
                punchList.push({
                    type: `In${i + 1}`,
                    time: currentIn,
                });
            }

            if (currentOut && currentOut !== originalOut) {
                punchList.push({
                    type: `Out${i + 1}`,
                    time: currentOut,
                });
            }
        }

        return {
            user: punchReportData.userId,
            punchReport: {
                date: punchReportData.date,
                punchList,
                status: punchReportData.status,
                workingHours: punchReportData.workingHours,
                missingHours: punchReportData.missingHours,
            },
        };
    };

    const handleAddUpdateRecord = async () => {
        try {
            await apiCall({
                method: HttpMethod.POST,
                url: `${endpoints.updatePunchReports}${selectedRecord._id}`,
                data: generateUpdatedPunchJson(),
                setIsLoading: setIsLoading,
                successCallback: (data) => {
                    setIsModelOpen(false);
                    onSuccessCallback(data);
                },
            });
        } catch (error) {
            console.error("Form validation/API call failed:", error);
        }
    };

    const getDisabledTimeConfig = (previousTimeString) => {
        if (!previousTimeString) return {};
        const previous = dayjs(previousTimeString, "HH:mm");

        return {
            disabledHours: () => Array.from({length: 24}, (_, i) => i).filter(h => h < previous.hour()),
            disabledMinutes: (selectedHour) => {
                if (selectedHour === previous.hour()) {
                    return Array.from({length: 60}, (_, i) => i).filter(m => m <= previous.minute());
                }
                return [];
            },
        };
    };

    return (
        <Modal
            title={<div className="font-medium text-base">{modelTitle}</div>}
            maskClosable={false}
            centered
            open={isModelOpen}
            width={700}
            onOk={handleAddUpdateRecord}
            onCancel={handleCancel}
            confirmLoading={isLoading}
            okText={modelTitle}
        >
            <div
                ref={containerRef}
                style={{maxHeight: "75vh", overflowY: "auto", scrollbarWidth: "none"}}
            >
                <Form layout="vertical">
                    <div className="flex flex-col gap-5 py-3">
                        <Card
                            title={(
                                <div className="flex items-center gap-2">
                                    <User color={appColor.secondPrimary} />
                                    <div>{appString.personalDetails}</div>
                                </div>
                            )}>
                            <div className="pt-4 px-4">
                                <Row gutter={16}>
                                    <Col xs={24} sm={12} md={8}>
                                        <Form.Item label={appString.userName}>
                                            <Input disabled value={punchReportData[appKeys.fullName]}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <Form.Item label={appString.empCode}>
                                            <Input disabled value={punchReportData[appKeys.empCode]}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <Form.Item label={appString.date}>
                                            <Input disabled value={punchReportData[appKeys.date]}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <Form.Item label={appString.workingHours}>
                                            <Input disabled value={punchReportData[appKeys.workingHours]}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <Form.Item label={appString.missingHours}>
                                            <Input placeholder="HH:MM" disabled value={punchReportData[appKeys.missingHours]}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <Form.Item label={appString.status}>
                                            <Select value={punchReportData[appKeys.status]}
                                                    onChange={(value) => setPunchReportData({
                                                        ...punchReportData,
                                                        status: value
                                                    })}>
                                                <Select.Option key="P" value="P">Present</Select.Option>
                                                <Select.Option key="A" value="A">Absent</Select.Option>
                                                <Select.Option key="P/2" value="P/2">Half-Day Present</Select.Option>
                                                <Select.Option key="WO" value="WO">Weekly Off</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        </Card>
                        <Card
                            title={(
                                <div className="flex items-center gap-2">
                                    <Compass color={appColor.danger} />
                                    <div>{appString.punchInfo}</div>
                                </div>
                            )}>
                            <div className="pt-4 px-4">
                                <Row gutter={16}>
                                    {Array.from({length: 9}).map((_, i) => {
                                        const punchInKey = `punchIn${i + 1}`;
                                        const punchOutKey = `punchOut${i + 1}`;
                                        const prevPunchOutKey = `punchOut${i}`;
                                        const prevPunchInKey = `punchIn${i}`;

                                        const isPunchInDisabled = i === 0 ? false : !punchReportData[prevPunchOutKey];
                                        const isPunchOutDisabled = !punchReportData[punchInKey];

                                        const prevTimeForIn = i === 0
                                            ? null
                                            : punchReportData[prevPunchOutKey];

                                        const prevTimeForOut = punchReportData[punchInKey];

                                        return (
                                            <React.Fragment key={i}>
                                                <Col xs={12} sm={6} md={6}>
                                                    <Form.Item label={`Punch-in ${i + 1}`}>
                                                        <TimePicker
                                                            format="HH:mm"
                                                            allowClear={true}
                                                            placeholder="Time"
                                                            disabled={isPunchInDisabled}
                                                            value={
                                                                punchReportData[punchInKey]
                                                                    ? dayjs(punchReportData[punchInKey], "HH:mm")
                                                                    : null
                                                            }
                                                            {...getDisabledTimeConfig(prevTimeForIn)}
                                                            onChange={(time, timeString) => {
                                                                setPunchReportData((prev) => {
                                                                    const updated = {...prev, [punchInKey]: timeString};
                                                                    if (!timeString) {
                                                                        for (let j = i; j < 9; j++) {
                                                                            updated[`punchIn${j + 1}`] = "";
                                                                            updated[`punchOut${j + 1}`] = "";
                                                                        }
                                                                    }
                                                                    return updated;
                                                                });
                                                            }}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={12} sm={6} md={6}>
                                                    <Form.Item label={`Punch-out ${i + 1}`}>
                                                        <TimePicker
                                                            format="HH:mm"
                                                            allowClear={true}
                                                            placeholder="Time"
                                                            disabled={isPunchOutDisabled}
                                                            value={
                                                                punchReportData[punchOutKey]
                                                                    ? dayjs(punchReportData[punchOutKey], "HH:mm")
                                                                    : null
                                                            }
                                                            {...getDisabledTimeConfig(prevTimeForOut)}
                                                            onChange={(time, timeString) => {
                                                                setPunchReportData((prev) => {
                                                                    const updated = {...prev, [punchOutKey]: timeString};
                                                                    if (!timeString) {
                                                                        updated[punchOutKey] = "";
                                                                        for (let j = i + 1; j < 9; j++) {
                                                                            updated[`punchIn${j + 1}`] = "";
                                                                            updated[`punchOut${j + 1}`] = "";
                                                                        }
                                                                    }
                                                                    return updated;
                                                                });
                                                            }}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </React.Fragment>
                                        );
                                    })}
                                </Row>
                            </div>
                        </Card>
                    </div>
                </Form>
            </div>
        </Modal>
    );
}
