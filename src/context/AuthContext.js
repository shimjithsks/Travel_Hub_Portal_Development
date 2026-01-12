import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh profile from Firestore
  const refreshProfile = useCallback(async () => {
    if (!user || !db) return;
    try {
      const profileRef = doc(db, 'users', user.uid);
      const snap = await getDoc(profileRef);
      setProfile(snap.exists() ? snap.data() : null);
    } catch (e) {
      console.error('Error refreshing profile:', e);
    }
  }, [user]);

  // Function to update profile locally without fetching
  const updateProfileLocal = useCallback((updates) => {
    setProfile(prev => prev ? { ...prev, ...updates } : updates);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const profileRef = doc(db, 'users', nextUser.uid);
        const snap = await getDoc(profileRef);
        setProfile(snap.exists() ? snap.data() : null);
      } catch (e) {
        // Keep UX simple: treat as no-profile
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      role: profile?.role ?? null,
      loading,
      isFirebaseConfigured,
      signOut: () => (auth ? firebaseSignOut(auth) : Promise.resolve()),
      refreshProfile,
      updateProfileLocal,
    }),
    [user, profile, loading, refreshProfile, updateProfileLocal]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
