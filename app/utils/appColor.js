export const appColor = {
    white: '#FFFFFF',
    black: '#000000',
    transparant: '#00000000',
    primary: '#1E2538',
    secondPrimary: '#465FFF',
    // warning: '#FFA700',
    // error: '#FF6961',
    // success: '#60B158',
    secondary: "#82868b",
    success: "#28c76f",
    danger: "#ea5455",
    warning: "#ff9f43",
    info: "#00cfe8",
    mainBg: "#F9FAFB",
    borderClr: "#E4E7EC",
    blueBorder: "#f0f4f8",
    blueCardBg: "#FAFCFF",
    statusAvailable: "#13A10E",
    statusAway: "#EAA300",
};

export const colorMap = {
    A: '#3b82f6', // Bright Blue
    B: '#6366f1', // Indigo
    C: '#8b5cf6', // Purple
    D: '#f59e0b', // Amber
    E: '#ec4899', // Pink
    F: '#10b981', // Emerald
    G: '#f97316', // Orange
    H: '#ef4444', // Red
    I: '#22c55e', // Green
    J: '#a855f7', // Violet
    K: '#64748b', // Slate
    L: '#06b6d4', // Cyan
    M: '#ea580c', // Orange Red
    N: '#2563eb', // Blue
    O: '#dc2626', // Red
    P: '#d97706', // Orange
    Q: '#eab308', // Yellow
    R: '#e11d48', // Rose
    S: '#9333ea', // Purple
    T: '#059669', // Teal
    U: '#1d4ed8', // Blue
    V: '#16a34a', // Green
    W: '#be123c', // Rose
    X: '#ea580c', // Orange
    Y: '#7c3aed', // Violet
    Z: '#475569', // Slate
};

const lightenColor = (hex, percent) => {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    r = Math.min(255, Math.floor(r + (255 - r) * percent));
    g = Math.min(255, Math.floor(g + (255 - g) * percent));
    b = Math.min(255, Math.floor(b + (255 - b) * percent));

    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).padStart(6, '0')}`;
};

export const getLightColor = (value) => {
    if (!value) {
        return lightenColor(appColor.primary, 0.8);
    }
    const firstChar = value.trim().charAt(0).toUpperCase();
    return lightenColor(colorMap[firstChar], 0.8);
}

export const getTransColor = (value) => {
    if (!value) {
        return lightenColor(appColor.primary, 0.9);
    }
    const firstChar = value.trim().charAt(0).toUpperCase();
    return lightenColor(colorMap[firstChar], 0.9);
}

export const getDarkColor = (value) => {
    if (!value) {
        return appColor.primary;
    }
    const firstChar = value.trim().charAt(0).toUpperCase();
    return colorMap[firstChar] || appColor.primary;
};

export default appColor;