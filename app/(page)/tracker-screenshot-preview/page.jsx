'use client';

import { useEffect, useState } from 'react';

export default function ScreenshotPreview() {
    const [imageSrc, setImageSrc] = useState('');
    const [count, setCount] = useState(3);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const img = params.get('image');
        if (img) setImageSrc(img);

        const timer = setInterval(() => {
            setCount((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    window.close();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full h-full bg-white border border-gray-300 flex flex-col font-sans">
            <div className="bg-gray-100 p-1 px-2 text-sm text-gray-800 flex justify-between">
                <b>Paused</b>
                <span className="text-xs">Ctrl+Win+R to Reject</span>
            </div>
            <div className="flex-1 p-1 text-center">
                {imageSrc && (
                    <img
                        src={imageSrc}
                        alt="Screenshot"
                        className="w-full max-h-32 object-contain border border-gray-300"
                    />
                )}
            </div>
            <div className="flex justify-between items-center p-2">
                <button className="bg-gray-200 px-3 py-1 rounded text-sm text-black">
                    Accept <span className="text-gray-500 text-xs">{count}s</span>
                </button>
                <button
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    onClick={() => window.close()}
                >
                    Reject
                </button>
            </div>
        </div>
    );
}
