'use client';

import {Avatar, Button, Card, Col, List, Row} from "antd";
import {appColor} from "../../../utils/appColor";
import {
    ClockCircleOutlined,
    CaretRightOutlined,
    PauseOutlined,
} from "@ant-design/icons";
import appString from "../../../utils/appString";
import {useState} from "react";
import {AlertTriangle, Clock, Watch} from "../../../utils/icons";

export default function CardEarlyOutReminder() {

    const data = [
        {
            time: '01h:00m',
            date: '01 Jan, 2025',
        },
        {
            time: '02h:15m',
            date: '03 Jan, 2025',
        },
        {
            time: '01h:15m',
            date: '05 Jan, 2025',
        },
        {
            time: '00h:45m',
            date: '15 Jan, 2025',
        },
        {
            time: '00h:20m',
            date: '23 Jan, 2025',
        },
    ];

    return (
        <Card title={
            (
                <div className="flex items-center gap-2">
                    <AlertTriangle color={appColor.danger} />
                    <div className="font-[550] text-[15px]">{appString.earlyOutReminder}</div>
                    <div className="w-[21px] h-[21px] shadow-sm bg-gray-50/50 border-[1px] border-gray-200 rounded-md text-center text-sm">
                        5
                    </div>
                </div>
            )
        }>
            <div className="max-h-[300px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                <List
                    dataSource={data}
                    renderItem={(item, index) => (
                        <List.Item style={{ padding: 10, cursor: "pointer" }}>
                            <List.Item.Meta
                                description={(
                                    <div className="flex flex-row items-center gap-3">
                                        <div className="border-[1px] border-gray-200 rounded-xl p-2">
                                            <Watch color={appColor.danger}/>
                                        </div>
                                        <div className="flex-1 flex flex-col">
                                            <div className="text-gray-900 text-[14px] font-medium">{item.time}</div>
                                            <div className="text-gray-500 text-[12px]">Early Out Time</div>
                                        </div>
                                        <div className="text-gray-500 text-[12px]">{item.date}</div>
                                    </div>
                                )}
                            />
                        </List.Item>
                    )}
                />
            </div>
        </Card>
    );
}