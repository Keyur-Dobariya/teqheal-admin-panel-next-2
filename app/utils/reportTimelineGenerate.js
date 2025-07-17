import appString from "./appString";
import {LoginOutlined, LogoutOutlined, SmileOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {Coffee, Monitor} from "./icons";
import React from "react";

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

export const convertToTimeline = (data, appColor) => {
    const timeline = [];

    data?.punchTime?.forEach((item) => {
        if (item.punchInTime) {
            timeline.push({
                type: appString.clockIn,
                timestamp: item.punchInTime,
                color: appColor.secondPrimary,
                dot: <CommonTimelineIcon icon={<LoginOutlined style={{fontSize: '16px'}}/>}/>,
                children: (
                    <CommonTimelineContent
                        time={dayjs(item.punchInTime).format('hh:mm A')}
                        content={appString.clockIn}
                        icon={<Monitor size={14}/>}
                    />
                ),
            });
        }

        if (item.punchOutTime) {
            timeline.push({
                type: appString.clockOut,
                timestamp: item.punchOutTime,
                color: appColor.secondPrimary,
                dot: <CommonTimelineIcon icon={<LogoutOutlined rotate={180} style={{fontSize: '16px'}}/>}/>,
                children: (
                    <CommonTimelineContent
                        time={dayjs(item.punchOutTime).format('hh:mm A')}
                        content={appString.clockOut}
                        icon={<Monitor size={14}/>}
                    />
                ),
            });
        }
    });

    data?.breakTime?.forEach((item) => {
        if (item.breakInTime) {
            timeline.push({
                type: appString.breakIn,
                timestamp: item.breakInTime,
                color: appColor.danger,
                dot: <CommonTimelineIcon icon={<Coffee size={16}/>}/>,
                children: (
                    <CommonTimelineContent
                        time={dayjs(item.breakInTime).format('hh:mm A')}
                        content={appString.breakIn}
                        icon={<SmileOutlined/>}
                    />
                ),
            });
        }

        if (item.breakOutTime) {
            timeline.push({
                type: appString.breakOut,
                timestamp: item.breakOutTime,
                color: appColor.danger,
                dot: <CommonTimelineIcon icon={<Coffee size={16}/>}/>,
                children: (
                    <CommonTimelineContent
                        time={dayjs(item.breakOutTime).format('hh:mm A')}
                        content={appString.breakOut}
                        icon={<SmileOutlined/>}
                    />
                ),
            });
        }
    });

    timeline.sort((a, b) => a.timestamp - b.timestamp).reverse();

    if (timeline.length > 0) {
        const last = timeline.length - 1;
        timeline[last] = {
            ...timeline[last],
            children: React.cloneElement(timeline[last].children, {
                marginBottom: '0px'
            }),
        };
    }

    return timeline.map(({timestamp, ...rest}) => rest);
};