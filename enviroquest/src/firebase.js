// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCxyfgcaKG6D3itAlilDbsmsIwrTJQQ8jA",
  authDomain: "eco-shaala-cae9c.firebaseapp.com",
  projectId: "eco-shaala-cae9c",
  storageBucket: "eco-shaala-cae9c.firebasestorage.app",
  messagingSenderId: "996471294063",
  appId: "1:996471294063:web:30ce0c973db617ac5a659a",
  measurementId: "G-6L4RJBHFVH"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
