'use client'

import {createContext, useContext, useEffect, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

export const PageRoutingContext = createContext({
    isRouterLoading: false,
    showRouterLoading: () => {},
    hideRouterLoading: () => {},
});

export const useRouterLoading = () => useContext(PageRoutingContext);

export const PageRoutingProvider = ({ children }) => {
    const [isRouterLoading, setIsRouterLoading] = useState(false);

    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        setIsRouterLoading(false);
    }, [pathname, searchParams]);

    const showRouterLoading = () => setIsRouterLoading(true);
    const hideRouterLoading = () => setIsRouterLoading(false);

    return (
        <PageRoutingContext.Provider value={{ isRouterLoading, showRouterLoading, hideRouterLoading }}>
            {children}
        </PageRoutingContext.Provider>
    );
};

export const useCustomRouter = () => {
    const { showRouterLoading } = useRouterLoading();
    const router = useRouter();

    const push = (href) => {
        showRouterLoading();
        router.push(href);
    };

    return {
        ...router,
        push,
    };
};