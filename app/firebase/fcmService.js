import { messaging, getToken } from './firebase';

export const getFcmToken = async () => {
    try {
        const token = await getToken(messaging, { vapidKey: "BIuZO5jefmaDt7CBMwmvCmZ3UoMAz-xS23Fxhv4YGgXtn22V1e78Noy0sQddu458CQ16CIL7ArwQ9nD6_zgKs8g" });
        if (token) {
            console.log("FCM Token:", token);
            return token;
        }
        return null;
    } catch (err) {
        console.error("Error getting FCM token:", err);
        return null;
    }
};