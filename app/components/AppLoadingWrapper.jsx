'use client';

import { useEffect, useState } from 'react';
import { LoadingComponent } from './LoadingComponent';

export default function AppLoadingWrapper({ children }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="w-screen h-screen flex justify-center items-center">
                <LoadingComponent />
            </div>
        );
    }

    return children;
}