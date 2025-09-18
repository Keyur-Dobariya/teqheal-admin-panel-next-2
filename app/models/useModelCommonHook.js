import {useEffect, useRef, useState} from "react";
import {Form} from "antd";

export function useModelCommonHook() {

    const [form] = Form.useForm();
    const [isModelOpen, setIsModelOpen] = useState(false);
    const containerRef = useRef(null);

    const showModel = (onShow = null) => {
        form.resetFields();
        if (onShow) onShow();
        setIsModelOpen(true);
    };

    const hideModel = (onHide = null) => {
        if (onHide) onHide();
        setIsModelOpen(false);
        form.resetFields();
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    };

    return {
        form,
        containerRef,
        isModelShowing: isModelOpen,
        showModel,
        hideModel,
    };
}
