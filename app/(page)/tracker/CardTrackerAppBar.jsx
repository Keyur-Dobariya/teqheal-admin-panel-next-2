'use client';

import {Avatar, Card, Dropdown, Modal} from "antd";
import {appColor} from "../../utils/appColor";
import appKeys from "../../utils/appKeys";
import imagePaths from "../../utils/imagesPath";
import appString from "../../utils/appString";
import {AlertCircle, FilePlus, Grid, MoreVertical, Power, RefreshCw, RotateCw} from "../../utils/icons";
import {useRouter} from "next/navigation";
import pageRoutes from "../../utils/pageRoutes";
import React, {useEffect, useState} from "react";
import {environment} from "../../api/apiEndpoints";
import SafeAvatar from "../../components/SafeAvatar";

export default function CardTrackerAppBar({userData, isUpdateModalOpen, setIsUpdateModalOpen}) {

    const router = useRouter();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleMenuClick = async ({key}) => {
        if (key === 'refresh') {
            window.location.reload();
        } else if (key === 'taskBoard') {
            await window.electronAPI.openExternalLink("https://whogetsa.web.app/tasks");
        } else if (key === 'addDailyUpdate') {
            if(!isUpdateModalOpen) {
                setIsUpdateModalOpen(true);
            }
        } else if (key === 'checkForUpdate') {
            if (window.electronAPI) {
                await window.electronAPI.sendCheckUpdate();
            }
        } else if (key === 'logout') {
            setIsLogoutModalOpen(true);
        }
    };

    const items = [
        {
            label: "Refresh",
            key: 'refresh',
            icon: <RotateCw size={15} />
        },
        {
            label: "Task Board",
            key: 'taskBoard',
            icon: <Grid size={15} />
        },
        {
            label: "Add Daily Update",
            key: 'addDailyUpdate',
            icon: <FilePlus size={15} />
        },
        {
            label: "Check For Update",
            key: 'checkForUpdate',
            icon: <RefreshCw size={15} />,
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

    return (
        <>
            <Card>
                <div className="flex items-center gap-3 p-3">
                    <SafeAvatar
                        userData={userData}
                        size={40}
                        className="shadow-md"
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center text-sm font-medium gap-2">
                            <span>{appString.hey},</span>
                            <span>{userData?.fullName}</span>
                            <img
                                src={imagePaths.heyWaveHand}
                                alt="wave"
                                width={18}
                                height={18}
                            />
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                            {appString.motiveLine}
                        </div>
                    </div>
                    <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={['click']}>
                        <div className="cursor-pointer">
                            <MoreVertical size={18} color={appColor.secondPrimary} />
                        </div>
                    </Dropdown>
                </div>
            </Card>

            <Modal
                title={(
                    <div className="text-[17px] font-semibold flex items-center gap-2"><AlertCircle size={17} color={appColor.warning} /> Confirmation!</div>
                )}
                maskClosable={true}
                centered
                closeIcon={false}
                open={isLogoutModalOpen}
                onOk={async () => {
                    if (window.electronAPI) {
                        await window.electronAPI.sendLogout();
                    }
                    router.push(pageRoutes.loginPage);
                }}
                onCancel={() => {
                    setIsLogoutModalOpen(false);
                }}
                onClose={() => {
                    setIsLogoutModalOpen(false);
                }}
                okText="LogOut"
            >
                <div className="text-[15px] font-medium pb-3">
                    Are you sure you want to log out?
                </div>
            </Modal>
        </>
    );
}