"use client";

import { useEffect } from "react";
import { ConfigProvider, message } from "antd";
import { usePathname } from "next/navigation";
import { capitalizeLastPathSegment } from "./utils/utils";
import appString from "./utils/appString";
import { setGlobalMessageApi } from "./components/CommonComponents";
import appColor from "./utils/appColor";

export default function ClientLayout({ children }) {
    const [messageApi, contextHolder] = message.useMessage();
    setGlobalMessageApi(messageApi);

    const pathname = usePathname();
    const urlToTitle = capitalizeLastPathSegment(pathname);
    const pageTitle = urlToTitle
        ? `${urlToTitle} - ${appString.appNameFull}`
        : `${appString.appNameFull} - ${appString.empSystem}`;

    useEffect(() => {
        document.title = pageTitle;
    }, [pathname]);

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
            {contextHolder}
            {children}
        </ConfigProvider>
    );
}
