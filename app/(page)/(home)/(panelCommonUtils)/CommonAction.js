import {Button, Popconfirm, Switch} from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined, PlusOutlined,
    UserOutlined
} from "@ant-design/icons";
import appString from "../../../utils/appString";
import {useActionLoading} from "../../../hooks/useActionLoading";
import useHomePageLayout from "../../../hooks/useHomePageLayout";
import React from "react";

export function CommonActionButton({
                                       record,
                                       addBtnName,
                                       addBtnIcon,
                                       handleAdd,
                                       handleEdit,
                                       handleDelete,
                                       handleDetailView,
                                       handleUserDetailView,
                                   }) {

    const {withLoading} = useActionLoading();
    const {isMobile} = useHomePageLayout();

    const recordKey = record?.key || '';

    const addLoading = withLoading(`addRecord`);
    const editLoading = withLoading(`${recordKey}-edit`);
    const deleteLoading = withLoading(`${recordKey}-delete`);
    const viewLoading = withLoading(`${recordKey}-view`);
    const userDetailLoading = withLoading(`${recordKey}-userDetail`);

    if (handleAdd) {
        return (
            <Button
                type="primary"
                icon={addBtnIcon || <PlusOutlined/>}
                onClick={() => addLoading.run(() => handleAdd())}
                loading={addLoading.loading}
            >
                {!isMobile && addBtnName}
            </Button>
        );
    }

    return (
        <div className="flex justify-center items-center gap-2">
            {handleEdit && (
                <Button
                    title={appString.edit}
                    variant="text"
                    color="primary"
                    loading={editLoading.loading}
                    icon={<EditOutlined/>}
                    onClick={() => editLoading.run(() => handleEdit(record))}
                />
            )}

            {handleDelete && (
                <Popconfirm
                    title={appString.deleteConfirmation}
                    onConfirm={() => deleteLoading.run(() => handleDelete(record))}
                >
                    <Button
                        title={appString.delete}
                        variant="text"
                        color="danger"
                        icon={<DeleteOutlined/>}
                    />
                </Popconfirm>
            )}

            {handleDetailView && (
                <Button
                    title={appString.view}
                    variant="text"
                    color="default"
                    loading={viewLoading.loading}
                    icon={<EyeOutlined/>}
                    onClick={() => viewLoading.run(() => handleDetailView(record))}
                />
            )}

            {handleUserDetailView && (
                <Button
                    title={appString.userDetail}
                    variant="text"
                    color="purple"
                    loading={userDetailLoading.loading}
                    icon={<UserOutlined/>}
                    onClick={() => userDetailLoading.run(() => handleUserDetailView(record))}
                />
            )}
        </div>
    );
}

export function getActionColumn({
                                    field,
                                    addBtnName,
                                    addBtnIcon,
                                    handleAdd,
                                    handleEdit,
                                    handleDelete,
                                    handleDetailView,
                                    handleUserDetailView,
                                    isHidden = false
                                }) {
    return {
        title: appString[field] || appString.actions,
        align: "center",
        fixed: 'right',
        hidden: isHidden,
        render: (_, record) => (
            <CommonActionButton
                record={record}
                addBtnName={addBtnName}
                addBtnIcon={addBtnIcon}
                handleAdd={handleAdd}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleDetailView={handleDetailView}
                handleUserDetailView={handleUserDetailView}
            />
        ),
    };
}

export function CommonActionSwitch({
                                       field,
                                       record,
                                       handleStateChange,
                                   }) {
    const {withLoading} = useActionLoading();

    const rowLoading = withLoading(`${field}-${record._id}`);

    return (
        <Switch
            size="small"
            checked={record?.[field]}
            loading={rowLoading.loading}
            onChange={async (checked) => {
                await rowLoading.run(async () => {
                    const postData = {
                        ...record,
                        [field]: checked,
                    };
                    await handleStateChange(record._id, postData);
                });
            }}
        />
    );
}

export function getSwitchColumn(field, handleStateChange, isHidden = false) {
    return {
        title: appString[field] || field,
        dataIndex: field,
        key: field,
        align: "center",
        hidden: isHidden,
        render: (_, record) => (
            <CommonActionSwitch
                field={field}
                record={record}
                handleStateChange={handleStateChange}
            />
        ),
    };
}

export function TableTitle({title}) {
    return (
        <div className="text-base font-semibold">{title}</div>
    );
}