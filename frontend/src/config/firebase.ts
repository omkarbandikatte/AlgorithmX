import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Updated Firebase configuration for algox-1010f
const firebaseConfig = {
  apiKey: "AIzaSyClHLx0i7XtoaQeF6MaTq_7EvC6ouWF3CI",
  authDomain: "algox-1010f.firebaseapp.com",
  projectId: "algox-1010f",
  storageBucket: "algox-1010f.firebasestorage.app",
  messagingSenderId: "647824130670",
  appId: "1:647824130670:web:e127ab3cc943aaa0d69c7f",
  measurementId: "G-BDDB2CKHGQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export default app;
