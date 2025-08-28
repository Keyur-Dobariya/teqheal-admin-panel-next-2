const enumRouteType = {
    public: 'public',
    admin: 'admin',
    protected: 'protected',
}

const routeConfig = {
    //============ Public Routes ==============//
    rootPage: { path: '/', type: enumRouteType.public },
    loginPage: { path: '/login', type: enumRouteType.public },
    signupPage: { path: '/signup', type: enumRouteType.public },
    forgotPasswordPage: { path: '/forgot-password', type: enumRouteType.public },

    //============ Protected Routes(JWT Authorization) ==============//
    dashboard: { path: '/dashboard', type: enumRouteType.protected },
    tracker: { path: '/tracker', type: enumRouteType.protected },
    client: { path: '/client', type: enumRouteType.protected },
    project: { path: '/project', type: enumRouteType.protected },
    tasks: { path: '/tasks', type: enumRouteType.protected },
    leave: { path: '/leave', type: enumRouteType.protected },
    leaveReport: { path: '/leave-report', type: enumRouteType.protected },
    salaryReport: { path: '/salary-report', type: enumRouteType.protected },
    calendar: { path: '/calendar', type: enumRouteType.protected },
    chatting: { path: '/chatting', type: enumRouteType.protected },
    myProfile: { path: '/my-profile', type: enumRouteType.protected },
    calling: { path: '/dashboard', type: enumRouteType.protected },

    //============ Protected Routes(JWT Authorization & Admin) ==============//
    employeeDetail: { path: '/employee-detail', type: enumRouteType.admin },
    employees: { path: '/employees', type: enumRouteType.admin },
    todayReport: { path: '/today-report', type: enumRouteType.admin },
    basicSalary: { path: '/basic-salary', type: enumRouteType.admin },
    dailyUpdate: { path: '/daily-update', type: enumRouteType.admin },
    punchReport: { path: '/punch-report', type: enumRouteType.admin },
    application: { path: '/application', type: enumRouteType.admin },
    settings: { path: '/settings', type: enumRouteType.admin },
    appUpdate: { path: '/app-update', type: enumRouteType.admin },
};

const pageRoutes = new Proxy(routeConfig, {
    get(target, prop) {
        const route = target[prop];
        if (route && typeof route === 'object' && 'path' in route) {
            return route.path;
        }
        return undefined;
    },
});

const publicRoutes = Object.values(routeConfig)
    .filter(route => route.type === enumRouteType.public)
    .map(route => route.path);

const protectedRoutes = Object.values(routeConfig)
    .filter(route => route.type === enumRouteType.protected)
    .map(route => route.path);

const adminRoutes = Object.values(routeConfig)
    .filter(route => route.type === enumRouteType.admin)
    .map(route => route.path);

export {
    pageRoutes,
    routeConfig,
    publicRoutes,
    protectedRoutes,
    adminRoutes,
};