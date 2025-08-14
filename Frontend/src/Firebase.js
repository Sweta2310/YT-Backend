// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage} from 'firebase/storage';
import {getFirestore} from "firebase/firestore"


const firebaseConfig = {
  apiKey: "AIzaSyDuwdeWvNyiwKlpA52ebJZvVzzdzF2QCNE",
  authDomain: "yt-project-b5b36.firebaseapp.com",
  projectId: "yt-project-b5b36",
  storageBucket: "yt-project-b5b36.firebasestorage.app",
  messagingSenderId: "875257494327",
  appId: "1:875257494327:web:3f0439718840dd9de838b2",
  measurementId: "G-HLJE52KMD2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);