'use client';

import React, { useState, useEffect } from 'react';
import { Popover } from 'antd';
import { CornerDownLeft } from '../../../utils/icons';
import { ArrowDownOutlined, DeleteOutlined, EditOutlined, LinkOutlined } from "@ant-design/icons";

const ContextMenuPopover = ({ isFile = false, fileUrl = null, isMe, handleClick, dynamicClick = false, children }) => {
    const [contextMenuVisible, setContextMenuVisible] = useState(false);

    const handleRightClick = (e) => {
        e.preventDefault();
        setContextMenuVisible(true);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.contextMenuWrapper')) {
                setContextMenuVisible(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleMenuItemClick = (action) => {
        handleClick(action, fileUrl);
        handleCloseMenu();
    };

    const handleCloseMenu = () => {
        setContextMenuVisible(dynamicClick);
    };

    const popoverContent = (
        <div style={{ minWidth: 130 }}>
            <div className="popover-item" onClick={() => handleMenuItemClick("reply")}>
                <CornerDownLeft className="blackIconStyle" style={{ marginRight: 8 }} />
                Reply
            </div>
            {isFile && (
                <>
                    <div className="popover-item" onClick={() => handleMenuItemClick("copy")}>
                        <LinkOutlined style={{ marginRight: 8 }} />
                        Copy link
                    </div>
                    <div className="popover-item" onClick={() => handleMenuItemClick("download")}>
                        <ArrowDownOutlined style={{ marginRight: 8 }} />
                        Download
                    </div>
                </>
            )}
            {!isFile && isMe && (
                <div className="popover-item" onClick={() => handleMenuItemClick("edit")}>
                    <EditOutlined style={{ marginRight: 8 }} />
                    Edit
                </div>
            )}
            {isMe && (
                <div className="popover-item" onClick={() => handleMenuItemClick("delete")}>
                    <DeleteOutlined style={{ marginRight: 8 }} />
                    Delete
                </div>
            )}
        </div>
    );

    return (
        <div className="contextMenuWrapper" onContextMenu={handleRightClick} onClick={handleCloseMenu}>
            <Popover
                content={popoverContent}
                trigger="none"
                className="messageReaction"
                placement="bottom"
                open={contextMenuVisible}
                onOpenChange={setContextMenuVisible}
            >
                {children}
            </Popover>
        </div>
    );
};

export default ContextMenuPopover;
