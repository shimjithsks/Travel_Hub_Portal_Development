import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
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

  // Real-time listener for profile changes (to detect deactivation or role changes)
  useEffect(() => {
    if (!user || !db) return;

    const profileRef = doc(db, 'users', user.uid);
    const unsubscribeProfile = onSnapshot(profileRef, async (snap) => {
      if (snap.exists()) {
        const profileData = snap.data();
        const role = profileData.role || '';
        
        // Check if we're on a management/admin route - don't block admin users there
        const currentPath = window.location.hash || window.location.pathname;
        const isManagementRoute = currentPath.includes('management-portal') || 
                                   currentPath.includes('management-login') ||
                                   currentPath.includes('admin-login') ||
                                   currentPath.includes('admin') ||
                                   currentPath.includes('operator');
        
        // List of management/employee roles that cannot use customer portal
        const restrictedRoles = [
          'super-admin', 
          'delegated-super-admin', 
          'admin', 
          'admin-customers', 
          'admin-partners', 
          'admin-bookings',
          'employee'
        ];
        
        // Check if role is restricted or starts with 'admin'
        const isRestrictedUser = restrictedRoles.includes(role) || role.startsWith('admin');
        
        // If user's role changed to a restricted role AND they're on customer portal, sign them out
        if (isRestrictedUser && !isManagementRoute) {
          await firebaseSignOut(auth);
          setUser(null);
          setProfile(null);
          alert('This account is registered as an employee/admin. Please use the Admin Portal to login.');
          return;
        }
        
        // Check if account is deactivated or status is inactive
        if (profileData.accountStatus === 'inactive' || profileData.status === 'inactive') {
          // Sign out the user immediately
          await firebaseSignOut(auth);
          setUser(null);
          setProfile(null);
          // Show alert
          alert('Your account has been deactivated. You have been logged out.');
          return;
        }
        
        setProfile(profileData);
      }
    }, (error) => {
      console.error('Error listening to profile changes:', error);
    });

    return () => unsubscribeProfile();
  }, [user]);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const profileRef = doc(db, 'users', nextUser.uid);
        const snap = await getDoc(profileRef);
        
        if (snap.exists()) {
          const profileData = snap.data();
          const role = profileData.role || '';
          
          // Check if we're on a management/admin route - don't block admin users there
          const currentPath = window.location.hash || window.location.pathname;
          const isManagementRoute = currentPath.includes('management-portal') || 
                                     currentPath.includes('management-login') ||
                                     currentPath.includes('admin-login') ||
                                     currentPath.includes('admin') ||
                                     currentPath.includes('operator');
          
          // List of management/employee roles that cannot login to customer portal
          const restrictedRoles = [
            'super-admin', 
            'delegated-super-admin', 
            'admin', 
            'admin-customers', 
            'admin-partners', 
            'admin-bookings',
            'employee'
          ];
          
          // Check if role is restricted or starts with 'admin'
          const isRestrictedUser = restrictedRoles.includes(role) || role.startsWith('admin');
          
          // If this is a restricted user trying to access customer portal, sign them out
          if (isRestrictedUser && !isManagementRoute) {
            await firebaseSignOut(auth);
            setUser(null);
            setProfile(null);
            setLoading(false);
            setTimeout(() => {
              alert('This account is registered as an employee/admin. Please use the Admin Portal to login.');
            }, 100);
            return;
          }
          
          // Check if account is deactivated
          if (profileData.accountStatus === 'inactive' || profileData.status === 'inactive') {
            // Sign out the user immediately
            await firebaseSignOut(auth);
            setUser(null);
            setProfile(null);
            setLoading(false);
            // Show alert after a small delay to ensure state is updated
            setTimeout(() => {
              alert('Your account has been deactivated. Please contact support for assistance.');
            }, 100);
            return;
          }
          
          setUser(nextUser);
          setProfile(profileData);
        } else {
          setUser(nextUser);
          setProfile(null);
        }
      } catch (e) {
        // Keep UX simple: treat as no-profile
        setUser(nextUser);
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
