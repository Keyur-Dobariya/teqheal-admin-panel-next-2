'use client'

import React from "react";
import {
    Button,
    Modal
} from "antd";

import {AlertCircle} from "../../../utils/icons";
import appColor from "../../../utils/appColor";
import appString from "../../../utils/appString";

export default function LogOutModel({ isModelOpen, setIsModelOpen }) {
    return (
        <Modal
            title={<div className="text-[16px] font-medium flex items-center gap-2"><AlertCircle color={appColor.danger} />{appString.confirmation}</div>}
            width={400}
            maskClosable={true}
            centered
            closeIcon={false}
            open={isModelOpen}
            footer={null}
            onCancel={() => setIsModelOpen(false)}
            onClose={() => setIsModelOpen(false)}
        >
            <div className="text-[15px] font-medium mb-6">
                {appString.logoutConfirmation}
            </div>
            <div className="flex justify-end gap-2">
                <Button
                    onClick={() => setIsModelOpen(false)}
                >
                    Cancel
                </Button>
                <Button
                    type="primary"
                    danger
                    onClick={() => {
                        localStorage.clear();
                        setIsModelOpen(false);
                    }}
                >
                    {appString.logOut}
                </Button>
            </div>
        </Modal>
    );
}
