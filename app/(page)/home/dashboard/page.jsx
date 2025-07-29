'use client';

import {Col, Grid, Row} from "antd";
import CardClockInOut from "./CardClockInOut";
import CardLiveTracking from "./CardLiveTracking";
import CardTodayActivity from "./CardTodayActivity";
import CardDashboardCommon from "./CardDashboardCommon";
import CardGreeting from "./CardGreeting";
import CardEarlyOutReminder from "./CardEarlyOutReminder";
import CardNoticeBoard from "./CardNoticeBoard";
import CardEmpAttendanceReport from "./CardEmpAttendanceReport";
import {isAdmin} from "../../../dataStorage/DataPref";
import CardTodayReportPage from "../today-report/CardTodayReportPage";
import CardEmpList from "../employees/CardEmpList";
import CardTrackerClockInOut from "../../tracker/CardTrackerClockInOut";
import {useAppData} from "../../../masterData/AppDataContext";

export default function Page() {

    const {attendancesData} = useAppData();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - 1;

    const todayRecords = !isAdmin() ? attendancesData.find(record => {
        return record.punchInAt >= startOfToday && record.punchInAt <= endOfToday;
    }) : null;

    return (
        <div className="flex flex-col gap-5 mt-3">
            <CardGreeting />
            <CardDashboardCommon />
            {!isAdmin() && <Row gutter={[16, 16]}>
                <Col xs={24} md={12} lg={12} xl={12} xxl={6}>
                    {/*<CardClockInOut/>*/}
                    <CardTrackerClockInOut isDashboard={true} todayRecords={todayRecords}/>
                </Col>
                <Col xs={24} md={12} lg={12} xl={12} xxl={6}>
                    <CardTodayActivity todayRecords={todayRecords}/>
                </Col>
                <Col xs={24} md={12} lg={12} xl={12} xxl={6}>
                    <CardNoticeBoard/>
                    {/*<Row gutter={[16, 16]}>*/}
                    {/*    <Col span={24}>*/}
                    {/*        <CardLiveTracking/>*/}
                    {/*    </Col>*/}
                    {/*    <Col span={24}>*/}
                    {/*        <CardNoticeBoard/>*/}
                    {/*    </Col>*/}
                    {/*</Row>*/}
                </Col>
                <Col xs={24} md={12} lg={12} xl={12} xxl={6}>
                    <CardEarlyOutReminder/>
                </Col>
                {/*<Col xs={24} md={24} lg={24} xl={16} xxl={12}>*/}
                {/*    <CardEmpLeaveReport />*/}
                {/*</Col>*/}
                {/*<Col xs={24} md={24} lg={24} xl={24} xxl={24}>*/}
                {/*    <CardEmpAttendanceReport />*/}
                {/*</Col>*/}
            </Row>}
            {isAdmin() && <CardEmpList isDashboard={true} />}
            {isAdmin() ? <CardTodayReportPage /> : <CardEmpAttendanceReport/>}
        </div>
    );
}