import { useState, useCallback, useRef } from "react";
import { Modal } from "antd";

export function useAntdModal(defaultOpen = false) {
    const [isModelOpen, setIsModelOpen] = useState(defaultOpen);

    const onShowRef = useRef(null);
    const onHideRef = useRef(null);

    const showModel = useCallback((callback) => {
        setIsModelOpen(true);
        if (callback) onShowRef.current = callback;
        if (onShowRef.current) onShowRef.current();
    }, []);

    const hideModel = useCallback((callback) => {
        setIsModelOpen(false);
        if (callback) onHideRef.current = callback;
        if (onHideRef.current) onHideRef.current();
    }, []);

    const toggle = useCallback(() => {
        setIsModelOpen((prev) => {
            const newState = !prev;
            if (newState && onShowRef.current) onShowRef.current();
            if (!newState && onHideRef.current) onHideRef.current();
            return newState;
        });
    }, []);

    const ModalUI = useCallback(
        ({ children, title, ...props }) => (
            <Modal
                title={title}
                open={isModelOpen}
                onCancel={() => hideModel()}
                onClose={() => hideModel()}
                onOk={() => hideModel()}
                {...props}
            >
                {children}
            </Modal>
        ),
        [isModelOpen, hideModel]
    );

    return {
        isModelOpen,
        showModel,
        hideModel,
        toggle,
        ModalUI,
    };
}
