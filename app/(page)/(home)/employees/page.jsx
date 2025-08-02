'use client';

import CardEmpList from "./CardEmpList";
import ProtectedRoute from "../../../components/ProtectedRoute";

export default function Page() {
    return (
        <ProtectedRoute adminOnly={true}>
            <CardEmpList isDashboard={false} />
        </ProtectedRoute>
    );
}
