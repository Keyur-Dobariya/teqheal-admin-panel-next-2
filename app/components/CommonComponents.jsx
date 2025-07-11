import {message, Tag} from "antd";
import {formatMilliseconds} from "../utils/utils";
import appColor from "../utils/appColor";

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