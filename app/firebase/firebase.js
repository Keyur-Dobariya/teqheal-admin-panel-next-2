import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyDugPfxEjZwdxeD8BwoLJtZRyeEM8Dy20M",
    authDomain: "whogetsa.firebaseapp.com",
    databaseURL: "https://whogetsa.firebaseio.com",
    projectId: "whogetsa",
    storageBucket: "whogetsa.firebasestorage.app",
    messagingSenderId: "829985461749",
    appId: "1:829985461749:web:10b901598f54f55f337cbc"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };