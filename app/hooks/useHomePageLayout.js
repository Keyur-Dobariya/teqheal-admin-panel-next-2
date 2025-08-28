import { useState } from 'react';
import { Grid } from 'antd';
import { usePathname } from 'next/navigation';
import {useProtectedRouter} from "./useProtectedRouter";

const { useBreakpoint } = Grid;

export default function useHomePageLayout({ mobileBreakpoint = 'md' } = {}) {
    const screens = useBreakpoint();

    const isMobile = !screens[mobileBreakpoint];

    const [collapsed, setCollapsed] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);

    const pathname = usePathname();
    const { push } = useProtectedRouter();

    return {
        isMobile,
        screens,
        collapsed,
        setCollapsed,
        drawerVisible,
        setDrawerVisible,
        pathname,
        push,
    };
}