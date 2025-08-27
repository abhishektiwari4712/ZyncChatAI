// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration - using the provided config
const firebaseConfig = {
  apiKey: "AIzaSyB6dwvCY_EADbuBI4SRcbzo6zsLrfqQQ-Q",
  authDomain: "zyncchatai.firebaseapp.com",
  projectId: "zyncchatai",
  storageBucket: "zyncchatai.firebasestorage.app",
  messagingSenderId: "365348391851",
  appId: "1:365348391851:web:845289b18bc5e64f2720ee",
  measurementId: "G-EPWHLL12WN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
auth.useDeviceLanguage();

export default app;