import {Gender} from "./enum";
import imagePaths from "./imagesPath";
import CryptoJS from 'crypto-js';
import {showToast} from "../components/CommonComponents";
import extIcons from "./extIcons";

export const getDataById = (dataList, dataId) => {
    return dataList.find((data) => data._id === dataId);
};

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

export const convertCamelCase = (text) => {
    if (!text) return '';
    return text
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
};

export function getFirstName(fullName) {
    if (!fullName) return '';
    return fullName.trim().split(' ')[0];
}

export const getTwoCharacterFromName = (str) => {
    if (str) {
        const words = str.trim().split(" ");
        const firstInitial = words[0].charAt(0).toUpperCase();
        const secondInitial =
            words.length > 1 ? words[1].charAt(0).toUpperCase() : "";
        return firstInitial + secondInitial;
    }
    return "N/A";
};

export const contentCopy = (content, message) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(content)
            .then(() => {
                showToast('success', message);
            })
            .catch((err) => {
                showToast('error', 'Failed to copy');
            });
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            if (successful) {
                showToast('success', message);
            } else {
                showToast('error', 'Failed to copy');
            }
        } catch (err) {
            document.body.removeChild(textArea);
            showToast('error', 'Clipboard not supported');
        }
    }
};

export const formatMessageTimeReal = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now - date;

    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'Just now';

    if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }

    if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }

    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${date.toLocaleDateString('en-GB')} ${time}`;
};

export const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes === 0) return 'Just now';

    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

    if (isToday) return time;
    if (isYesterday) return `Yesterday ${time}`;

    return `${date.toLocaleDateString('en-GB')} ${time}`;
};

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

export const decryptValue = (value) => {
    console.log("value", value)
    if (!value || !value.includes(':')) return value;

    try {
        const [ivHex, encryptedData] = value.split(':');

        const key = CryptoJS.SHA256("12345678901234567890123456789012"); // same as backend
        const iv = CryptoJS.enc.Hex.parse(ivHex);
        const encryptedWordArray = CryptoJS.enc.Hex.parse(encryptedData);

        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: encryptedWordArray },
            key,
            { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
        );

        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return value;
    }
};

export const getTwoCharacter = (str) => {
    if (str) {
        const words = str.trim().split(" ");
        const firstInitial = words[0].charAt(0).toUpperCase();
        const secondInitial =
            words.length > 1 ? words[1].charAt(0).toUpperCase() : "";
        return firstInitial + secondInitial;
    }
    return "N/A";
};

export const getFileExtension = (input) => {
    let filename = '';

    if (typeof input === 'string') {
        filename = input.split('?')[0].split('#')[0]; // Clean URL
    } else if (input instanceof File) {
        filename = input.name;
    } else {
        return '';
    }

    return filename.includes('.') ? filename.split('.').pop().toLowerCase() : '';
};

export const getFileIcon = (input) => {
    const extension = getFileExtension(input);
    return extIcons[extension] || extIcons.file;
};

export const isImageExtension = (input) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tif', 'tiff', 'svg'];
    const extension = getFileExtension(input);
    return imageExtensions.includes(extension);
};

export const isVideoExtension = (input) => {
    const videoExtensions = ['mp4', 'avi', 'mkv', 'mov', 'flv', 'wmv', 'webm'];
    const extension = getFileExtension(input);
    return videoExtensions.includes(extension);
};

export const isAudioExtension = (input) => {
    const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'];
    const extension = getFileExtension(input);
    return audioExtensions.includes(extension);
};