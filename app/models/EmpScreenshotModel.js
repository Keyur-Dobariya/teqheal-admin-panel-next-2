'use client'

import React, { useEffect, useState } from "react";
import {Modal, Spin, Button, message, Tooltip, Popconfirm} from "antd";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import axios from "axios";
import { endpoints } from "../api/apiEndpoints";
import { DeleteFilled, DeleteOutlined } from "@ant-design/icons";
import {formatTimestamp} from "../utils/utils";
import appColor from "../utils/appColor";
import appString from "../utils/appString";
import {Trash2} from "../utils/icons";

const EmpScreenshotModel = ({
  open,
  setSsModelOpen,
  loading,
  screenshots,
  setScreenshots,
  empID,
}) => {
  const [galleryItems, setGalleryItems] = useState([]);

  const handleDelete = async (id, imageUrl) => {
    try {
      const response = await axios.delete(
        `${endpoints.deleteScreenshot}?id=${empID}&ssid=${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.status === 200) {
        const updatedScreenshots = screenshots?.filter(
          (item, i) => item._id !== id
        );
        setScreenshots(updatedScreenshots);
        message.success("Screenshot deleted successfully");
      } else {
        message.error("Failed to delete screenshot");
      }
    } catch (error) {
      message.error("An error occurred while deleting the screenshot");
    }
  };

  useEffect(() => {
    setGalleryItems(
      screenshots?.map((item, index) => ({
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
                <Popconfirm title={appString.deleteConfirmation} onConfirm={() => handleDelete(screenshots[index]?._id)}>
                    <Tooltip title={appString.delete} placement="bottom">
                        <div className="cursor-pointer">
                            <DeleteFilled style={{ color: appColor.danger }} />
                        </div>
                    </Tooltip>
                </Popconfirm>
            </div>
          </div>
        ),
      }))
    );
  }, [screenshots]);

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
      {loading ? (
        <div className="h-125 flex justify-center items-center">
          <Spin active />
        </div>
      ) : galleryItems && galleryItems.length > 0 ? (
        <div className="bg-black">
          <ImageGallery key={galleryItems.length} items={galleryItems} showPlayButton={false} showNav={false} />
        </div>
      ) : (
        <p className="text-black text-center">
          {" "}
          No screenshots available.{" "}
        </p>
      )}
    </Modal>
  );
};

export default EmpScreenshotModel;
