import {Button, Popconfirm} from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined, PlusOutlined,
    UserOutlined
} from "@ant-design/icons";
import appString from "../../../utils/appString";
import {useActionLoading} from "../../../hooks/useActionLoading";
import useHomePageLayout from "../../../hooks/useHomePageLayout";

export default function CommonActionButton({
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

    if(handleAdd) {
        return (
            <Button
                type="primary"
                icon={addBtnIcon || <PlusOutlined/>}
                onClick={() => addLoading.run(() => handleAdd())}
                loading={addLoading.loading}
            >
                {!isMobile && (addBtnName || appString.addRecord)}
            </Button>
        );
    }

    return (
        <div className="flex justify-center items-center">
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