'use client';

import {Avatar, Button, Card, Col, Empty, List, Row} from "antd";
import {appColor} from "../../../utils/appColor";
import {
    ClockCircleOutlined,
    CaretRightOutlined,
    PauseOutlined,
} from "@ant-design/icons";
import appString from "../../../utils/appString";
import {useState} from "react";
import {AlertTriangle, Bell, Clock, Watch} from "../../../utils/icons";

export default function CardNoticeBoard() {

    const [notices, setNotices] = useState([]);

    return (
        <Card title={
            (
                <div className="flex items-center gap-2">
                    <Bell color={appColor.warning} />
                    <div className="font-[550] text-[15px]">{appString.noticeBoard}</div>
                </div>
            )
        }>
            {/*<div className="max-h-[160px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>*/}
            <div className="h-[300px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                <Empty className="m-[15px]" />
                {/*{notices ? <List*/}
                {/*    dataSource={[]}*/}
                {/*    renderItem={(item, index) => (*/}
                {/*        <List.Item style={{padding: 10, cursor: "pointer"}}>*/}
                {/*            <List.Item.Meta*/}
                {/*                description={(*/}
                {/*                    <div className="flex flex-row items-center gap-3">*/}
                {/*                        <div className="border-[1px] border-gray-200 rounded-xl p-2">*/}
                {/*                            <Watch color={appColor.danger}/>*/}
                {/*                        </div>*/}
                {/*                        <div className="flex-1 flex flex-col">*/}
                {/*                            <div className="text-gray-900 text-[14px] font-medium">{item.time}</div>*/}
                {/*                            <div className="text-gray-500 text-[12px]">Early Out Time</div>*/}
                {/*                        </div>*/}
                {/*                        <div className="text-gray-500 text-[12px]">{item.date}</div>*/}
                {/*                    </div>*/}
                {/*                )}*/}
                {/*            />*/}
                {/*        </List.Item>*/}
                {/*    )}*/}
                {/*/> : <Empty />}*/}
            </div>
        </Card>
    );
}