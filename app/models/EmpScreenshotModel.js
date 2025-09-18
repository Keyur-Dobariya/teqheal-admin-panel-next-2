'use client'

import React, {useEffect, useState} from "react";
import {Modal, Spin, Button, message, Tooltip, Popconfirm, Empty} from "antd";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import {DeleteFilled} from "@ant-design/icons";
import {formatTimestamp} from "../utils/utils";
import appColor from "../utils/appColor";
import appString from "../utils/appString";
import {useApiServices} from "../api/useApiServices";
import {useActionLoading} from "../hooks/useActionLoading";

const EmpScreenshotModel = ({
                                open,
                                setSsModelOpen,
                                selectedRecord,
                            }) => {
    const {attendance: callApi} = useApiServices();
    const {withLoading} = useActionLoading();

    const [screenshots, setScreenshots] = useState([]);
    const [galleryItems, setGalleryItems] = useState([]);

    const handleDelete = async (payload) => {
        const data = await callApi.deleteScreenshot(payload);
        setScreenshots(data?.screenshots || selectedRecord?.screenshots)
    };

    useEffect(() => {
        if (screenshots?.length > 0) {
            const items = screenshots.map((item, index) => ({
                original: item.image,
                thumbnail: item.image,
                renderItem: () => (
                    <div className="relative">
                        <img
                            src={item.image}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full"
                        />
                        <div className="flex flex-row items-center px-2 py-[6px] absolute left-1 bottom-1 z-3 rounded-md bg-gray-900/90 text-[13px] text-white gap-3">
                            <div>
                                {`${formatTimestamp(item?.capturedTime)} • ${
                                    item.keyPressCount ? item.keyPressCount : "0"
                                } Keyboard hits  •  ${
                                    item.mouseEventCount ? item.mouseEventCount : "0"
                                } Mouse clicks`}
                            </div>
                            <Popconfirm
                                title={appString.deleteConfirmation}
                                onConfirm={async () => {
                                    const payload = {
                                        attendanceId: selectedRecord._id,
                                        screenshotId: screenshots[index]?._id,
                                    };
                                    await handleDelete(payload);
                                }}
                            >
                                <Tooltip title={appString.delete} placement="bottom">
                                    <div className="cursor-pointer">
                                        <DeleteFilled style={{ color: appColor.danger }} />
                                    </div>
                                </Tooltip>
                            </Popconfirm>
                        </div>
                    </div>
                ),
            }));
            setGalleryItems(items);
        } else {
            setGalleryItems([]);
        }
    }, [screenshots]);

    useEffect(() => {
        if (selectedRecord?._id) {
            withLoading(selectedRecord._id).run(async () => {
                setScreenshots(selectedRecord?.screenshots || []);
            });
        }
    }, [selectedRecord]);

    return (
        <Modal
            title="Screenshot Viewer"
            open={open}
            onCancel={() => {
                setSsModelOpen(false);
            }}
            onClose={() => {
                setSsModelOpen(false);
            }}
            centered
            footer={null}
            width={900}
        >
            <Spin spinning={withLoading(selectedRecord._id).loading}>
                {galleryItems && galleryItems.length > 0 ? (
                    <div className="bg-black">
                        <ImageGallery key={galleryItems.length} items={galleryItems} showPlayButton={false}
                                      showNav={false}/>
                    </div>
                ) : (
                    <div className="h-100 flex items-center justify-center">
                        <Empty description="No screenshots available"/>
                    </div>
                )}
            </Spin>
        </Modal>
    );
};

export default EmpScreenshotModel;
