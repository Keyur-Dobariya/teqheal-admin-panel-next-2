import React from "react";
import CardProfilePage from "../../CardProfilePage";

export async function generateStaticParams() {
    return [
        { id: ['default'] }
    ];
}

export default function Page({ params }) {
    const employeeCode = params?.id?.[0] || 'default';

    return <CardProfilePage employeeCode={employeeCode} isMyProfile={false} />;
}