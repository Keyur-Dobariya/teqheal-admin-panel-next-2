'use client'

import React, {useState, useEffect, useRef} from "react";
import {Modal, Tree} from "antd";
import {DownOutlined} from "@ant-design/icons";
import {convertCamelCase} from "../../../utils/utils";

export const ModuleTreeModal = ({
                                    key,
                                    isModuleModelOpen,
                                    setIsModuleModelOpen,
                                    modulePermissions,
                                    modules,
                                    isCheckedAll = true,
                                    onSubmit
                                }) => {
    const [checkedKeys, setCheckedKeys] = useState([]);
    const containerRef = useRef(null);

    useEffect(() => {
        if (isModuleModelOpen) {
            if (modulePermissions && modulePermissions.length > 0) {
                setCheckedKeys(getDefaultCheckedKeys(modulePermissions));
            } else {
                setCheckedKeys(isCheckedAll ? getAllCheckedKeys(modules) : []);
            }
        }
    }, [isModuleModelOpen, modulePermissions, modules]);

    const handleModelClose = () => {
        setIsModuleModelOpen(false);
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    };

    const handleTreeSubmit = () => {
        const modulePermissionsResult = [];
        checkedKeys.forEach(key => {
            if (key.startsWith("action_")) {
                const [, moduleId, action] = key.split("_");
                let mp = modulePermissionsResult.find(m => m.moduleId === moduleId);
                if (!mp) {
                    mp = {moduleId, permissions: []};
                    modulePermissionsResult.push(mp);
                }
                mp.permissions.push(action);
            } else if (key.startsWith("module_")) {
                const moduleId = key.split("_")[1];
                const exists = modulePermissionsResult.find(m => m.moduleId === moduleId);
                if (!exists) {
                    modulePermissionsResult.push({moduleId, permissions: []});
                }
            }
        });
        onSubmit(modulePermissionsResult);
        handleModelClose();
    };

    return (
        <Modal
            title={"Module Permissions"}
            open={isModuleModelOpen}
            onCancel={handleModelClose}
            onOk={handleTreeSubmit}
            width={400}
        >
            <div
                key={key}
                style={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    scrollbarWidth: "none",
                    maxHeight: "70vh",
                }}
                ref={containerRef}
            >
                <Tree
                    checkable
                    showLine
                    switcherIcon={<DownOutlined/>}
                    selectable={false}
                    treeData={getTreeData(modules)}
                    checkedKeys={checkedKeys}
                    onCheck={(keysValue) => {
                        setCheckedKeys(keysValue);
                    }}
                    style={{
                        margin: 10,
                        fontSize: "14px",
                        flex: 1,
                        overflowY: "auto",
                        overflowX: "hidden",
                        scrollbarWidth: "none",
                        maxHeight: "60vh",
                    }}
                />
            </div>
        </Modal>
    );
};

export const getTreeData = (modules) => {
    if (modules.length > 0) {
        let convertedModules;
        convertedModules = modules?.map(module => ({
            title: convertCamelCase(module.moduleName),
            key: `module_${module._id}`,
            selectable: false,
            children: (module.actions ?? []).map(action => ({
                title: convertCamelCase(action),
                key: `action_${module._id}_${action}`,
                isLeaf: true,
            }))
        }));
        return convertedModules;
    }
    return [];
};

export const getAllCheckedKeys = (modules) => {
    if (modules.length > 0) {
        const checked = [];
        modules?.forEach(module => {
            const hasActions = Array.isArray(module.actions) && module.actions.length > 0;
            if (hasActions) {
                (module.actions || []).forEach(action => {
                    checked.push(`action_${module._id}_${action}`);
                });
            } else {
                checked.push(`module_${module._id}`);
            }
        });
        return checked;
    }
    return [];
};

export const getDefaultCheckedKeys = (modulePermissions) => {
    if (modulePermissions.length > 0) {
        const checked = [];
        modulePermissions.forEach(({ moduleId, permissions }) => {
            if (!permissions || permissions.length === 0) {
                checked.push(`module_${moduleId._id || moduleId}`);
            } else {
                permissions.forEach(action => {
                    checked.push(`action_${moduleId._id || moduleId}_${action}`);
                });
            }
        });
        return checked;
    }
    return [];
};