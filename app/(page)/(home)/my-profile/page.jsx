// Ensure this component is executed only on the client-side
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import CardProfilePage from '../CardProfilePage';
import {AppDataFields, useAppData} from "../../../masterData/AppDataContext";

function ProfileContent() {
    const searchParams = useSearchParams();
    const employeeCode = searchParams.get('user');
    const { usersData } = useAppData();

    const filterUserData = usersData?.find((u) => u.employeeCode === employeeCode);

    if (!employeeCode) {
        return <div>Loading...</div>;
    }

    return <CardProfilePage profileData={filterUserData} />;
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading Profile...</div>}>
            <ProfileContent />
        </Suspense>
    );
}