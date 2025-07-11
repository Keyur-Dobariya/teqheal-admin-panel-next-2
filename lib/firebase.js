// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAs8yVZGfPJ8u8Ds-7I1hdRUDdG42cmFpU",
    authDomain: "teqheal-tracker.firebaseapp.com",
    projectId: "teqheal-tracker",
    storageBucket: "teqheal-tracker.firebasestorage.app",
    messagingSenderId: "931695379074",
    appId: "1:931695379074:web:11197d778b23aaa6ca2a9b",
    measurementId: "G-HR00LWPSJ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);