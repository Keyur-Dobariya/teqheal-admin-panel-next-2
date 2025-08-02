'use client';

import './globals.css';
import './calender.css';
import {ConfigProvider, message} from 'antd';
import appColor from './utils/appColor';
import {AntdRegistry} from '@ant-design/nextjs-registry';
import {usePathname} from 'next/navigation';
import {createContext, useContext, useEffect, useRef, useState} from 'react';
import {capitalizeLastPathSegment} from './utils/utils';
import appString from './utils/appString';
import {setGlobalMessageApi} from './components/CommonComponents';
import {AppDataProvider} from './masterData/AppDataContext';
import {getLocalData} from './dataStorage/DataPref';
import appKeys from './utils/appKeys';
import InnerAppLayout from './InnerAppLayout';
import {PageRoutingProvider} from "./appContext/PageRoutingContext";
import AuthWrapper from './components/AuthWrapper';

export default function RootLayout({children}) {
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
            Button: {contentFontSizeLG: 15},
            Card: {bodyPadding: 0, headerPadding: 15},
            Timeline: {itemPaddingBottom: 0},
            Dropdown: {fontSize: 14},
            Tabs: {/*margin: 0, */fontSize: 14},
            Table: { cellFontSize: 15},
        },
        token: {
            colorPrimary: appColor.secondPrimary,
            colorBorderSecondary: appColor.borderClr,
            borderRadius: 8,
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
        },
    };

    return (
        <html lang="en">
        <body className="antialiased" cz-shortcut-listen="true">
        <AntdRegistry>
            <ConfigProvider
                componentSize="large"
                theme={antdTheme}
            >
                {contextHolder}
                <AppDataProvider>
                    <AuthWrapper>
                        {children}
                    </AuthWrapper>
                </AppDataProvider>
            </ConfigProvider>
        </AntdRegistry>
        </body>
        </html>
    );
}
