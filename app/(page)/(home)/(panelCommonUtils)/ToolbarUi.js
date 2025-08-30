'use client'

import appColor from "../../../utils/appColor";
import {Button, Dropdown, Tooltip} from "antd";
import {MenuFoldOutlined, MenuUnfoldOutlined} from "@ant-design/icons";
import {capitalizeLastPathSegment} from "../../../utils/utils";
import imagePaths from "../../../utils/imagesPath";
import {getLocalData} from "../../../dataStorage/DataPref";
import appKeys from "../../../utils/appKeys";
import SafeAvatar from "../../../components/SafeAvatar";
import {ChevronDown} from "../../../utils/icons";
import {profileMenuItems} from "./sideBarMenu";
import {useEffect, useState} from "react";

export default function ToolbarUi({
                                      isMobile,
                                      collapsed,
                                      setCollapsed,
                                      setDrawerVisible,
                                      pathname,
                                      menuClick,
                                  }) {

    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Detect iOS
        setIsIOS(
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);

        // Detect if already installed
        setIsStandalone(
            window.matchMedia("(display-mode: standalone)").matches
        );

        // Listen for Android install prompt
        const handler = (e) => {
            e.preventDefault(); // Prevent default mini-infobar
            setDeferredPrompt(e);
        };
        window.addEventListener("beforeinstallprompt", handler);

        return () =>
            window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt(); // Show the install prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log("User choice:", outcome);
        setDeferredPrompt(null);
    };

    const menuProps = {
        items: profileMenuItems,
        onClick: menuClick,
    };

    if (isStandalone) return null;

    return (
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
                <div>
                    <h3>Install App</h3>

                    {/* Android Button */}
                    {deferredPrompt && (
                        <button onClick={handleInstallClick}>📲 Install App</button>
                    )}

                    {/* iOS Instructions */}
                    {isIOS && (
                        <p>
                            To install this app on your iOS device, tap the share button
                            <span role="img" aria-label="share icon">
            ⎋
          </span>{" "}
                            and then <strong>Add to Home Screen</strong>{" "}
                            <span role="img" aria-label="plus icon">
            ➕
          </span>
                            .
                        </p>
                    )}
                </div>
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
    )
}