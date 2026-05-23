import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

const STAFF_EMAIL_DOMAIN = "@staff.local";

function resolveLoginEmail(identifier) {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) {
    return trimmed.toLowerCase();
  }
  return `${trimmed.toLowerCase()}${STAFF_EMAIL_DOMAIN}`;
}

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, username, role, name")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback(async (session) => {
    if (!session?.user) {
      setUser(false);
      setLoading(false);
      return;
    }

    try {
      const profile = await fetchProfile(session.user.id);
      if (!profile || profile.role !== "admin") {
        await supabase.auth.signOut();
        setUser(false);
        return;
      }
      setUser({
        id: profile.id,
        email: profile.email || session.user.email,
        username: profile.username,
        role: profile.role,
        name: profile.name,
      });
    } catch {
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    await applySession(data.session);
  }, [applySession]);

  useEffect(() => {
    fetchMe();
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });
    return () => subscription.subscription.unsubscribe();
  }, [fetchMe, applySession]);

  const login = async (identifier, password) => {
    const email = resolveLoginEmail(identifier);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    const profile = await fetchProfile(data.user.id);
    if (!profile || profile.role !== "admin") {
      await supabase.auth.signOut();
      const err = new Error("Acceso restringido");
      err.code = "forbidden";
      throw err;
    }

    const userData = {
      id: profile.id,
      email: profile.email || data.user.email,
      username: profile.username,
      role: profile.role,
      name: profile.name,
    };
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
