// Ensure this component is executed only on the client-side
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import CardProfilePage from '../CardProfilePage';

export default function Page() {
    const searchParams = useSearchParams();
    const [employeeCode, setEmployeeCode] = useState(null);

    useEffect(() => {
        // Get the `user` parameter from searchParams on the client-side
        const user = searchParams.get('user');
        setEmployeeCode(user);
    }, [searchParams]); // Re-run when searchParams change

    if (employeeCode === null) {
        // You can show a loading indicator until the `employeeCode` is set
        return <div>Loading...</div>;
    }

    // Once employeeCode is available, render the CardProfilePage
    return (
        <Suspense fallback={<div>Loading Profile...</div>}>
            <CardProfilePage employeeCode={employeeCode} />
        </Suspense>
    );
}
