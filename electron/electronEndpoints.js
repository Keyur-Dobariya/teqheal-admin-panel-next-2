const config = {
    apiBaseUrlDev: "http://192.168.0.104:5201",
    webUrlDev: "http://192.168.0.104:4000",
    // apiBaseUrlProd: "https://empbackend-16ns.onrender.com",
    apiBaseUrlProd: "https://empbackend-aru4.onrender.com",
    webUrlProd: "https://teqheal-admin-panel-next-2.vercel.app",
    isDev: true,
};

const electronCommon = {
    isForTest: false,
    appIcon: "../app/favicon.ico",
};

const electronEnvironment = {
    apiBaseUrl: config.isDev ? config.apiBaseUrlDev : config.apiBaseUrlProd,
    webUrl: config.isDev ? config.webUrlDev : config.webUrlProd,
};

const electronEndpoints = {
    login: electronEnvironment.webUrl + "/auth/login",
    tracker: electronEnvironment.webUrl + "/tracker",
    dailyReportEndPoint: electronEnvironment.webUrl + "/tracker/daily-update",
};

module.exports = { config, electronCommon, electronEnvironment, electronEndpoints };