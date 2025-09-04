const enumRouteType = {
    public: 'public',
    admin: 'admin',
    protected: 'protected',
}

const routeConfig = {
    //============ Public Routes ==============//
    rootPage: { path: '/', type: enumRouteType.public, key: 'rootPage' },
    loginPage: { path: '/login', type: enumRouteType.public, key: 'loginPage' },
    signupPage: { path: '/signup', type: enumRouteType.public, key: 'signupPage' },
    forgotPasswordPage: { path: '/forgot-password', type: enumRouteType.public, key: 'forgotPasswordPage' },

    //============ Protected Routes(JWT Authorization) ==============//
    dashboard: { path: '/dashboard', type: enumRouteType.protected, key: 'dashboard' },
    tracker: { path: '/tracker', type: enumRouteType.protected, key: 'tracker' },
    client: { path: '/client', type: enumRouteType.protected, key: 'client' },
    project: { path: '/project', type: enumRouteType.protected, key: 'project' },
    tasks: { path: '/tasks', type: enumRouteType.protected, key: 'tasks' },
    leave: { path: '/leave', type: enumRouteType.protected, key: 'leave' },
    leaveReport: { path: '/leave-report', type: enumRouteType.protected, key: 'leaveReport' },
    salaryReport: { path: '/salary-report', type: enumRouteType.protected, key: 'salaryReport' },
    calendar: { path: '/calendar', type: enumRouteType.protected, key: 'calendar' },
    chatting: { path: '/chatting', type: enumRouteType.protected, key: 'chatting' },
    myProfile: { path: '/my-profile', type: enumRouteType.protected, key: 'myProfile' },
    calling: { path: '/dashboard', type: enumRouteType.protected, key: 'calling' },

    //============ Protected Routes(JWT Authorization & Admin) ==============//
    employeeDetail: { path: '/employee-detail', type: enumRouteType.admin, key: 'employeeDetail' },
    employees: { path: '/employees', type: enumRouteType.admin, key: 'employees' },
    todayReport: { path: '/today-report', type: enumRouteType.admin, key: 'todayReport' },
    basicSalary: { path: '/basic-salary', type: enumRouteType.admin, key: 'basicSalary' },
    dailyUpdate: { path: '/daily-update', type: enumRouteType.admin, key: 'dailyUpdate' },
    punchReport: { path: '/punch-report', type: enumRouteType.admin, key: 'punchReport' },
    application: { path: '/application', type: enumRouteType.admin, key: 'application' },
    settings: { path: '/settings', type: enumRouteType.admin, key: 'settings' },
    appUpdate: { path: '/app-update', type: enumRouteType.admin, key: 'appUpdate' },
    rolePermission: { path: '/role-permission', type: enumRouteType.admin, key: 'rolePermission' },
    companies: { path: '/companies', type: enumRouteType.admin, key: 'companies' },
    roles: { path: '/roles', type: enumRouteType.admin, key: 'roles' },
    modules: { path: '/modules', type: enumRouteType.admin, key: 'modules' },
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