'use client';

import CardTrackerClockInOut from "./CardTrackerClockInOut";
import CardTrackerAppBar from "./CardTrackerAppBar";

export default function Page() {
    return (
        <div className="flex flex-col h-screen p-4 gap-4">
            <CardTrackerAppBar />
            <div className="flex-1 overflow-auto">
                <CardTrackerClockInOut />
            </div>
        </div>
    );
}