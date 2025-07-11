'use client';

import {useSearchParams} from "next/navigation";
import CardProfilePage from "../CardProfilePage";

export default function Page() {
    const searchParams = useSearchParams();
    const employeeCode = searchParams.get('user');

    return <CardProfilePage employeeCode={employeeCode} />;
}