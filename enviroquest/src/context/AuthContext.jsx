// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebase";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ensure Firestore user doc exists
  const createUserDoc = async (user) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        createdAt: new Date().toISOString(),
        quizResults: [],
      });
    }
  };

  // 🔹 Email/password signup
  const signup = async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await createUserDoc(cred.user);
    return cred.user;
  };

  // 🔹 Email/password login
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  // 🔹 Google login
  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    await createUserDoc(cred.user);
    return cred.user;
  };

  // 🔹 Google signup (same as login but separated for clarity)
  const signupWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    await createUserDoc(cred.user);
    return cred.user;
  };

  // 🔹 Logout
  const logout = () => signOut(auth);

  // 🔹 Auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) await createUserDoc(u);
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    loginWithGoogle,  // 👈 use in Login.jsx
    signupWithGoogle, // 👈 use in Signup.jsx
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
