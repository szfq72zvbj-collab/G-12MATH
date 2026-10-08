import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient.js';

const AuthContext = createContext(null);

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadProfile = async (user) => {
    if (!user) {
      setProfile(null);
      return null;
    }
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, role, last_seen')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id);
      return data;
    }
    return null;
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const user = data.session?.user || null;
      setCurrentUser(user);
      if (user) await loadProfile(user);
      if (mounted) setInitialLoading(false);
    };

    initialize();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) await loadProfile(user);
      else setProfile(null);
      setInitialLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    setCurrentUser(data.user);
    await loadProfile(data.user);
    return data;
  };

  const signup = async (name, email, phone, password) => {
    const redirectTo = window.location.origin + window.location.pathname + '#/login';
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          full_name: name.trim(),
          phone: phone.trim(),
        },
      },
    });

    if (error) throw error;

    if (data.user && data.session) {
      await loadProfile(data.user);
    }

    return {
      ...data,
      requiresVerification: !!data.user && !data.session,
    };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setCurrentUser(null);
    setProfile(null);
  };

  const requestPasswordReset = async (email) => {
    const redirectTo = window.location.origin + window.location.pathname + '#/login?reset=1';
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (error) throw error;
  };

  const value = {
    currentUser,
    profile,
    isAuthenticated: !!currentUser,
    isAdmin: profile?.role === 'admin',
    login,
    signup,
    logout,
    requestPasswordReset,
    initialLoading,
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">Loading Grade 12 Math…</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
