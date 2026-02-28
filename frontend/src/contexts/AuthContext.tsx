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
        } catch (err: any) {
            // Só desloga se for erro real de autenticação (401)
            // Se for erro de rede/timeout/500, mantém o estado atual para evitar logout fantasma
            if (err.message?.includes('401') || err.status === 401) {
                localStorage.removeItem('token');
                setUser(null);
            }
        }
    }, []);

    useEffect(() => {
        refreshUser().finally(() => setLoading(false));
    }, [refreshUser]);

    const login = async (email: string, senha: string) => {
        const res = await api.auth.login(email, senha);
        const data = res.data as any;
        if (data?.token) {
            localStorage.setItem('token', data.token);
        }
        setUser(data.user || data);
    };

    const logout = async () => {
        try {
            await api.auth.logout();
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
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
