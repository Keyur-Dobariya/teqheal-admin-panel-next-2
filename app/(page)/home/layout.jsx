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
    CommentOutlined, LoadingOutlined,
} from '@ant-design/icons';
import {Button, Drawer, Layout, Menu, Grid, ConfigProvider, Breadcrumb, Badge} from 'antd';
import {useEffect, useRef, useState} from "react";
import AnimatedDiv, { Direction } from "../../components/AnimatedDiv";
import {capitalizeLastPathSegment, detectPlatform} from "../../utils/utils";
import pageRoutes from "../../utils/pageRoutes";
import {router} from "next/client";
import {usePathname, useRouter} from "next/navigation";
import appColor from "../../utils/appColor";
import appKeys from "../../utils/appKeys";
import {getLocalData, storeLoginData} from "../../dataStorage/DataPref";
import {LoadingComponent} from "../../components/LoadingComponent";
import Link from "next/link";
import {useAppData} from "../../masterData/AppDataContext";
import apiCall, {HttpMethod} from "../../api/apiServiceProvider";
import {endpoints} from "../../api/apiEndpoints";
import appString from "../../utils/appString";
import {FileText} from "../../utils/icons";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

export default function HomePage({children}) {
    const pathname = usePathname();
    const router = useRouter();
    const screens = useBreakpoint();
    const isMobile = !screens.lg;

    const [collapsed, setCollapsed] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);

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
                    // label: <div className="flex items-center gap-2 font-medium" style={{
                    //     color: item.key === appKeys.logout ? appColor.danger : undefined,
                    // }}><div>{item.label}</div><LoadingOutlined hidden={!isRouterLoading} /></div>,
                }))}
                onClick={({ key }) => {
                    if (key !== appKeys.logout) {
                        setTimeout(() => {
                            if (pageRoutes.myProfile.includes(key)) {
                                router.push(`${pageRoutes.myProfile}?user=${getLocalData(appKeys.employeeCode)}`);
                            } else {
                                router.push(key);
                            }
                        }, 100);
                    }
                    if(isMobile) {
                        setDrawerVisible(false);
                    }
                }}
            />
        </ConfigProvider>
    );

    const findMenuItemByKey = (key, items = menuItems, parents = []) => {
        for (const item of items) {
            if (item.key === key) {
                return [...parents, item];
            }
            if (item.children) {
                const result = findMenuItemByKey(key, item.children, [...parents, item]);
                if (result) return result;
            }
        }
        return null;
    };

    useEffect(() => {
        const pathItems = findMenuItemByKey(pathname);
        if (pathItems) {
            const isDashboard = pageRoutes.dashboard.includes(pathItems[0]?.key);

            const homeItem = {
                key: pageRoutes.dashboard,
                icon: <HomeOutlined />,
                label: '',
            };

            const newBreadcrumb = isDashboard ? pathItems : [homeItem, ...pathItems];
            setBreadcrumbItems(newBreadcrumb);
        }
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    }, [pathname]);

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
            key: pageRoutes.myProfile,
            icon: <UserOutlined />,
            label: capitalizeLastPathSegment(pageRoutes.myProfile),
            position: 'bottom',
        },
        {
            key: pageRoutes.settings,
            icon: <SettingOutlined />,
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

    const renderSidebarContent = (
        <div className="flex flex-col h-full">
            <div className="m-4 flex justify-center shrink-0">
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

    if(isLoading) {
        return (
            <div className="w-full h-full flex justify-center items-center">
                <div className="loader flex items-center justify-center">
                    <img src={imagePaths.icon_sm_dark} alt="logo" width={35} height={35}/>
                </div>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen flex flex-row overflow-hidden" style={{backgroundColor: appColor.mainBg}}>
            {!isMobile && (
                <Sider
                    className="border-r-1 border-gray-200"
                    style={{borderRight: `1px ${appColor.borderClr} solid`}}
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
                     style={{borderBottom: `1px ${appColor.borderClr} solid`}}>
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
                        <div className="text-lg font-medium" >
                            {capitalizeLastPathSegment(pathname)}
                        </div>
                    </div>
                    <Badge dot status="error" offset={[-7, 5]}>
                        <Button shape="circle" icon={<BellOutlined />} onClick={() => {
                            localStorage.clear();
                            router.push(pageRoutes.loginPage);
                        }} />
                    </Badge>
                </div>
                {!pageRoutes.dashboard.includes(pathname) && <Breadcrumb
                    separator=">"
                    style={{margin: "12px 12px 5px 25px"}}
                    items={breadcrumbItems.map(item => ({
                        key: item.key,
                        title: (
                            item.key === pageRoutes.dashboard ? <HomeOutlined
                                className="flex items-center gap-1 cursor-pointer hover:text-blue-700"
                                onClick={() => router.push(item.key)}
                            /> : <span
                                className="flex items-center gap-1 cursor-default"
                            >{item.icon}{item.label}</span>
                        ),
                    }))}
                />}
                <div className="p-3 md:px-6 md:py-3 overflow-y-auto" ref={containerRef} style={{scrollbarWidth: "thin"}}>
                    {children}
                </div>
            </div>
        </div>
    );
}
