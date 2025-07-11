// Ensure this component is executed only on the client-side
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import CardProfilePage from '../CardProfilePage';

function ProfileContent() {
    const searchParams = useSearchParams();
    const employeeCode = searchParams.get('user');

    if (!employeeCode) {
        return <div>Loading...</div>;
    }

    return <CardProfilePage employeeCode={employeeCode} />;
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading Profile...</div>}>
            <ProfileContent />
        </Suspense>
    );
}