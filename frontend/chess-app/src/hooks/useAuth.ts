import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth, provider } from "../lib/firebase";
import type { User } from "../types/chess";

interface EmailAuthInput {
  email: string;
  password: string;
  displayName?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid:         firebaseUser.uid,
          displayName: firebaseUser.displayName,
          photoURL:    firebaseUser.photoURL,
          email:       firebaseUser.email,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, provider);
  };

  const signInWithEmail = async ({ email, password }: EmailAuthInput) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmail = async ({ email, password, displayName }: EmailAuthInput) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName?.trim()) {
      await updateProfile(credential.user, { displayName: displayName.trim() });
      setUser((current) => current ? { ...current, displayName: displayName.trim() } : current);
    }
  };

  const logOut = async () => {
    await signOut(auth);
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    logOut,
  };
}
