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
import CardEmpLeaveReport from "./CardEmpLeaveReport";

export default function Page() {
    return (
        <div className="flex flex-col gap-5">
            <CardGreeting />
            <CardDashboardCommon />
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12} lg={12} xl={8} xxl={6}>
                    <CardClockInOut />
                </Col>
                <Col xs={24} md={12} lg={12} xl={8} xxl={6}>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <CardLiveTracking />
                        </Col>
                        <Col span={24}>
                            <CardNoticeBoard />
                        </Col>
                    </Row>
                </Col>
                <Col xs={24} md={12} lg={12} xl={8} xxl={6}>
                    <CardTodayActivity />
                </Col>
                <Col xs={24} md={12} lg={12} xl={8} xxl={6}>
                    <CardEarlyOutReminder />
                </Col>
                {/*<Col xs={24} md={24} lg={24} xl={16} xxl={12}>*/}
                {/*    <CardEmpLeaveReport />*/}
                {/*</Col>*/}
                <Col xs={24} md={24} lg={24} xl={16} xxl={24}>
                    <CardEmpAttendanceReport />
                </Col>
            </Row>
        </div>
    );
}