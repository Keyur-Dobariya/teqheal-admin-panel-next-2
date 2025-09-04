'use client'

import React, {useState, useRef} from "react";
import {Modal, Tabs} from "antd";
import {ManagePermissionTree} from "../role-permission/ManagePermissionTree";

export const ModuleTreeModal = ({
                                    isModuleModelOpen,
                                    setIsModuleModelOpen,
                                    isTabMode = true,
                                    modulePermissions = [],
                                    adminPermissions = [],
                                    userPermissions = [],
                                    modules,
                                    onTabSubmit,
                                    onSubmit
                                }) => {
    const [moduleUpdatedPermission, setModuleUpdatedPermission] = useState(modulePermissions);
    const [adminUpdatedPermissions, setAdminUpdatedPermissions] = useState(adminPermissions);
    const [userUpdatedPermissions, setUserUpdatedPermissions] = useState(userPermissions);
    const containerRef = useRef(null);

    const handleModelClose = () => {
        setIsModuleModelOpen(false);
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    };

    const handleTreeSubmit = () => {
        if(isTabMode) {
            onTabSubmit(adminUpdatedPermissions, userUpdatedPermissions);
        } else {
            onSubmit(moduleUpdatedPermission);
        }

        handleModelClose();
    };

    const AdminTabContent = () => {
        return (
            <div
                style={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    scrollbarWidth: "none",
                    maxHeight: "55vh",
                }}
                ref={containerRef}
            >
                <ManagePermissionTree
                    assignedPermission={adminUpdatedPermissions}
                    modules={modules}
                    isAllChecked={true}
                    onSubmit={(result) => {
                        setAdminUpdatedPermissions(result);
                    }}
                />
            </div>
        )
    }

    const UserTabContent = () => {
        return (
            <div
                style={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    scrollbarWidth: "none",
                    maxHeight: "55vh",
                }}
                ref={containerRef}
            >
                <ManagePermissionTree
                    assignedPermission={userUpdatedPermissions}
                    modules={modules}
                    isAllChecked={true}
                    onSubmit={(result) => {
                        setUserUpdatedPermissions(result);
                    }}
                />
            </div>
        )
    }

    const items = [
        {
            key: 'admin',
            label: 'Admin Permission',
            children: <AdminTabContent/>,
        },
        {
            key: 'user',
            label: 'User Permission',
            children: <UserTabContent/>,
        },
    ];

    return (
        <Modal
            title={"Module Permissions"}
            open={isModuleModelOpen}
            onCancel={handleModelClose}
            onOk={handleTreeSubmit}
            okText={"Save"}
            width={400}
        >
            {isTabMode ?
                <Tabs size="small" centered defaultActiveKey="admin" items={items}/> :
                <div
                    style={{
                        overflowY: "auto",
                        overflowX: "hidden",
                        scrollbarWidth: "none",
                        maxHeight: "55vh",
                    }}
                    ref={containerRef}
                >
                    <ManagePermissionTree
                        assignedPermission={moduleUpdatedPermission}
                        modules={modules}
                        onSubmit={(result) => {
                            setModuleUpdatedPermission(result);
                        }}
                    />
                </div>
            }
        </Modal>
    );
};