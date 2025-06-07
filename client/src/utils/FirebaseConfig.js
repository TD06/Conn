import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
const firebaseConfig = {
    apiKey: "AIzaSyBMPP1Fpp1M_czuxgQSS_3pRnfDhTL5PF0",
    authDomain: "conn-a-new-way-to-connect.firebaseapp.com",
    projectId: "conn-a-new-way-to-connect",
    storageBucket: "conn-a-new-way-to-connect.firebasestorage.app",
    messagingSenderId: "838320788039",
    appId: "1:838320788039:web:ec944fc3982976d8859762",
    measurementId: "G-YL0YMD98RC"
  };

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);