import {useCallback, useState} from "react";

export function useActionLoading() {
    const [loadingMap, setLoadingMap] = useState({});

    const startLoading = useCallback((key) => {
        setLoadingMap((prev) => ({ ...prev, [key]: true }));
    }, []);

    const stopLoading = useCallback((key) => {
        setLoadingMap((prev) => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
        });
    }, []);

    const runWithLoading = useCallback(
        async (key, action) => {
            try {
                startLoading(key);
                await new Promise((resolve) => setTimeout(resolve, 100));
                return await action();
            } finally {
                stopLoading(key);
            }
        },
        [startLoading, stopLoading]
    );

    const isLoading = useCallback(
        (key) => !!loadingMap[key],
        [loadingMap]
    );

    const withLoading = useCallback(
        (key = 'actionManage') => ({
            run: (action) => runWithLoading(key, action),
            loading: isLoading(key),
        }),
        [runWithLoading, isLoading]
    );

    return {
        loadingMap,
        startLoading,
        stopLoading,
        runWithLoading,
        isLoading,
        withLoading,
    };
}
