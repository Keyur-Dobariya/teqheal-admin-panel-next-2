import {pageRoutes} from "../../../utils/pageRoutes";
import {
    AndroidOutlined,
    ApartmentOutlined, AuditOutlined, CalendarOutlined, CarryOutOutlined,
    CodeSandboxOutlined, CommentOutlined,
    DollarOutlined,
    HomeOutlined, PoweroffOutlined, SettingOutlined,
    StockOutlined,
    TeamOutlined,
    UserOutlined, WalletOutlined
} from "@ant-design/icons";
import {capitalizeLastPathSegment} from "../../../utils/utils";
import {getLocalData, isAdmin} from "../../../dataStorage/DataPref";
import {ChevronRight, FileText, Power, Settings} from "../../../utils/icons";
import appString from "../../../utils/appString";
import appKeys from "../../../utils/appKeys";
import appColor from "../../../utils/appColor";
import {ConfigProvider, Menu} from "antd";

const menuItems = [
    {
        key: pageRoutes.dashboard,
        icon: <HomeOutlined />,
        label: capitalizeLastPathSegment(pageRoutes.dashboard),
        position: 'top',
    },
    {
        key: 'emp',
        icon: <UserOutlined />,
        hidden: !isAdmin(),
        label: capitalizeLastPathSegment(pageRoutes.employees),
        position: 'top',
        children: [
            {
                key: pageRoutes.employees,
                icon: <TeamOutlined />,
                label: capitalizeLastPathSegment(pageRoutes.employees),
            },
            {
                key: pageRoutes.todayReport,
                icon: <StockOutlined />,
                label: capitalizeLastPathSegment(pageRoutes.todayReport),
            },
            {
                key: pageRoutes.basicSalary,
                icon: <DollarOutlined />,
                label: capitalizeLastPathSegment(pageRoutes.basicSalary),
            },
        ],
    },
    {
        key: pageRoutes.client,
        icon: <TeamOutlined />,
        label: capitalizeLastPathSegment(pageRoutes.client),
        position: 'top',
    },
    {
        key: pageRoutes.project,
        icon: <CodeSandboxOutlined />,
        label: capitalizeLastPathSegment(pageRoutes.project),
        position: 'top',
    },
    {
        key: pageRoutes.tasks,
        icon: <ApartmentOutlined />,
        label: capitalizeLastPathSegment(pageRoutes.tasks),
        position: 'top',
    },
    {
        key: pageRoutes.dailyUpdate,
        icon: <FileText />,
        label: capitalizeLastPathSegment(pageRoutes.dailyUpdate),
        hidden: !isAdmin(),
        position: 'top',
    },
    {
        key: pageRoutes.leave,
        icon: <CarryOutOutlined />,
        label: capitalizeLastPathSegment(pageRoutes.leave),
        position: 'top',
    },
    {
        key: 'rep',
        icon: <AuditOutlined />,
        label: capitalizeLastPathSegment(appString.report),
        position: 'top',
        children: [
            {
                key: pageRoutes.leaveReport,
                icon: <AuditOutlined />,
                label: capitalizeLastPathSegment(pageRoutes.leaveReport),
            },
            {
                key: pageRoutes.punchReport,
                icon: <CodeSandboxOutlined />,
                hidden: !isAdmin(),
                label: capitalizeLastPathSegment(pageRoutes.punchReport),
            },
            {
                key: pageRoutes.salaryReport,
                icon: <WalletOutlined />,
                label: capitalizeLastPathSegment(pageRoutes.salaryReport),
            },
        ]
    },
    {
        key: pageRoutes.calendar,
        icon: <CalendarOutlined />,
        label: capitalizeLastPathSegment(pageRoutes.calendar),
        position: 'top',
    },
    {
        key: pageRoutes.chatting,
        icon: <CommentOutlined />,
        label: capitalizeLastPathSegment(pageRoutes.chatting),
        position: 'top',
    },
    {
        key: pageRoutes.appUpdate,
        icon: <AndroidOutlined />,
        label: capitalizeLastPathSegment(pageRoutes.appUpdate),
        hidden: !isAdmin(),
        position: 'top',
    },
    // {
    //     key: pageRoutes.application,
    //     icon: <AndroidOutlined />,
    //     label: capitalizeLastPathSegment(pageRoutes.application),
    //     hidden: !isAdmin(),
    //     position: 'top',
    // },
    {
        key: pageRoutes.myProfile,
        icon: <UserOutlined />,
        label: capitalizeLastPathSegment(pageRoutes.myProfile),
        position: 'bottom',
    },
    {
        key: pageRoutes.settings,
        icon: <SettingOutlined />,
        hidden: !isAdmin(),
        label: capitalizeLastPathSegment(pageRoutes.settings),
        position: 'bottom',
    },
    {
        key: appKeys.logout,
        icon: <PoweroffOutlined style={{ color: appColor.danger }} />,
        label: capitalizeLastPathSegment(appKeys.logout),
        position: 'bottom',
    },
];

const topItems = menuItems.filter(item => item.position !== 'bottom');
const bottomItems = menuItems.filter(item => item.position === 'bottom');

const profileMenuItems = [
    {
        key: pageRoutes.myProfile,
        label: (
            <div className="flex items-center">
                <div className="flex-1">
                    <div className="text-gray-900 text-[15px]">
                        {getLocalData(appKeys.fullName)}
                    </div>
                    <div className="text-gray-600 text-[13px]">
                        {getLocalData(appKeys.emailAddress)}
                    </div>
                </div>
                <ChevronRight />
            </div>
        ),
    },
    { type: 'divider' },
    ...(isAdmin()
            ? [
                {
                    label: "Settings",
                    key: pageRoutes.settings,
                    icon: <Settings />,
                },
                { type: 'divider' },
            ]
            : []
    ),
    {
        label: (
            <div className="flex items-center gap-2 text-red-600 text-[15px]">
                <Power size={15} />
                <div>LogOut</div>
            </div>
        ),
        key: 'logout',
    },
];

const commonMenuTheme = {
    components: {
        Menu: {
            itemHeight: 47,
            iconSize: 16,
            collapsedIconSize: 16,
            fontSize: 15,
            itemColor: appColor.primary,
            itemMarginBlock: 10,
            itemMarginInline: 10,
        },
    },
};

const SidebarMenu = ({ items, pathname, menuClick }) => (
    <ConfigProvider theme={commonMenuTheme}>
        <Menu
            style={{ border: "none" }}
            mode="inline"
            selectedKeys={[pathname]}
            items={items.map(item => ({
                ...item,
                label: <div className="font-medium" style={{
                    color: item.key === appKeys.logout ? appColor.danger : undefined,
                }}>{item.label}</div>,
            }))}
            onClick={menuClick}
        />
    </ConfigProvider>
);

export {
    menuItems,
    topItems,
    bottomItems,
    profileMenuItems,
    SidebarMenu,
};