// Ensure this component is executed only on the client-side
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import CardProfilePage from '../CardProfilePage';
import {AppDataFields, useAppData} from "../../../masterData/AppDataContext";

function ProfileContent() {
    const searchParams = useSearchParams();
    const employeeCode = searchParams.get('user');
    const { usersData, loginUserData, updateAppDataField } = useAppData();

    if (!employeeCode) {
        return <div>Loading...</div>;
    }

    return <CardProfilePage profileData={loginUserData} handleEditSuccess={(updatedUser) => {
        const updatedUsers = usersData.map(user =>
            user._id === updatedUser._id ? updatedUser : user
        );
        updateAppDataField(AppDataFields.usersData, updatedUsers);
    }} />;
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading Profile...</div>}>
            <ProfileContent />
        </Suspense>
    );
}