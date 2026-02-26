import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA2ks-Lpml_s9sH_oVMEqIV3LASOqqgNvE",
  authDomain: "court-side-6c75a.firebaseapp.com",
  projectId: "court-side-6c75a",
  storageBucket: "court-side-6c75a.firebasestorage.app",
  messagingSenderId: "562398582854",
  appId: "1:562398582854:web:b1edcaf3d0b13734355247",
  measurementId: "G-46KDYD1H2J"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);