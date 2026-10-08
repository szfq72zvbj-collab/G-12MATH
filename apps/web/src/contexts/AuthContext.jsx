import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import supabase from '@/lib/supabaseClient.js';

const ADMIN_EMAILS = new Set(['aungnaingmin200537@gmail.com']);

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

  const loadProfile = useCallback(async (user) => {
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
      await supabase
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', user.id);
      return data;
    }

    return null;
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const user = data.session?.user || null;
      setCurrentUser(user);

      if (user) {
        await loadProfile(user);
      }

      if (mounted) {
        setInitialLoading(false);
      }
    };

    initialize();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      setProfile(null);
      setInitialLoading(false);

      if (user) {
        void loadProfile(user);
      } else {
        setProfile(null);
      }
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
    // Do not pass a production redirect URL here. Supabase requires every
    // emailRedirectTo value to be present in its configured redirect allow-list.
    // Omitting it lets the hosted project use its configured Site URL.
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: name.trim(),
          phone: phone.trim(),
          country: 'Myanmar',
        },
      },
    });

    if (error) throw error;

    if (data.user && data.session) {
      await loadProfile(data.user);
    }

    return {
      ...data,
      requiresVerification: Boolean(data.user && !data.session),
    };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    setCurrentUser(null);
    setProfile(null);
  };

  const requestPasswordReset = async (email) => {
    // Keep password-reset redirect behavior unchanged until the project's
    // production redirect allow-list is configured.
    const redirectTo = window.location.origin + window.location.pathname + '#/login?reset=1';

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (error) throw error;
  };

  const refreshProfile = useCallback(async () => {
    if (!currentUser) {
      setProfile(null);
      return null;
    }
    return loadProfile(currentUser);
  }, [currentUser, loadProfile]);

  const value = {
    currentUser,
    profile,
    refreshProfile,
    isAuthenticated: Boolean(currentUser),
    isAdmin: profile?.role === 'admin' || ADMIN_EMAILS.has((currentUser?.email || '').trim().toLowerCase()),
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
