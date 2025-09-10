// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCBOkPzcKbite3HblTW8ZCd8NrAdgx1_xU",
  authDomain: "eco-shaala.firebaseapp.com",
  projectId: "eco-shaala",
  storageBucket: "eco-shaala.firebasestorage.app",
  messagingSenderId: "800435579324",
  appId: "1:800435579324:web:b947e651ad6f2a90bde3b9",
  measurementId: "G-JVBB7CCB9B"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
