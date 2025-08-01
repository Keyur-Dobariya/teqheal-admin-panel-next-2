import {Avatar, message, Select, Tag} from "antd";
import {formatMilliseconds} from "../utils/utils";
import appColor from "../utils/appColor";
import appString from "../utils/appString";
import SafeAvatar from "./SafeAvatar";
import React from "react";

const {Option} = Select;

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
        <div className="mx-auto w-24 font-medium text-center rounded-md text-[12px] text-white"
             style={{backgroundColor: color || appColor.secondPrimary}}>
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
    return <Tag bordered={false} color={color} style={{
        width: 80,
        height: 22,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "500",
        fontSize: 13,
        textAlign: "center"
    }}>{value}</Tag>;
}

export const UserSelect = ({
                               users = [],
                               value,
                               onChange,
                               placeholder = appString.selectUser,
                               allowClear = true,
                               showSearch = true,
                               isMultiple = false,
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
            placeholder={placeholder}
            allowClear={allowClear}
            showSearch={showSearch}
            size={size}
            disabled={disabled}
            className={className}
            mode={isMultiple ? "multiple" : undefined}
            style={{width: "100%", ...style}}
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
                    <div className="flex items-center gap-2 text-[14px]">
                        <SafeAvatar
                            userData={user}
                            size="small"
                        />
                        {user.fullName}
                    </div>
                </Option>
            ))}
        </Select>
    );
};