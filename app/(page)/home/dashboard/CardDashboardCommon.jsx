'use client';

import {Card, Col, Row} from "antd";
import {appColor, getDarkColor, getTransColor} from "../../../utils/appColor";
import {
    UserOutlined,
    SmileOutlined,
    GithubOutlined,
    UserDeleteOutlined,
    UserAddOutlined,
    ClockCircleOutlined,
    FieldTimeOutlined,
    HistoryOutlined,
    FallOutlined,
} from "@ant-design/icons";
import {isAdmin} from "../../../dataStorage/DataPref";
import {useAppData} from "../../../masterData/AppDataContext";

export default function CardDashboardCommon() {

    const {dashboardData} = useAppData();

    const CommonGridBox = ({title, value, color, icon}) => {
        return (
            <Col xs={24} sm={12} md={12} lg={8} xl={4}>
                <Card>
                    <div className="flex items-center gap-3 p-4">
                        <div className="w-9 h-9 min-w-9 min-h-9 rounded-full flex justify-center items-center"
                             style={{backgroundColor: getTransColor(color)}}>
                            {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[17px] font-medium" style={{color: appColor.primary}}>{value}</div>
                            <div className="text-[13px] text-gray-500 truncate" title={title}>{title}</div>
                        </div>
                    </div>
                </Card>
            </Col>
        );
    }

    if(isAdmin()) {
        return (
            <Row gutter={[16, 16]}>
                <CommonGridBox
                    title="Total Employees"
                    value={dashboardData?.employeeUsers || 0}
                    color="A"
                    icon={<UserOutlined style={{color: getDarkColor("A"), fontSize: 18}}/>}/>
                <CommonGridBox
                    title="Total Admins"
                    value={dashboardData?.adminUsers || 0}
                    color="V"
                    icon={<UserOutlined style={{color: getDarkColor("V"), fontSize: 18}}/>}/>
                <CommonGridBox
                    title="Today Present"
                    value={dashboardData?.todayPresent || 0}
                    color="C"
                    icon={<UserAddOutlined style={{color: getDarkColor("C"), fontSize: 18}}/>}/>
                <CommonGridBox
                    title="Today Absent"
                    value={dashboardData?.todayAbsent || 0}
                    color="D"
                    icon={<UserDeleteOutlined style={{color: getDarkColor("D"), fontSize: 18}}/>}/>
                <CommonGridBox
                    title="No. Of Clients"
                    value={dashboardData?.noOfClients || 0}
                    color="E"
                    icon={<SmileOutlined style={{color: getDarkColor("E"), fontSize: 18}}/>}/>
                <CommonGridBox
                    title="No. Of Projects"
                    value={dashboardData?.noOfProjects || 0}
                    color="F"
                    icon={<GithubOutlined style={{color: getDarkColor("F"), fontSize: 18}}/>}/>
            </Row>
        );
    }

    return (
        <Row gutter={[16, 16]}>
            <CommonGridBox
                title="Today Working Hours"
                value={dashboardData?.todayWorkingHours || 0}
                color="A"
                icon={<ClockCircleOutlined style={{color: getDarkColor("A"), fontSize: 18}}/>}/>
            <CommonGridBox
                title="Weekly Hours"
                value={dashboardData?.weeklyHours || 0}
                color="V"
                icon={<HistoryOutlined style={{color: getDarkColor("V"), fontSize: 18}}/>}/>
            <CommonGridBox
                title="Monthly Hours"
                value={dashboardData?.monthlyHours || 0}
                color="C"
                icon={<FieldTimeOutlined style={{color: getDarkColor("C"), fontSize: 18}}/>}/>
            <CommonGridBox
                title="Monthly Late Arrival"
                value={dashboardData?.monthlyLateArrivalHours || 0}
                color="D"
                icon={<FallOutlined style={{color: getDarkColor("D"), fontSize: 18}}/>}/>
            <CommonGridBox
                title="Monthly Overtime Hours"
                value={dashboardData?.monthlyOvertimeHours || 0}
                color="E"
                icon={<SmileOutlined style={{color: getDarkColor("E"), fontSize: 18}}/>}/>
            <CommonGridBox
                title="Monthly Absent Count"
                value={dashboardData?.monthlyAbsentCount || 0}
                color="F"
                icon={<UserDeleteOutlined style={{color: getDarkColor("F"), fontSize: 18}}/>}/>
        </Row>
    );
}