'use client';

import {Card, Timeline} from "antd";
import {appColor} from "../../../utils/appColor";
import {
    SmileOutlined,
    LogoutOutlined,
    LoginOutlined,
    CoffeeOutlined,
} from "@ant-design/icons";
import appString from "../../../utils/appString";
import {Activity, Coffee} from "../../../utils/icons";

export default function CardTodayActivity() {

    const CommonTimelineIcon = ({icon}) => {
        return (
            <div
                className="flex mt-1 p-1 items-center justify-center rounded-full border-[1px] border-gray-200 bg-white">
                {icon}
            </div>
        );
    };

    const CommonTimelineContent = ({time, content, icon, marginBottom}) => {
        return (
            <div
                className="flex py-[6px] px-[10px] items-center justify-between rounded-lg border-[1px] border-gray-200 bg-gray-50/50"
                style={{marginBottom: marginBottom || "15px"}}>
                <div className="flex flex-col">
                    <div className="text-gray-900 text-[13px] font-medium">{time}</div>
                    <div className="text-gray-500 text-[12px]">{content}</div>
                </div>
                {icon}
            </div>
        );
    };

    return (
        <Card title={(
            <div className="flex items-center gap-2">
                <Activity color={appColor.success}/>
                <div className="font-[550] text-[15px]">{appString.todayActivity}</div>
            </div>
        )} styles={{ body: { padding: 0 } }}>
            <div className="h-[300px] overflow-y-auto p-[12px]" style={{ scrollbarWidth: "none" }}>
                <Timeline
                    style={{margin: "10px 5px 0 10px"}}
                    items={[
                        {
                            color: appColor.secondPrimary,
                            dot: (
                                <CommonTimelineIcon
                                    icon={<LoginOutlined style={{fontSize: '16px'}}/>}/>
                            ),
                            children: (
                                <CommonTimelineContent time={"09:30 AM"} content={"Clock In"}
                                                       icon={<SmileOutlined/>}/>
                            ),
                        },
                        {
                            color: appColor.danger,
                            dot: (
                                <CommonTimelineIcon
                                    icon={<Coffee size={16} />}/>
                            ),
                            children: (
                                <CommonTimelineContent time={"01:00 PM"} content={"Break In"}
                                                       icon={<SmileOutlined/>}/>
                            ),
                        },
                        {
                            color: appColor.danger,
                            dot: (
                                <CommonTimelineIcon
                                    icon={<Coffee size={16} />}/>
                            ),
                            children: (
                                <CommonTimelineContent time={"01:45 PM"} content={"Break Out"}
                                                       icon={<SmileOutlined/>}/>
                            ),
                        },
                        {
                            color: appColor.secondPrimary,
                            dot: (
                                <CommonTimelineIcon icon={<LogoutOutlined rotate={180}
                                                                          style={{fontSize: '16px'}}/>}/>
                            ),
                            children: (
                                <CommonTimelineContent time={"06:30 PM"} content={"Clock Out"}
                                                       marginBottom={"0px"}
                                                       icon={<SmileOutlined/>}/>
                            ),
                        },
                    ]}
                />
            </div>
        </Card>
    );
}