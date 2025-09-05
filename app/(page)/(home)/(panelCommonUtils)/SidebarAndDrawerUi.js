import appColor from "../../../utils/appColor";
import {Drawer, Layout} from "antd";
import {pageRoutes} from "../../../utils/pageRoutes";
import AnimatedDiv, {Direction} from "../../../components/AnimatedDiv";
import imagePaths from "../../../utils/imagesPath";
import {bottomItems, menuItems, SidebarMenu, topItems} from "./sideBarMenu";

const {Sider} = Layout;

export default function SidebarAndDrawerUi({
                                               isMobile,
                                               collapsed,
                                               drawerVisible,
                                               setDrawerVisible,
                                               pathname,
                                               hasModulePermission,
                                               menuClick,
                                           }) {

    const sidebarMenus = menuItems(hasModulePermission);

    const topItems = sidebarMenus.filter(item => item.position !== 'bottom');
    const bottomItems = sidebarMenus.filter(item => item.position === 'bottom');

    const renderSidebarContent = (
        <div className="flex flex-col h-full">
            <div className="m-4 flex justify-center shrink-0 cursor-pointer"
                 onClick={() => menuClick({key: pageRoutes.dashboard})}>
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

            <div className="flex-1 flex flex-col overflow-y-auto" style={{scrollbarWidth: "none"}}>
                <div className="flex-1">
                    <SidebarMenu items={topItems} pathname={pathname} menuClick={menuClick}/>
                </div>
                <div>
                    <SidebarMenu items={bottomItems} pathname={pathname} menuClick={menuClick}/>
                </div>
            </div>
        </div>
    );

    return (
        <>
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
                    styles={{body: {padding: 0}}}
                >
                    {renderSidebarContent}
                </Drawer>
            )}
        </>
    )
}