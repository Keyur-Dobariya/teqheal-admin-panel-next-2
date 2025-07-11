'use client';

import {Button, Card, Col, Row} from "antd";
import {appColor} from "../../../utils/appColor";
import {
    ClockCircleOutlined,
    DashboardOutlined,
    CaretRightOutlined,
    PauseOutlined,
} from "@ant-design/icons";
import appString from "../../../utils/appString";
import {useState} from "react";

export default function CardLiveTracking() {

    const [isTrackingOn, setIsTrackingOn] = useState(false);

    return (
        <Card title={(
            <div className="flex items-center gap-2">
                <DashboardOutlined style={{color: appColor.secondPrimary, fontSize: "16px"}}/>
                <div className="font-[550] text-[15px]">{appString.liveTracking}</div>
            </div>
        )}>
            <div className="flex flex-col gap-4 p-4">
                <Row gutter={[16, 16]}>
                    <Col span={11}>
                        <Button className="w-full" color="geekblue" variant="filled"
                                icon={<ClockCircleOutlined/>}>00:00:00</Button>
                    </Col>
                    <Col span={13}>
                        <Button className="w-full" color="green"
                                variant={isTrackingOn ? "solid" : "outlined"}
                                icon={isTrackingOn ? <PauseOutlined/> : <CaretRightOutlined/>}
                                onClick={() => {
                                    setIsTrackingOn(!isTrackingOn);
                                }}>
                            {isTrackingOn ? appString.stopTracking : appString.startTracking}
                        </Button>
                    </Col>
                </Row>
            </div>
        </Card>
    );
}