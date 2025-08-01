'use client';

import {Grid, Tabs} from "antd";
import {Clock, FileText, Settings} from "../../../utils/icons";
import {CardAppSetting} from "./CardAppSetting";
import appString from "../../../utils/appString";
import {useAppData} from "../../../masterData/AppDataContext";
import {CardDailyTime} from "./CardDailyTime";
import {CardOfficeUpdates} from "./CardOfficeUpdates";

const {useBreakpoint} = Grid;

export default function Page() {
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const tabKeys = {
        appSetting: appString.appSetting,
        dailyTime: appString.dailyTime,
        officeUpdates: appString.officeUpdates,
    }

    const tabItems = [
        {
            key: tabKeys.appSetting,
            label: (
                <span className="inline-flex items-center gap-2"><Settings/>{appString.appSetting}</span>
            ),
            children: <CardAppSetting isMobile={isMobile}/>,
        },
        {
            key: tabKeys.dailyTime,
            label: (
                <span className="inline-flex items-center gap-2"><Clock/>{appString.dailyTime}</span>
            ),
            children: <CardDailyTime isMobile={isMobile}/>,
        },
        {
            key: tabKeys.officeUpdates,
            label: (
                <span className="inline-flex items-center gap-2"><FileText/>{appString.officeUpdates}</span>
            ),
            children: <CardOfficeUpdates isMobile={isMobile}/>,
        },
    ];

    return (
        <Tabs size="small" defaultActiveKey={tabKeys.appSetting} items={tabItems}/>
    );
}