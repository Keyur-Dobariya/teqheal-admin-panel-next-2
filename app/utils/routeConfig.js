import pageRoutes from './pageRoutes';

// Define public routes (no authentication required)
export const publicRoutes = [
    '/', // Root page
    pageRoutes.loginPage,
    pageRoutes.signupPage,
    pageRoutes.forgotPasswordPage,
];

// Define which routes require admin access
export const adminOnlyRoutes = [
    pageRoutes.employees,
    pageRoutes.todayReport,
    pageRoutes.basicSalary,
    pageRoutes.dailyUpdate,
    pageRoutes.punchReport,
    pageRoutes.application,
    pageRoutes.settings,
];

// Define protected routes (require authentication but not admin)
export const protectedRoutes = [
    pageRoutes.dashboard,
    pageRoutes.tracker,
    pageRoutes.employeeDetail,
    pageRoutes.client,
    pageRoutes.project,
    pageRoutes.tasks,
    pageRoutes.leave,
    pageRoutes.leaveReport,
    pageRoutes.salaryReport,
    pageRoutes.calendar,
    pageRoutes.chatting,
    pageRoutes.myProfile,
];

// Check if a route is public (no auth required)
export const isPublicRoute = (pathname) => {
    return publicRoutes.some(route => pathname.startsWith(route));
};

// Check if a route requires admin access
export const isAdminRoute = (pathname) => {
    return adminOnlyRoutes.some(route => pathname.startsWith(route));
};

// Check if a route requires authentication
export const isProtectedRoute = (pathname) => {
    return protectedRoutes.some(route => pathname.startsWith(route)) || isAdminRoute(pathname);
};

// Check if user should have access to a route
export const hasRouteAccess = (pathname, isUserAdmin, hasToken) => {
    // Public routes - always accessible
    if (isPublicRoute(pathname)) return true;

    // Protected routes - require authentication
    if (!hasToken) return false;

    // Admin routes - require admin role
    if (isAdminRoute(pathname)) return isUserAdmin;

    // Regular protected routes - just need authentication
    if (isProtectedRoute(pathname)) return true;

    // Default: require authentication for unknown routes
    return hasToken;
};