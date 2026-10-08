import React, { createContext, useContext, useEffect, useState } from 'react';
import pb from '@/lib/pocketbaseClient.js';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const withTimeout = (promise, ms = 15000) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error('The request took too long. Please check your connection and try again.')), ms)),
]);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(pb.authStore.record || null);
  const [initialLoading, setInitialLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setCurrentUser(record || null);
    }, true);

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const authData = await withTimeout(
      pb.collection('users').authWithPassword(email.trim(), password, { $autoCancel: false })
    );
    setCurrentUser(authData.record);
    return authData;
  };

  const signup = async (name, email, phone, password) => {
    const record = await withTimeout(
      pb.collection('users').create({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        passwordConfirm: password,
      }, { $autoCancel: false })
    );

    try {
      const authData = await withTimeout(
        pb.collection('users').authWithPassword(email.trim(), password, { $autoCancel: false })
      );
      setCurrentUser(authData.record);
      return { ...authData, requiresVerification: false };
    } catch (authError) {
      // PocketBase can require email verification before password login.
      if (/verified|verification|confirm/i.test(authError?.message || '')) {
        return { record, requiresVerification: true };
      }
      throw authError;
    }
  };

  const logout = async () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };

  const requestPasswordReset = async (email) => {
    await withTimeout(
      pb.collection('users').requestPasswordReset(email.trim(), { $autoCancel: false })
    );
  };

  const confirmPasswordReset = async (token, password) => {
    await withTimeout(
      pb.collection('users').confirmPasswordReset(token, password, password, { $autoCancel: false })
    );
  };

  const value = {
    currentUser,
    isAuthenticated: !!pb.authStore.isValid,
    isAdmin: currentUser?.role === 'admin' || currentUser?.isAdmin === true,
    login,
    signup,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    initialLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
