'use client'

import React, {useState, useEffect} from "react";
import {Tree} from "antd";
import {DownOutlined} from "@ant-design/icons";
import {convertCamelCase} from "../../../utils/utils";

export const ManagePermissionTree = ({
                                         assignedPermission,
                                         modules,
                                         isAllChecked = false,
                                         onSubmit
                                     }) => {
    const [checkedKeys, setCheckedKeys] = useState([]);

    useEffect(() => {
        if (assignedPermission && assignedPermission.length > 0) {
            setCheckedKeys(getDefaultCheckedKeys(assignedPermission));
        } else {
            setCheckedKeys(isAllChecked ? getAllCheckedKeys(modules) : []);
        }
    }, [assignedPermission, modules]);

    return (
        <Tree
            checkable
            showLine
            switcherIcon={<DownOutlined/>}
            selectable={false}
            treeData={getTreeData(modules)}
            checkedKeys={checkedKeys}
            onCheck={(keysValue) => {
                setCheckedKeys(keysValue);
                onSubmit(checkedKeysToModulePermissions(keysValue));
            }}
            style={{
                margin: 10,
                fontSize: "14px",
                flex: 1,
                overflow: "hidden",
            }}
        />
    );
};

export const getTreeData = (modules) => {
    if (modules.length > 0) {
        return modules.map(module => ({
            title: convertCamelCase(module.moduleName),
            key: `module_${module._id}`,
            selectable: false,
            children: (module.actions ?? []).map(action => ({
                title: convertCamelCase(action.actionName),
                key: `action_${module._id}_${action._id}`,
                isLeaf: true,
            }))
        }));
    }
    return [];
};

export const getAllCheckedKeys = (modules) => {
    if (modules.length > 0) {
        const checked = [];
        modules.forEach(module => {
            const hasActions = Array.isArray(module.actions) && module.actions.length > 0;
            if (hasActions) {
                module.actions.forEach(action => {
                    checked.push(`action_${module._id}_${action._id}`);
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
        modulePermissions.forEach(({moduleId, permissions}) => {
            const moduleKey = `module_${moduleId._id || moduleId}`;
            if (!permissions || permissions.length === 0) {
                checked.push(moduleKey);
            } else {
                permissions.forEach(actionId => {
                    checked.push(`action_${moduleId._id || moduleId}_${actionId._id || actionId}`);
                });
            }
        });
        return checked;
    }
    return [];
};

export const checkedKeysToModulePermissions = (checkedKeys) => {
    if (checkedKeys.length > 0) {
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
        return modulePermissionsResult;
    }
    return [];
};