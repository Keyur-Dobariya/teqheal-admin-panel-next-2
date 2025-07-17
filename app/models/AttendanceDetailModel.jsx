'use client'

import React, {useState, useRef} from "react";
import {
    Card,
    Col,
    Modal,
    Row, List, Timeline, Grid, Button, Popconfirm
} from "antd";
import appString from "../utils/appString";
import {formatMilliseconds} from "../utils/utils";
import {
    Activity,
    Fingerprint, Monitor,
} from "../utils/icons";
import appColor from "../utils/appColor";
import {timeTag} from "../components/CommonComponents";
import {format} from 'date-fns';
import {convertToTimeline} from "../utils/reportTimelineGenerate";
import {DeleteOutlined} from "@ant-design/icons";
import {deleteScreenShot} from "../api/apiUtils";

const {useBreakpoint} = Grid;

export default function AttendanceDetailModel({
                                                  isModelOpen,
                                                  setIsModelOpen,
                                                  selectedAttendance,
                                              }) {
    const [screenshots, setScreenshots] = useState(selectedAttendance?.screenshots);

    const containerRef = useRef(null);

    const screens = useBreakpoint();

    const boxHeight = '[345px]';
    const contentHeight = screens.md ? boxHeight : 'auto';
    const smDevice = screens.sm;
    const [loading, setLoading] = useState(false);

    const handleCancel = () => {
        setIsModelOpen(false);
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    };

    const timeFormater = (time) => {
        return time ? formatMilliseconds(time) : "00:00:00";
    }

    const timelineData = convertToTimeline(selectedAttendance, appColor);

    return (
        <Modal
            title={(
                <div className="text-base">{appString.attendanceDetail}</div>
            )}
            maskClosable={false}
            centered
            open={isModelOpen}
            footer={null}
            width={800}
            onCancel={handleCancel}
        >
            <div
                ref={containerRef}
                className="mt-5 flex flex-col gap-4"
                style={{maxHeight: "75vh", overflowY: "auto", scrollbarWidth: "none"}}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <Card
                            title={(
                                <div className="flex items-center gap-2">
                                    <Fingerprint color={appColor.secondPrimary}/>
                                    <div className="w-full flex items-center justify-between gap-2">
                                        <div className="text-[15px] font-medium">{appString.profileDetails}</div>
                                        <div
                                            className="text-[13px] text-gray-600 font-medium">{format(new Date(selectedAttendance.createdAt), 'dd MMMM, yyyy')}</div>
                                    </div>
                                </div>
                            )}
                            styles={{body: {padding: 0}}}>
                            <div className={`h-${contentHeight} overflow-y-auto`} style={{scrollbarWidth: "none"}}>
                                <List
                                    dataSource={[
                                        {
                                            label: appString.punchInAt,
                                            value: selectedAttendance.punchInAt,
                                            color: 'purple',
                                            isTime: true
                                        },
                                        {
                                            label: appString.totalHours,
                                            value: selectedAttendance.totalHours,
                                            color: 'geekblue'
                                        },
                                        {
                                            label: appString.workingHours,
                                            value: selectedAttendance.workingHours,
                                            color: 'green'
                                        },
                                        {label: appString.breakHours, value: selectedAttendance.breakHours, color: 'red'},
                                        {
                                            label: appString.lateArrival,
                                            value: selectedAttendance.lateArrival,
                                            color: 'orange'
                                        },
                                        {label: appString.overtime, value: selectedAttendance.overtime, color: 'purple'},
                                    ]}
                                    renderItem={(item) => (
                                        <List.Item className="flex justify-between items-center">
                                            <div className="text-[15px]">{item.label}</div>
                                            <div>
                                                {timeTag(
                                                    item.isTime ? format(new Date(item.value), 'hh:mm a') : timeFormater(item.value), item.color)}
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Card
                            title={(
                                <div className="flex items-center gap-2">
                                    <Activity color={appColor.success}/>
                                    <div className="font-[550] text-[15px]">{appString.todayActivity}</div>
                                </div>
                            )}
                            styles={{body: {padding: 0}}}>
                            <div className={`h-${contentHeight} overflow-y-auto p-[12px]`}
                                 style={{scrollbarWidth: "none"}}>
                                <Timeline
                                    style={{margin: "10px 5px 0 10px"}}
                                    items={timelineData}
                                />
                            </div>
                        </Card>
                    </Col>
                </Row>
                <Card
                    title={(
                        <div className="flex items-center gap-2">
                            <Monitor color={appColor.danger}/>
                            <div className={`w-full flex justify-between items-center gap-2`}>
                                <div className="text-[15px] font-medium">{appString.screenshots}</div>
                                {smDevice && <div className="text-[13px] text-blue-800 font-medium">
                                    {`${selectedAttendance?.keyPressCount ?? 0} keyboard hits  •  ${selectedAttendance?.mouseEventCount ?? 0} mouse clicks`}
                                </div>}
                            </div>
                        </div>
                    )}
                >
                    <div className="flex flex-col w-full gap-4 p-4">
                        {!smDevice &&
                            <Card style={{borderColor: appColor.secondPrimary, backgroundColor: appColor.blueCardBg}}>
                                <div className="text-[13px] text-blue-800 font-medium text-center p-1">
                                    {`${selectedAttendance?.keyPressCount ?? 0} keyboard hits  •  ${selectedAttendance?.mouseEventCount ?? 0} mouse clicks`}
                                </div>
                            </Card>}
                        <Row gutter={[16, 16]}>
                            {screenshots?.map((screenshot) => (
                                <Col xs={24} sm={12} md={8} key={screenshot._id}>
                                    <Card
                                        style={{position: 'relative', overflow: 'hidden'}}
                                        styles={{body: {padding: 10}}}
                                    >
                                        <img
                                            className="w-full h-auto rounded-md"
                                            src={screenshot.image}
                                            alt="Screenshot"
                                        />
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="text-[12px] text-gray-700">
                                                <div>{`Keyboard: ${screenshot.keyPressCount} hits`}</div>
                                                <div>{`Mouse: ${screenshot.mouseEventCount} clicks`}</div>
                                                <div>{`Captured: ${new Date(screenshot.capturedTime).toLocaleString()}`}</div>
                                            </div>
                                            <Popconfirm
                                                title={appString.deleteConfirmation}
                                                onConfirm={() => deleteScreenShot(selectedAttendance._id, screenshot._id, setLoading, (data) => {
                                                    const updatedScreenshotsData = screenshots.filter(
                                                        (item) => item._id !== screenshot._id
                                                    );
                                                    setScreenshots(updatedScreenshotsData);
                                                })}
                                            >
                                                <Button
                                                    icon={<DeleteOutlined/>}
                                                    danger
                                                    size="small"
                                                    shape="circle"
                                                    style={{position: 'absolute', top: 15, right: 15}}
                                                />
                                            </Popconfirm>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </Card>
            </div>
        </Modal>
    );
}
