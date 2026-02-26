// ============================================================
// AuthContext — Contexto de autenticação global
// ============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { api } from '../api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, senha: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const res = await api.auth.me();
            setUser(res.data);
        } catch {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        refreshUser().finally(() => setLoading(false));
    }, [refreshUser]);

    const login = async (email: string, senha: string) => {
        const res = await api.auth.login(email, senha);
        setUser(res.data);
    };

    const logout = async () => {
        await api.auth.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
    return context;
}
