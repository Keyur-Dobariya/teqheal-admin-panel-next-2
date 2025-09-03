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
import {useAppData} from "../../../masterData/AppDataContext";

export default function HeaderUi({
                                      isMobile,
                                      collapsed,
                                      setCollapsed,
                                      setDrawerVisible,
                                      pathname,
                                      menuClick,
                                  }) {
    const { loginUserData } = useAppData();

    const menuProps = {
        items: profileMenuItems(loginUserData),
        onClick: menuClick,
    };

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