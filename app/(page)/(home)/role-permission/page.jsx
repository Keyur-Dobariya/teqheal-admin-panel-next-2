"use client";
import React, { useState, useEffect, useRef } from "react";
import {Card, Button, Spin, Divider} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import apiCall, { HttpMethod } from "../../../api/apiServiceProvider";
import { endpoints } from "../../../api/apiEndpoints";
import {ManagePermissionTree} from "./ManagePermissionTree";

export default function Page() {
    const [modules, setModules] = useState([]);
    const [isApiError, setIsApiError] = useState(null);
    const [adminPermissions, setAdminPermissions] = useState([]);
    const [userPermissions, setUserPermissions] = useState([]);
    const [adminUpdatedPermissions, setAdminUpdatedPermissions] = useState([]);
    const [userUpdatedPermissions, setUserUpdatedPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const fetchTriggered = useRef(false);

    useEffect(() => {
        if (!fetchTriggered.current) {
            fetchTriggered.current = true;
            fetchModules();
        }
    }, []);

    const fetchModules = async () => {
        setLoading(true);
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.getAllModules,
            setIsLoading: false,
            showSuccessMessage: false,
            successCallback: (data) => {
                if(data?.data) {
                    const filteredModules = (data?.data || []).filter(module => !module.isForSuperAdmin);
                    setModules(filteredModules);
                    fetchRolePermission(filteredModules);
                } else {
                    setIsApiError(true);
                    setLoading(false);
                }
            },
            errorCallback: () => {
                setIsApiError(true);
                setLoading(false);
            }
        });
    };

    const fetchRolePermission = async () => {
        await apiCall({
            method: HttpMethod.GET,
            url: endpoints.getRolePermission,
            setIsLoading: false,
            showSuccessMessage: false,
            successCallback: (data) => {
                if (data?.data) {
                    setAdminPermissions(data.data.adminPermissions || []);
                    setUserPermissions(data.data.userPermissions || []);
                }
                setLoading(false);
            },
            errorCallback: () => {
                setIsApiError(true);
                setLoading(false);
            }
        });
    };

    const handleSaveRecord = async () => {
        setLoading(true);
        await apiCall({
            method: HttpMethod.POST,
            url: endpoints.modifyRolePermission,
            data: {
                adminPermissions: adminUpdatedPermissions,
                userPermissions: userUpdatedPermissions,
            },
            setIsLoading: setLoading,
            showSuccessMessage: true,
            successCallback: () => {
                fetchRolePermission();
            },
        });
    };

    return (
        <Card title={(
            <div className="flex items-center gap-4 justify-between">
                <div>Manage Role Permission</div>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveRecord}>Save</Button>
            </div>
        )}>
            <Spin size="default" spinning={loading}>
                {isApiError ?
                    <div className='px-7 py-25'>Currently unable to getting role-permission data.</div> :
                    <div className="p-6 h-full w-full flex gap-5">
                    <Card>
                        <div className='px-4 pt-4 pb-2 text-[15px] font-medium'>Admin Permission</div>
                        <Divider size="small"/>
                        <ManagePermissionTree
                            assignedPermission={adminPermissions}
                            modules={modules}
                            onSubmit={(result) => {
                                setAdminUpdatedPermissions(result);
                            }}
                        />
                    </Card>
                    <Card>
                        <div className='px-4 pt-4 pb-2 text-[15px] font-medium'>User Permission</div>
                        <Divider size="small"/>
                        <ManagePermissionTree
                            assignedPermission={userPermissions}
                            modules={modules}
                            onSubmit={(result) => {
                                setUserUpdatedPermissions(result);
                            }}
                        />
                    </Card>
                </div>}
            </Spin>
        </Card>
    );
};