'use client'

import {useEffect, useState} from "react";
import {pageRoutes} from "../../../utils/pageRoutes";
import {HomeOutlined, UserOutlined} from "@ant-design/icons";
import {capitalizeLastPathSegment} from "../../../utils/utils";
import {Breadcrumb} from "antd";
import {menuItems} from "./sideBarMenu";

export default function BreadcrumbGenerator({pathname}) {
    const [breadcrumbItems, setBreadcrumbItems] = useState([]);

    useEffect(() => {
        const breadcrumbItems = generateBreadcrumbFromPath(pathname);
        setBreadcrumbItems(breadcrumbItems);
    }, [pathname]);

    const generateBreadcrumbFromPath = (pathname) => {
        const pathSegments = pathname.split('/').filter(Boolean);
        const breadcrumbItems = [];

        const isDashboard = pathname === pageRoutes.dashboard;
        if (!isDashboard) {
            breadcrumbItems.push({
                key: pageRoutes.dashboard,
                icon: <HomeOutlined />,
                label: '',
            });
        }

        let currentPath = '';
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;

            if (currentPath === pageRoutes.dashboard && !isDashboard) {
                return;
            }

            const menuItem = findMenuItemByPath(currentPath);

            let label = capitalizeLastPathSegment(segment);
            let icon = menuItem?.icon || <HomeOutlined />;

            if (segment === 'employee-detail') {
                label = 'Employee Detail';
                icon = <UserOutlined />;
            }

            breadcrumbItems.push({
                key: currentPath,
                icon: icon,
                label: label,
            });
        });

        return breadcrumbItems;
    };

    const findMenuItemByPath = (path) => {
        const findInItems = (items) => {
            for (const item of items) {
                if (item.key === path) {
                    return item;
                }
                if (item.children) {
                    const found = findInItems(item.children);
                    if (found) return found;
                }
            }
            return null;
        };
        return findInItems(menuItems);
    };

    return !pageRoutes.dashboard.includes(pathname) && <Breadcrumb
        separator=">"
        style={{ margin: "12px 12px 5px 25px" }}
        items={breadcrumbItems.map(item => ({
            key: item.key,
            title: (
                item.key === pageRoutes.dashboard ? <HomeOutlined
                    className="flex items-center gap-1 cursor-pointer hover:text-blue-700"
                    onClick={() => push(item.key)}
                /> : <span
                    className="flex items-center gap-1 cursor-default"
                >{item.icon}{item.label}</span>
            ),
        }))}
    />
}