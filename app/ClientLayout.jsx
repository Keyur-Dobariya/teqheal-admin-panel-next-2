"use client";

import {useEffect, useState} from "react";
import { ConfigProvider, message } from "antd";
import { usePathname } from "next/navigation";
import { capitalizeLastPathSegment } from "./utils/utils";
import appString from "./utils/appString";
import { setGlobalMessageApi } from "./components/CommonComponents";
import appColor from "./utils/appColor";

export default function ClientLayout({ children }) {
    const [messageApi, contextHolder] = message.useMessage();
    setGlobalMessageApi(messageApi);

    const [isInstalled, setIsInstalled] = useState(false);

    const pathname = usePathname();
    const urlToTitle = capitalizeLastPathSegment(pathname);
    const pageTitle = urlToTitle
        ? `${urlToTitle} - ${appString.appNameFull}`
        : `${appString.appNameFull} - ${appString.empSystem}`;

    useEffect(() => {
        document.title = pageTitle;
    }, [pathname]);

    useEffect(() => {
        // Check if app is running in standalone mode
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsInstalled(true);
        }

        // Some browsers (iOS Safari) use `navigator.standalone`
        if (window.navigator.standalone === true) {
            setIsInstalled(true);
        }
    }, []);


    const antdTheme = {
        components: {
            Input: {},
            Button: { contentFontSizeLG: 15 },
            Card: { bodyPadding: 0, headerPadding: 15 },
            Timeline: { itemPaddingBottom: 0 },
            Dropdown: { fontSize: 14 },
            Tabs: { fontSize: 14 },
            Table: { cellFontSize: 15 },
        },
        token: {
            colorPrimary: appColor.secondPrimary,
            colorBorderSecondary: appColor.borderClr,
            borderRadius: 8,
            fontFamily: "var(--font-sans)",
            fontSize: 13,
        },
    };

    return (
        <ConfigProvider componentSize="large" theme={antdTheme}>
            {/*{isInstalled ? (*/}
            {/*    <p>✅ App is installed</p>*/}
            {/*) : (*/}
            {/*    <p>📱 App is not installed (running in browser)</p>*/}
            {/*)}*/}
            {contextHolder}
            {children}
        </ConfigProvider>
    );
}
