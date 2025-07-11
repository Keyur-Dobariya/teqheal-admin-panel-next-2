'use client';

import './globals.css';
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
import appKey from './utils/appKey';
import InnerAppLayout from './InnerAppLayout';
import {PageRoutingProvider} from "./appContext/PageRoutingContext";

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
            Table: { /*headerBorderRadius: 0, */cellFontSize: 15},
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
                    <InnerAppLayout>{children}</InnerAppLayout>
                </AppDataProvider>
            </ConfigProvider>
        </AntdRegistry>
        </body>
        </html>
    );
}
