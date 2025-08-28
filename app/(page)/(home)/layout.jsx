'use client';

import {useEffect, useRef, useState} from "react";
import {pageRoutes} from "../../utils/pageRoutes";
import appColor from "../../utils/appColor";
import appKeys from "../../utils/appKeys";
import {getLocalData, isAdmin} from "../../dataStorage/DataPref";
import {LoadingComponent} from "../../components/LoadingComponent";

import ClientOnly from "../../components/ClientOnly";
import BreadcrumbGenerator from "./(panelCommonUtils)/BreadcrumbGenerator";
import LogOutModel from "./(panelCommonUtils)/LogOutModel";
import SalaryReportCodeVerifyModel from "./(panelCommonUtils)/SalaryReportCodeVerifyModel";
import useHomePageLayout from "../../hooks/useHomePageLayout";
import ToolbarUi from "./(panelCommonUtils)/ToolbarUi";
import SidebarAndDrawerUi from "./(panelCommonUtils)/SidebarAndDrawerUi";

export default function HomePage({children}) {
    const {
        isMobile,
        collapsed,
        setCollapsed,
        drawerVisible,
        setDrawerVisible,
        pathname,
        push
    } = useHomePageLayout({mobileBreakpoint: 'lg'});

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

    const containerRef = useRef(null);

    useEffect(() => {
        if (getLocalData(appKeys.jwtToken) === null) {
            push(pageRoutes.loginPage);
        }

        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    }, [pathname, getLocalData(appKeys.jwtToken)]);

    const menuClick = ({key}) => {
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

    return (
        <ClientOnly fallback={
            <div className="w-full h-full flex justify-center items-center">
                <LoadingComponent/>
            </div>
        }>
            <div className="w-screen h-screen flex flex-row overflow-hidden" style={{backgroundColor: appColor.mainBg}}>
                <SidebarAndDrawerUi
                    isMobile={isMobile}
                    collapsed={collapsed}
                    drawerVisible={drawerVisible}
                    setDrawerVisible={setDrawerVisible}
                    pathname={pathname}
                    menuClick={menuClick}
                />

                <div className=" flex flex-col flex-1 overflow-hidden">
                    <ToolbarUi
                        isMobile={isMobile}
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                        setDrawerVisible={setDrawerVisible}
                        pathname={pathname}
                        menuClick={menuClick}
                    />

                    <BreadcrumbGenerator pathname={pathname}/>

                    <div className="p-3 md:px-6 md:py-3 overflow-y-auto" ref={containerRef}
                         style={{scrollbarWidth: "thin"}}>
                        {children}
                    </div>
                </div>
            </div>

            <LogOutModel isModelOpen={isLogoutModalOpen} setIsModelOpen={setIsLogoutModalOpen}/>

            <SalaryReportCodeVerifyModel isModelOpen={isCodeModalOpen} setIsModelOpen={setIsCodeModalOpen}
                                         onSuccess={() => push(pageRoutes.salaryReport)}/>

        </ClientOnly>
    );
}
