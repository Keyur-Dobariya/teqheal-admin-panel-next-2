import { useEffect, useRef, useState } from "react";

export function useRunOnce(callbacks) {
    const triggered = useRef(false);
    const [fetchLoading, setFetchLoading] = useState(false);

    useEffect(() => {
        if (!triggered.current) {
            triggered.current = true;
            setFetchLoading(true);

            const runAll = async () => {
                try {
                    if (Array.isArray(callbacks)) {
                        for (const cb of callbacks) {
                            await Promise.resolve(cb?.());
                        }
                    } else {
                        await Promise.resolve(callbacks?.());
                    }
                } catch (err) {
                    console.error("useRunOnce error:", err);
                } finally {
                    setFetchLoading(false);
                }
            };

            runAll();
        }
    }, [callbacks]);

    return { fetchLoading };
}
