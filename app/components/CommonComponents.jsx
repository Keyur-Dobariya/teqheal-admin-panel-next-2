import {Avatar, message, Select, Tag} from "antd";
import {formatMilliseconds, profilePhotoManager} from "../utils/utils";
import appColor from "../utils/appColor";
import appString from "../utils/appString";
const { Option } = Select;

let messageApi = null;

export const setGlobalMessageApi = (api) => {
    messageApi = api;
};

export const showToast = (type = "info", content = "") => {
    if (messageApi) {
        messageApi.open({
            type,
            content,
        });
    } else {
        message.open({
            type,
            content,
        });
    }
};

export const colorTag = (value, color) => {
    return (
        <div className="mx-auto w-24 font-medium text-center rounded-md text-[12px] text-white" style={{backgroundColor: color || appColor.secondPrimary}}>
            {value ? formatMilliseconds(value) : "00:00:00"}
        </div>
    );
}

export const antTag = (value, color) => {
    return value ? (
        <Tag bordered={false} color={color} style={{fontWeight: "500", fontSize: 13, textAlign: "center"}}>{value}</Tag>
    ) : '-';
}

export const timeTag = (value, color) => {
    return <Tag bordered={false} color={color} style={{width: 80, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "500", fontSize: 13, textAlign: "center"}}>{value}</Tag>;
}

export const UserSelect = ({
                        users = [],
                        value,
                        onChange,
                        allowClear = true,
                        showSearch = true,
                        style = {},
                        disabled = false,
                        className = "",
                        size = "large",
                        ...restProps
                    }) => {
    return (
        <Select
            value={value}
            onChange={onChange}
            placeholder={appString.selectUser}
            allowClear={allowClear}
            showSearch={showSearch}
            size={size}
            disabled={disabled}
            className={className}
            style={{ width: "100%", ...style }}
            filterOption={(input, option) =>
                (option?.label ?? "")
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
            }
            {...restProps}
        >
            {users && users.map((user) => (
                <Option
                    key={user._id}
                    value={user._id}
                    label={user.fullName}
                >
                    <div className="flex items-center gap-3 text-[14px]">
                        <Avatar
                            size="small"
                            src={profilePhotoManager({
                                url: user.profilePhoto,
                                gender: user.gender,
                            })}
                        />
                        {user.fullName}
                    </div>
                </Option>
            ))}
        </Select>
    );
};