import './globals.css';
import './calender.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import AppLoadingWrapper from './components/AppLoadingWrapper';
import { AppDataProvider } from './masterData/AppDataContext';
import ClientLayout from './ClientLayout';

export const metadata = {
    title: "Teqheal Solution",
    description: "abc",
    manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body className="antialiased">
        <AntdRegistry>
            <ClientLayout>
                <AppLoadingWrapper>
                    <AppDataProvider>{children}</AppDataProvider>
                </AppLoadingWrapper>
            </ClientLayout>
        </AntdRegistry>
        </body>
        </html>
    );
}
