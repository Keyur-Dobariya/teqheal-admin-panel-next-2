import {Avatar, Col, message, Select, Skeleton, Tag, Upload} from "antd";
import {formatMilliseconds} from "../utils/utils";
import appColor from "../utils/appColor";
import appString from "../utils/appString";
import SafeAvatar from "./SafeAvatar";
import React from "react";
import {PlusOutlined} from "@ant-design/icons";

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

export const CustomTag = ({value, color}) => {
    return value ? (
        <div className="w-fit place-self-center px-2 text-center rounded-md text-[12px] text-white"
             style={{backgroundColor: color || appColor.secondPrimary}}>
            {value}
        </div>
    ) : '-';
}

export const TableExtraData = ({ title, value, isTag = false, tagColor = 'blue' }) => {
    return <Col xs={24} sm={12} md={8} >
        <div className="text-[13px] font-normal text-gray-500">{title}</div>
        <div className="text-[14px] font-medium text-gray-900 mt-1">{value ? isTag ?
            <div className="flex justify-start"><CustomTag value={value} color={tagColor} /></div> : value : '-'}</div>
    </Col>;
}

export const UploadSinglePhoto = ({field, photo, onSelect}) => {
    return (
        <Upload
            name={field}
            listType="picture-circle"
            className="avatar-uploader"
            showUploadList={false}
            beforeUpload={(file) => {
                onSelect(file);
                return false;
            }}
        >
            {photo ? (
                <img
                    className="rounded-full"
                    src={typeof photo === 'string' && photo.startsWith('http')
                        ? photo
                        : URL.createObjectURL(photo)
                    }
                    alt="avatar"
                    style={{width: '100%'}}
                />
            ) : (
                <button style={{border: 0, background: 'none'}} type="button">
                    <PlusOutlined/>
                    <div style={{marginTop: 8}}>Upload</div>
                </button>
            )}
        </Upload>
    );
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