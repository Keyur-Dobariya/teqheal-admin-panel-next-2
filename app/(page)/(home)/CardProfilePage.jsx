'use client';

import React, { useState, useEffect } from "react";
import {
    Avatar, Button,
    Card,
    Col,
    Row, Skeleton,
    Tag,
} from "antd";

import { AppDataFields, useAppData } from "../../masterData/AppDataContext";

import { EditOutlined, XOutlined } from "@ant-design/icons";
import appString from "../../utils/appString";
import {
    ApprovalStatus,
} from "../../utils/enum";
import { format } from 'date-fns';
import { getLocalData } from "../../dataStorage/DataPref";
import { capitalizeLastPathSegment } from "../../utils/utils";
import appKeys from "../../utils/appKeys";
import { CreditCard, Facebook, Instagram, Linkedin, User } from "../../utils/icons";
import appColor from "../../utils/appColor";
import EmpAddUpdateModel from "../../models/EmpAddUpdateModel";
import SafeAvatar from "../../components/SafeAvatar";

export default function CardProfilePage({ profileData, handleEditSuccess }) {
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const openModalWithLoading = () => {
        setActionLoading(true);
        setTimeout(() => {
            setIsModelOpen(true);
            setActionLoading(false);
        }, 100);
    };

    const handleEditClick = (record) => {
        openModalWithLoading(true, record);
    };

    const handleSuccess = (updatedUser) => {
        handleEditSuccess(updatedUser);
        setIsModelOpen(false);
    };

    const approvalStatusColor = (status) => {
        return status === ApprovalStatus.Approved ? 'green' : status === ApprovalStatus.Rejected ? 'red' : 'orange';
    }

    const CommonInfoBox = ({ title, value, isTag = false, tagColor = 'blue' }) => {
        return <Col xs={24} sm={12} md={8} >
            <div className="text-[13px] font-normal text-gray-500">{title}</div>
            {profileData ? <div className="text-[14px] font-medium text-gray-900 mt-1">{value ? isTag ?
                <Tag bordered={true} color={tagColor}>{value}</Tag> : value : '-'}</div> : <Skeleton active title={false} paragraph={{ rows: 1 }}  />}
        </Col>;
    }

    return (
        <>
            <Card loading={!profileData}>
                <div className="flex flex-col gap-5 p-5">
                    <div className="flex justify-between items-center font-medium text-[17px]">
                        <div>{appString.profile}</div>
                        <Button disabled={!profileData} loading={actionLoading} icon={<EditOutlined />} onClick={handleEditClick}>{appString.edit}</Button>
                    </div>
                    <Card>
                        <div className="flex flex-col sm:flex-col md:flex-row justify-between items-center gap-4 p-5 md:p-4 text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <SafeAvatar
                                    userData={profileData}
                                    size={80}
                                />
                                <div className="flex flex-col gap-2 mt-2 md:mt-0">
                                    {profileData ? <div className="font-semibold text-lg md:text-base">
                                        {profileData?.fullName} {profileData?._id === getLocalData(appKeys._id) ? "(You)" : ''}
                                    </div> : <Skeleton active title={false} paragraph={{ rows: 1 }}  />}
                                    {profileData ? <div className="text-sm text-gray-600">
                                        {profileData?.role} | {profileData?.employeeCode}
                                    </div> : <Skeleton active title={false} paragraph={{ rows: 1 }}  />}
                                </div>
                            </div>
                            <div className="flex gap-3 mt-2 md:mt-0">
                                <Button shape="circle" color="geekblue" variant="outlined" icon={<Facebook />} />
                                <Button shape="circle" color="geekblue" variant="outlined" icon={<XOutlined />} />
                                <Button shape="circle" color="geekblue" variant="outlined" icon={<Linkedin />} />
                                <Button shape="circle" color="geekblue" variant="outlined" icon={<Instagram />} />
                            </div>
                        </div>
                    </Card>
                    <Card
                        title={(
                            <div className="flex items-center gap-2">
                                <User color={appColor.danger} />
                                <div>{appString.personalDetails}</div>
                            </div>
                        )} styles={{ body: { padding: 20 } }}>
                        <Row gutter={[16, 30]}>
                            <CommonInfoBox title={appString.fullName} value={profileData?.fullName} />
                            <CommonInfoBox title={appString.emailAddress} value={profileData?.emailAddress} />
                            <CommonInfoBox title={appString.dateOfBirth} value={profileData?.dateOfBirth ? format(new Date(profileData?.dateOfBirth), 'dd MMMM, yyyy') : null} />
                            <CommonInfoBox title={appString.mobileNumber} value={profileData?.mobileNumber} />
                            <CommonInfoBox title={appString.emergencyContactNo} value={profileData?.emergencyContactNo} />
                            <CommonInfoBox title={appString.gender} value={profileData?.gender} />
                            <CommonInfoBox title={appString.bloodGroup} value={profileData?.bloodGroup} />
                            <CommonInfoBox title={appString.role} value={profileData?.role} />
                            <CommonInfoBox title={appString.approvalStatus} value={capitalizeLastPathSegment(profileData?.approvalStatus)} isTag={true} tagColor={approvalStatusColor(profileData?.approvalStatus)} />
                            <CommonInfoBox title={appString.address} value={profileData?.address} />
                            <CommonInfoBox title={appString.pincode} value={profileData?.pincode} />
                        </Row>
                    </Card>
                    <Card
                        title={(
                            <div className="flex items-center gap-2">
                                <CreditCard color={appColor.warning} />
                                <div>{appString.financialDetails}</div>
                            </div>
                        )} styles={{ body: { padding: 20 } }}>
                        <Row gutter={[16, 30]}>
                            <CommonInfoBox title={appString.aadharNumber} value={profileData?.aadharNumber} />
                            <CommonInfoBox title={appString.panNumber} value={profileData?.panNumber} />
                            <CommonInfoBox title={appString.bankAccountNumber} value={profileData?.bankAccountNumber} />
                            <CommonInfoBox title={appString.ifscCode} value={profileData?.ifscCode} />
                            <CommonInfoBox title={appString.dateOfJoining} value={profileData?.dateOfJoining ? format(new Date(profileData?.dateOfJoining), 'dd MMMM, yyyy') : null} />
                        </Row>
                    </Card>
                </div>
            </Card>
            {isModelOpen && (
                <EmpAddUpdateModel
                    isModelOpen={isModelOpen}
                    setIsModelOpen={setIsModelOpen}
                    selectedRecord={profileData}
                    onSuccessCallback={handleSuccess}
                />
            )}
        </>
    );
}
