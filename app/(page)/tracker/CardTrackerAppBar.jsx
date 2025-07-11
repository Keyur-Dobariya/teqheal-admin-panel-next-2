'use client';

import {Avatar, Card, Dropdown, Modal} from "antd";
import {appColor} from "../../utils/appColor";
import appKey from "../../utils/appKey";
import imagePaths from "../../utils/imagesPath";
import appString from "../../utils/appString";
import {getLocalData} from "../../dataStorage/DataPref";
import {AlertCircle, Grid, MoreVertical, Power, RefreshCw, RotateCw} from "../../utils/icons";
import {profilePhotoManager} from "../../utils/utils";
import {useRouter} from "next/navigation";
import pageRoutes from "../../utils/pageRoutes";
import {useState} from "react";

export default function CardTrackerAppBar() {

    const router = useRouter();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleMenuClick = ({ key }) => {
        if (key === '0') {
            window.location.reload();
        } else if (key === '1') {
            console.log("Tasks clicked");
        } else if (key === '2') {
            console.log("Check for update clicked");
        } else if (key === '3') {
            setIsLogoutModalOpen(true);
        }
    };

    const items = [
        {
            label: "Refresh",
            key: '0',
            icon: <RotateCw size={15} />
        },
        {
            label: "Task Board",
            key: '1',
            icon: <Grid size={15} />
        },
        {
            label: "Check For Update",
            key: '2',
            icon: <RefreshCw size={15} />
        },
        { type: 'divider' },
        {
            label: (
                <div className="flex items-center gap-2 text-red-600 text-[15px]">
                    <Power size={15} />
                    <div>LogOut</div>
                </div>
            ),
            key: '3',
        },
    ];

    return (
        <>
            <Card>
                <div className="flex items-center gap-3 p-3">
                    <Avatar
                        src={profilePhotoManager({url: getLocalData(appKey.profilePhoto), gender: getLocalData(appKey.gender)})}
                        size={40}
                        className="shadow-md"
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center text-sm font-medium gap-2">
                            <span>{appString.hey},</span>
                            <span>{getLocalData(appKey.fullName)}</span>
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
                onOk={() => {
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