'use client';

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CardProfilePage from "../CardProfilePage";

function EmployeeDetailContent() {
    const searchParams = useSearchParams();
    const employeeCode = searchParams?.get('user') || 'default';

    return <CardProfilePage employeeCode={employeeCode} />;
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EmployeeDetailContent />
        </Suspense>
    );
}