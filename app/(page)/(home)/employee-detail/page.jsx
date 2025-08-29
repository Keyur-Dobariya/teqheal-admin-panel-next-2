'use client';

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CardProfilePage from "../CardProfilePage";
import {AppDataFields, useAppData} from "../../../masterData/AppDataContext";

function EmployeeDetailContent() {
    const searchParams = useSearchParams();
    const employeeCode = searchParams?.get('user') || 'default';
    const { usersData, updateAppDataField } = useAppData();

    const filterUserData = usersData?.find((u) => u.employeeCode === employeeCode);

    return <CardProfilePage profileData={filterUserData} handleEditSuccess={(updatedUser) => {
        const updatedUsers = usersData.map(user =>
            user._id === updatedUser._id ? updatedUser : user
        );
        updateAppDataField(AppDataFields.usersData, updatedUsers);
    }} />;
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EmployeeDetailContent />
        </Suspense>
    );
}