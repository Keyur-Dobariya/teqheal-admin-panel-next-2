'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import CardProfilePage from '../CardProfilePage';

export default function Page() {
    const searchParams = useSearchParams();
    const [employeeCode, setEmployeeCode] = useState(null);

    useEffect(() => {
        const user = searchParams.get('user');
        setEmployeeCode(user);
    }, [searchParams]);

    if (employeeCode === null) {
        return <div>Loading...</div>;
    }

    return <CardProfilePage employeeCode={employeeCode} />;
}