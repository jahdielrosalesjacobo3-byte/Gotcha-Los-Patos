import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // null = checking, false = not auth, object = authed
    const [loading, setLoading] = useState(true);

    const fetchMe = useCallback(async () => {
        try {
            const token = localStorage.getItem("admin_token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const { data } = await axios.get(`${API}/auth/me`, {
                withCredentials: true,
                headers,
            });
            setUser(data);
        } catch (e) {
            setUser(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMe(); }, [fetchMe]);

    const login = async (identifier, password) => {
        const { data } = await axios.post(
            `${API}/auth/login`,
            { identifier, password },
            { withCredentials: true }
        );
        if (data.access_token) {
            localStorage.setItem("admin_token", data.access_token);
        }
        setUser(data.user);
        return data.user;
    };

    const logout = async () => {
        try {
            await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
        } catch {}
        localStorage.removeItem("admin_token");
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
