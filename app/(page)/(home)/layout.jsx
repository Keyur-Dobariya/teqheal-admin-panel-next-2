'use client';

import imagePaths from "../../utils/imagesPath";
import {
    HomeOutlined,
    StockOutlined,
    DollarOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    CodeSandboxOutlined,
    UserOutlined,
    ApartmentOutlined,
    CarryOutOutlined,
    AuditOutlined,
    CalendarOutlined,
    MessageOutlined,
    SettingOutlined,
    WalletOutlined,
    PoweroffOutlined,
    BellOutlined,
    TeamOutlined,
    CommentOutlined, AndroidOutlined, PhoneOutlined,
} from '@ant-design/icons';
import {
    Button,
    Drawer,
    Layout,
    Menu,
    Grid,
    ConfigProvider,
    Breadcrumb,
    Badge,
    Modal,
    Avatar,
    Tooltip,
    Dropdown, Form, Input
} from 'antd';
import { useEffect, useRef, useState } from "react";
import AnimatedDiv, { Direction } from "../../components/AnimatedDiv";
import { capitalizeLastPathSegment } from "../../utils/utils";
import pageRoutes from "../../utils/pageRoutes";
import { usePathname } from "next/navigation";
import appColor from "../../utils/appColor";
import appKeys from "../../utils/appKeys";
import { getLocalData, isAdmin, storeLoginData } from "../../dataStorage/DataPref";
import { LoadingComponent } from "../../components/LoadingComponent";
import Link from "next/link";
import { useAppData } from "../../masterData/AppDataContext";
import apiCall, { HttpMethod } from "../../api/apiServiceProvider";
import { endpoints } from "../../api/apiEndpoints";
import appString from "../../utils/appString";
import { AlertCircle, ChevronDown, ChevronRight, FileText, LogOut, Power, Settings, User } from "../../utils/icons";
import Image from "next/image";
import validationRules from "../../utils/validationRules";
import { showToast } from "../../components/CommonComponents";
import SafeAvatar from "../../components/SafeAvatar";
import {useProtectedRouter} from "../../hooks/useProtectedRouter";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

export default function HomePage({ children }) {
    const pathname = usePathname();
    // const router = useRouter();
    const {push} = useProtectedRouter();
    const screens = useBreakpoint();
    const isMobile = !screens.lg;



    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
    const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });

    const [breadcrumbItems, setBreadcrumbItems] = useState([]);

    const containerRef = useRef(null);

    const appDataContext = useAppData();
    const [isLoading, setIsLoading] = useState(false);
    const isApiCalledRef = useRef(false);

    const fetchMasterData = async () => {
        try {
            const response = await apiCall({
                method: HttpMethod.GET,
                url: endpoints.getMasterData,
                setIsLoading,
                showSuccessMessage: false,
            });

            if (response?.data) {
                appDataContext.setAllMasterData(response.data);
                storeLoginData(response?.data?.loginUserData, false);
            }
        } catch (error) {
            console.error('Failed to fetch master data:', error);
        }
    };

    useEffect(() => {
        if (!isApiCalledRef.current) {
            isApiCalledRef.current = true;
            fetchMasterData();
        }

        if (!isAdmin()) {
            if (!navigator.geolocation) {
                showToast("error", 'Geolocation is not supported by your browser')
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (err) => {
                    showToast("error", 'Unable to retrieve your location: ' + err.message)
                }
            );
        }

    }, []);

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

    const SidebarMenu = ({ items }) => (
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

    const menuClick = ({ key }) => {
        if (key !== appKeys.logout) {
            if (pageRoutes.myProfile.includes(key)) {
                push(`${pageRoutes.myProfile}?user=${getLocalData(appKeys.employeeCode)}`);
            } else if (pageRoutes.salaryReport.includes(key) && !isAdmin()) {
                setIsCodeModalOpen(true);
            } else {
                push(key);
            }
        }
        if (key === appKeys.logout) {
            setIsLogoutModalOpen(true);
        }
        if (isMobile) {
            setDrawerVisible(false);
        }
    }

    const generateBreadcrumbFromPath = (pathname) => {
        const pathSegments = pathname.split('/').filter(Boolean);
        const breadcrumbItems = [];

        const isDashboard = pathname === pageRoutes.dashboard;
        if (!isDashboard) {
            breadcrumbItems.push({
                key: pageRoutes.dashboard,
                icon: <HomeOutlined />,
                label: '',
            });
        }

        let currentPath = '';
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;

            if (currentPath === pageRoutes.dashboard && !isDashboard) {
                return;
            }

            const menuItem = findMenuItemByPath(currentPath);

            let label = capitalizeLastPathSegment(segment);
            let icon = menuItem?.icon || <HomeOutlined />;

            if (segment === 'employee-detail') {
                label = 'Employee Detail';
                icon = <UserOutlined />;
            }

            breadcrumbItems.push({
                key: currentPath,
                icon: icon,
                label: label,
            });
        });

        return breadcrumbItems;
    };

    const findMenuItemByPath = (path) => {
        const findInItems = (items) => {
            for (const item of items) {
                if (item.key === path) {
                    return item;
                }
                if (item.children) {
                    const found = findInItems(item.children);
                    if (found) return found;
                }
            }
            return null;
        };
        return findInItems(menuItems);
    };

    useEffect(() => {
        const breadcrumbItems = generateBreadcrumbFromPath(pathname);
        setBreadcrumbItems(breadcrumbItems);

        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    }, [pathname]);

    const handleCodeVerifyApi = async (values) => {
        await apiCall({
            method: HttpMethod.POST,
            url: endpoints.salaryCodeVerify,
            data: {
                code: values.code,
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
            },
            setIsLoading: setIsLoading,
            successCallback: (data) => {
                setIsCodeModalOpen(false);
                // menuClick({route: `${routes.salaryReport}/${values.code}`, state: { state: { paramDetail: { code: values.code } } }});
                push(pageRoutes.salaryReport);
            },
        });
    }

    const menuItems = [
        {
            key: pageRoutes.dashboard,
            icon: <HomeOutlined />,
            // type: 'group',
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
            key: pageRoutes.application,
            icon: <AndroidOutlined />,
            label: capitalizeLastPathSegment(pageRoutes.application),
            hidden: !isAdmin(),
            position: 'top',
        },
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
                        <div className="text-gray-900 text-[15px]">{getLocalData(appKeys.fullName)}</div>
                        <div className="text-gray-600 text-[13px]">{getLocalData(appKeys.emailAddress)}</div>
                    </div>
                    <ChevronRight />
                </div>
            ),
        },
        { type: 'divider' },
        {
            label: "Settings",
            key: pageRoutes.settings,
            icon: <Settings />,
        },
        { type: 'divider' },
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

    const menuProps = {
        items: profileMenuItems,
        onClick: menuClick,
    };

    const renderSidebarContent = (
        <div className="flex flex-col h-full">
            <div className="m-4 flex justify-center shrink-0 cursor-pointer" onClick={() => menuClick({key: pageRoutes.dashboard})}>
                <AnimatedDiv
                    key={!isMobile && collapsed ? "logo-collapsed" : "logo-expanded"}
                    direction={!isMobile && collapsed ? Direction.RIGHT_TO_LEFT : Direction.LEFT_TO_RIGHT}
                    className="flex justify-center items-center"
                >
                    <img
                        className="max-h-[45px] transition-all duration-300"
                        src={!isMobile && collapsed ? imagePaths.icon_sm_dark : imagePaths.icon_big_dark}
                        alt="logo"
                    />
                </AnimatedDiv>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                <div className="flex-1">
                    <SidebarMenu items={topItems} />
                </div>

                <div>
                    <SidebarMenu items={bottomItems} />
                </div>
            </div>


        </div>
    );

    const [ready, setReady] = useState(false);
    useEffect(() => setReady(true), []);
    if (!ready && isLoading) {
        return (
            <div className="w-full h-full flex justify-center items-center">
                <LoadingComponent />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="w-full h-full flex justify-center items-center">
                <div className="loader flex items-center justify-center">
                    <img src={imagePaths.icon_sm_dark} alt="logo" width={35} height={35} />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="w-screen h-screen flex flex-row overflow-hidden" style={{ backgroundColor: appColor.mainBg }}>
                {!isMobile && (
                    <Sider
                        className="border-r-1 border-gray-200"
                        style={{ borderRight: `1px ${appColor.borderClr} solid` }}
                        collapsed={collapsed}
                        theme="light"
                        width={270}
                    >
                        {renderSidebarContent}
                    </Sider>
                )}

                {isMobile && (
                    <Drawer
                        title={null}
                        placement="left"
                        closable={false}
                        width={270}
                        onClose={() => setDrawerVisible(false)}
                        open={drawerVisible}
                        styles={{ body: { padding: 0 } }}
                    >
                        {renderSidebarContent}
                    </Drawer>
                )}

                <div className=" flex flex-col flex-1 overflow-hidden">
                    <div className="flex justify-between items-center bg-white border-b-1 border-gray-200 py-3 px-5"
                        style={{ borderBottom: `1px ${appColor.borderClr} solid` }}>
                        <div className="flex items-center gap-3">
                            <Button
                                shape="circle"
                                type="text"
                                icon={
                                    isMobile
                                        ? <MenuUnfoldOutlined />
                                        : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)
                                }
                                onClick={() => {
                                    if (isMobile) {
                                        setDrawerVisible(true);
                                    } else {
                                        setCollapsed(!collapsed);
                                    }
                                }}
                            />
                            {!isMobile && <div className="text-lg font-medium">
                                {capitalizeLastPathSegment(pathname)}
                            </div>}
                        </div>
                        {isMobile && <img src={imagePaths.icon_big_dark} alt="icon" width={150} height={45} />}
                        <div className="flex items-center gap-4">
                            {/*<Badge dot status="error" offset={[-7, 5]}>*/}
                            {/*    <Button shape="circle" icon={<BellOutlined />} onClick={() => {*/}
                            {/*    }} />*/}
                            {/*</Badge>*/}
                            <Dropdown overlayStyle={{ minWidth: 200 }} menu={menuProps} trigger={["click"]}>
                                <div className="flex items-center gap-2 cursor-pointer">
                                    <Tooltip title={getLocalData(appKeys.fullName)}>
                                        <SafeAvatar
                                            isMyData={true}
                                        />
                                    </Tooltip>
                                    {!isMobile && <div className="text-[15px] font-medium">{getLocalData(appKeys.fullName)}</div>}
                                    {!isMobile && <ChevronDown />}
                                </div>
                            </Dropdown>
                        </div>
                    </div>
                    {!pageRoutes.dashboard.includes(pathname) && <Breadcrumb
                        separator=">"
                        style={{ margin: "12px 12px 5px 25px" }}
                        items={breadcrumbItems.map(item => ({
                            key: item.key,
                            title: (
                                item.key === pageRoutes.dashboard ? <HomeOutlined
                                    className="flex items-center gap-1 cursor-pointer hover:text-blue-700"
                                    onClick={() => push(item.key)}
                                /> : <span
                                    className="flex items-center gap-1 cursor-default"
                                >{item.icon}{item.label}</span>
                            ),
                        }))}
                    />}
                    <div className="p-3 md:px-6 md:py-3 overflow-y-auto" ref={containerRef} style={{ scrollbarWidth: "thin" }}>
                        {children}
                    </div>
                </div>
            </div>
            <Modal
                title={<div className="text-[16px] font-medium flex items-center gap-2"><AlertCircle color={appColor.danger} />{appString.confirmation}</div>}
                width={400}
                maskClosable={true}
                centered
                closeIcon={false}
                open={isLogoutModalOpen}
                footer={null}
                onCancel={() => setIsLogoutModalOpen(false)}
                onClose={() => setIsLogoutModalOpen(false)}
            >
                <div className="text-[15px] font-medium mb-6">
                    {appString.logoutConfirmation}
                </div>
                <div className="flex justify-end gap-2">
                    <Button
                        onClick={() => setIsLogoutModalOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        danger
                        onClick={() => {
                            localStorage.clear();
                            push(pageRoutes.loginPage);
                        }}
                    >
                        {appString.logOut}
                    </Button>
                </div>
            </Modal>
            <Modal
                title="User Code Verification!"
                maskClosable={true}
                centered
                closeIcon={false}
                open={isCodeModalOpen}
                onOk={() => form.submit()}
                onCancel={() => {
                    setIsCodeModalOpen(false);
                }}
                onClose={() => {
                    setIsCodeModalOpen(false);
                }}
                okText="Verify"
                confirmLoading={isLoading}
            >
                <Form
                    layout="vertical"
                    onFinish={(values) => {
                        handleCodeVerifyApi(values);
                    }}
                >
                    <Form.Item
                        name="code"
                        label="Code"
                        rules={[{ required: true, message: `Enter salary report code!` }]}
                    >
                        <Input
                            placeholder="Enter Code"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
