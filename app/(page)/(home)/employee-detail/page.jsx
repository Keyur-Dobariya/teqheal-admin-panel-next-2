'use client';

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CardProfilePage from "../CardProfilePage";
import {useAppData} from "../../../masterData/AppDataContext";

function EmployeeDetailContent() {
    const searchParams = useSearchParams();
    const employeeCode = searchParams?.get('user') || 'default';
    const { usersData } = useAppData();

    const filterUserData = usersData?.find((u) => u.employeeCode === employeeCode);

    return <CardProfilePage profileData={filterUserData} />;
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EmployeeDetailContent />
        </Suspense>
    );
}