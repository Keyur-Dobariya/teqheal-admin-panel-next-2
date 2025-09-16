"use client";
import React, { useState } from "react";
import { Card, Button, Spin, Divider } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { ManagePermissionTree } from "./ManagePermissionTree";
import { useRunOnce } from "../../../hooks/useRunOnce";
import {useApiServices} from "../../../api/useApiServices";
import {TableTitle} from "../(panelCommonUtils)/CommonAction";
import appString from "../../../utils/appString";

function PermissionPanel({ title, assignedPermission, modules, onChange }) {
    return (
        <div className="flex-1 rounded-xl border-1 border-gray-200">
            <div className="px-4 pt-4 pb-2 text-[15px] font-medium">{title}</div>
            <Divider size="small" />
            <ManagePermissionTree
                assignedPermission={assignedPermission}
                modules={modules}
                onSubmit={onChange}
            />
        </div>
    );
}

export default function Page() {
    const { isLoading, modules: {getAllModules}, rolePermission: {getRolePermission, modifyRolePermission} } = useApiServices();

    const [modules, setModules] = useState([]);
    const [isApiError, setIsApiError] = useState(false);

    const [permissions, setPermissions] = useState({
        superAdmin: [],
        admin: [],
        user: [],
    });

    const saveRecord = (data) => {
        setPermissions({
            superAdmin: data.superAdminPermissions || [],
            admin: data.adminPermissions || [],
            user: data.userPermissions || [],
        });
    };

    const fetchModules = async () => {
        const data = await getAllModules();
        if (data) {
            setModules(data || []);
            await fetchRolePermission();
        } else {
            setIsApiError(true);
        }
    };

    const fetchRolePermission = async () => {
        const data = await getRolePermission();
        if (data) {
            saveRecord(data);
        } else {
            setIsApiError(true)
        }
    };

    const { fetchLoading } = useRunOnce(fetchModules);

    const handleSaveRecord = async () => {
        const postData = {
            superAdminPermissions: permissions.superAdmin,
            adminPermissions: permissions.admin,
            userPermissions: permissions.user,
        };
        await modifyRolePermission(postData, (data) => {
            console.log("data=>", data)
            saveRecord(data);
        });
    };

    const panels = [
        { key: "superAdmin", title: "Super Admin Permission" },
        { key: "admin", title: "Admin Permission" },
        { key: "user", title: "User Permission" },
    ];

    return (
        <Card
            title={
                <div className="flex items-center gap-4 justify-between">
                    <TableTitle title={appString.manageRolePermission} />
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSaveRecord}
                        disabled={fetchLoading}
                        loading={isLoading && !fetchLoading}
                    >
                        Save
                    </Button>
                </div>
            }
        >
            <Spin size="default" spinning={fetchLoading}>
                {isApiError ? (
                    <div className="px-7 py-25">
                        Currently unable to get role-permission data.
                    </div>
                ) : (
                    <div className="p-6 h-full w-full flex gap-5">
                        {panels.map(({ key, title }) => (
                            <PermissionPanel
                                key={key}
                                title={title}
                                assignedPermission={permissions[key]}
                                modules={modules}
                                onChange={(result) =>
                                    setPermissions((prev) => ({ ...prev, [key]: result }))
                                }
                            />
                        ))}
                    </div>
                )}
            </Spin>
        </Card>
    );
}
