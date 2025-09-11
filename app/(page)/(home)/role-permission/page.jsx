"use client";
import React, { useState } from "react";
import { Card, Button, Spin, Divider } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import apiCall, { HttpMethod } from "../../../api/apiServiceProvider";
import { endpoints } from "../../../api/apiEndpoints";
import { ManagePermissionTree } from "./ManagePermissionTree";
import { useActionLoading } from "../../../hooks/useActionLoading";
import { useRunOnce } from "../../../hooks/useRunOnce";

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
    const { withLoading } = useActionLoading();
    const apiLoading = withLoading();

    const [modules, setModules] = useState([]);
    const [isApiError, setIsApiError] = useState(false);

    const [permissions, setPermissions] = useState({
        superAdmin: [],
        admin: [],
        user: [],
    });

    const fetchModules = async () => {
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.getAllModules,
            showSuccessMessage: false,
            successCallback: (data) => {
                if (data?.data) {
                    setModules(data.data);
                    fetchRolePermission();
                } else {
                    setIsApiError(true);
                }
            },
            errorCallback: () => setIsApiError(true),
        });
    };

    const fetchRolePermission = async () => {
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.getRolePermission,
            showSuccessMessage: false,
            successCallback: (data) => {
                if (data?.data) {
                    setPermissions({
                        superAdmin: data.data.superAdminPermissions || [],
                        admin: data.data.adminPermissions || [],
                        user: data.data.userPermissions || [],
                    });
                }
            },
            errorCallback: () => setIsApiError(true),
        });
    };

    const { fetchLoading } = useRunOnce(fetchModules);

    const handleSaveRecord = async () => {
        await apiLoading.run(async () => {
            await apiCall({
                method: HttpMethod.POST,
                url: endpoints.modifyRolePermission,
                data: {
                    superAdminPermissions: permissions.superAdmin,
                    adminPermissions: permissions.admin,
                    userPermissions: permissions.user,
                },
                showSuccessMessage: true,
                successCallback: fetchRolePermission,
            });
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
                    <div>Manage Role Permission</div>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSaveRecord}
                        loading={apiLoading.loading}
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
