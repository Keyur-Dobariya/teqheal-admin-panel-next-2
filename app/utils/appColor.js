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
};

export const colorMap = {
    A: '#e34c2c',
    B: '#30c64a',
    C: '#3656ef',
    D: '#F39C12',
    E: '#8E44AD',
    F: '#16A085',
    G: '#F1C40F',
    H: '#E74C3C',
    I: '#2ECC71',
    J: '#9B59B6',
    K: '#34495E',
    L: '#1ABC9C',
    M: '#E67E22',
    N: '#2980B9',
    O: '#8E44AD',
    P: '#D35400',
    Q: '#F39C12',
    R: '#e35b43',
    S: '#7D3C98',
    T: '#F1C40F',
    U: '#2980B9',
    V: '#27AE60',
    W: '#8E44AD',
    X: '#F39C12',
    Y: '#9B59B6',
    Z: '#34495E',
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
    if(!value) {
        return lightenColor(appColor.primary, 0.5);
    }
    const firstChar = value.trim().charAt(0).toUpperCase();
    return lightenColor(colorMap[firstChar], 0.5);
}

export const getTransColor = (value) => {
    if(!value) {
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