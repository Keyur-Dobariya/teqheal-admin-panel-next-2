import {Gender} from "./enum";
import imagePaths from "./imagesPath";

export function capitalizeLastPathSegment(input) {
    if (!input) return '';

    try {
        let path;
        try {
            const parsedUrl = new URL(input);
            path = parsedUrl.pathname;
        } catch {
            path = input;
        }

        const pathSegments = path.split('/').filter(Boolean);

        if (pathSegments.length === 0) return '';

        const lastSegment = pathSegments.pop();

        return lastSegment
            .replace(/[-_]/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase());
    } catch (error) {
        return '';
    }
}

function formatReadable(text) {
    return text
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[-_]/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
}

export function convertDateTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
}

export function formatMilliseconds(ms) {
    if (ms <= 0 || isNaN(ms)) return "00:00:00";
    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);

    const options = {
        month: "short",
        year: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    };

    const formattedDate = date.toLocaleString("en-US", options);
    const [month, day, year, time, period] = formattedDate.replace(",", "").split(" ");

    return `${month} ${day}, ${year} ${time} ${period} `;
};

export const profilePhotoManager = ({url, gender = Gender.Male}) => {
    if(url) {
        return url;
    } else {
        if(gender === Gender.Female) {
            return imagePaths.female_profile;
        } else {
            return imagePaths.male_profile;
        }
    }
}

export function detectPlatform(userAgent) {
    const platform = {
        isElectron: false,
        isMobile: false,
        isDesktopBrowser: false,
        os: "Unknown",
    };

    if (userAgent.includes("Electron")) {
        platform.isElectron = true;
        platform.os = "Electron (Desktop)";
    } else if (/iPhone|iPad|iPod|Android/i.test(userAgent)) {
        platform.isMobile = true;
        platform.os = "Mobile";
    } else {
        platform.isDesktopBrowser = true;
        if (userAgent.includes("Windows")) {
            platform.os = "Windows";
        } else if (userAgent.includes("Mac")) {
            platform.os = "macOS";
        } else if (userAgent.includes("Linux")) {
            platform.os = "Linux";
        }
    }

    return platform;
}