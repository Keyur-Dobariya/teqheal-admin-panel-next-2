'use client';

import {useSearchParams} from "next/navigation";
import CardProfilePage from "../CardProfilePage";
import {Suspense} from "react";

export default function Page() {
    const searchParams = useSearchParams();
    const employeeCode = searchParams.get('user');

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CardProfilePage employeeCode={employeeCode} />
        </Suspense>
    );
}