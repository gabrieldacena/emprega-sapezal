// ============================================================
// API Client — Funções para comunicar com o backend
// ============================================================

import type { ApiResponse, PaginatedResponse, User, Job, Rental, JobApplication, DashboardStats, ContactMessage, RecentActivity, Advertisement, NewsArticle } from '../types';

const BASE = import.meta.env.VITE_API_URL || '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    let res: Response;

    try {
        res = await fetch(`${BASE}${url}`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', ...options?.headers },
            ...options,
        });
    } catch {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    }

    let data: any;
    try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
    } catch {
        throw new Error('Erro ao processar resposta do servidor. Verifique se o backend está rodando na porta 3001.');
    }

    if (!res.ok) {
        throw new Error(data.message || 'Erro na requisição');
    }

    return data;
}

// ---- AUTH ----
export const api = {
    auth: {
        login: (email: string, senha: string) =>
            request<ApiResponse<User>>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, senha }),
            }),
        registerCandidate: (data: any) =>
            request<ApiResponse<User>>('/auth/register/candidato', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        registerCompany: (data: any) =>
            request<ApiResponse<User>>('/auth/register/empresa', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        logout: () => request<ApiResponse<any>>('/auth/logout', { method: 'POST' }),
        me: () => request<ApiResponse<User>>('/auth/me'),
    },

    // ---- JOBS ----
    jobs: {
        list: (params?: string) => request<PaginatedResponse<Job>>(`/jobs${params ? `?${params}` : ''}`),
        get: (id: string) => request<ApiResponse<Job>>(`/jobs/${id}`),
        create: (data: any) => request<ApiResponse<Job>>('/jobs', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: any) => request<ApiResponse<Job>>(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        updateStatus: (id: string, status: string) =>
            request<ApiResponse<Job>>(`/jobs/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
        delete: (id: string) => request<ApiResponse<any>>(`/jobs/${id}`, { method: 'DELETE' }),
        my: () => request<ApiResponse<Job[]>>('/jobs/my'),
    },

    // ---- RENTALS ----
    rentals: {
        list: (params?: string) => request<PaginatedResponse<Rental>>(`/rentals${params ? `?${params}` : ''}`),
        get: (id: string) => request<ApiResponse<Rental>>(`/rentals/${id}`),
        create: (data: any) => request<ApiResponse<Rental>>('/rentals', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: any) => request<ApiResponse<Rental>>(`/rentals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        updateStatus: (id: string, status: string) =>
            request<ApiResponse<Rental>>(`/rentals/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
        delete: (id: string) => request<ApiResponse<any>>(`/rentals/${id}`, { method: 'DELETE' }),
        my: () => request<ApiResponse<Rental[]>>('/rentals/my'),
        contact: (id: string, data: any) =>
            request<ApiResponse<any>>(`/rentals/${id}/contact`, { method: 'POST', body: JSON.stringify(data) }),
    },

    // ---- APPLICATIONS ----
    applications: {
        apply: (jobId: string, mensagem?: string) =>
            request<ApiResponse<JobApplication>>('/applications', { method: 'POST', body: JSON.stringify({ jobId, mensagem }) }),
        my: () => request<ApiResponse<JobApplication[]>>('/applications/my'),
        byJob: (jobId: string) => request<ApiResponse<JobApplication[]>>(`/applications/job/${jobId}`),
        updateStatus: (id: string, status: string) =>
            request<ApiResponse<JobApplication>>(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    },

    // ---- USERS ----
    users: {
        profile: () => request<ApiResponse<User>>('/users/profile'),
        updateProfile: (data: any) => request<ApiResponse<User>>('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
    },

    // ---- ADMIN ----
    admin: {
        summary: () => request<ApiResponse<{ stats: DashboardStats; activity: RecentActivity }>>('/admin/summary'),
        dashboard: () => request<ApiResponse<DashboardStats>>('/admin/dashboard'),
        activity: () => request<ApiResponse<RecentActivity>>('/admin/activity'),
        users: (params?: string) => request<PaginatedResponse<User>>(`/admin/users${params ? `?${params}` : ''}`),
        toggleUser: (id: string) => request<ApiResponse<any>>(`/admin/users/${id}/toggle`, { method: 'PATCH' }),
        deleteUser: (id: string) => request<ApiResponse<any>>(`/admin/users/${id}`, { method: 'DELETE' }),
        jobs: (params?: string) => request<PaginatedResponse<Job>>(`/admin/jobs${params ? `?${params}` : ''}`),
        moderateJob: (id: string, data: any) => request<ApiResponse<Job>>(`/admin/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        deleteJob: (id: string) => request<ApiResponse<any>>(`/admin/jobs/${id}`, { method: 'DELETE' }),
        rentals: (params?: string) => request<PaginatedResponse<Rental>>(`/admin/rentals${params ? `?${params}` : ''}`),
        moderateRental: (id: string, data: any) => request<ApiResponse<Rental>>(`/admin/rentals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        deleteRental: (id: string) => request<ApiResponse<any>>(`/admin/rentals/${id}`, { method: 'DELETE' }),
        applications: (params?: string) => request<PaginatedResponse<JobApplication>>(`/admin/applications${params ? `?${params}` : ''}`),
        messages: (params?: string) => request<PaginatedResponse<ContactMessage>>(`/admin/messages${params ? `?${params}` : ''}`),
        deleteMessage: (id: string) => request<ApiResponse<any>>(`/admin/messages/${id}`, { method: 'DELETE' }),
        // Anúncios
        listAds: () => request<ApiResponse<Advertisement[]>>('/admin/ads'),
        createAd: (data: any) => request<ApiResponse<Advertisement>>('/admin/ads', { method: 'POST', body: JSON.stringify(data) }),
        updateAd: (id: string, data: any) => request<ApiResponse<Advertisement>>(`/admin/ads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        deleteAd: (id: string) => request<ApiResponse<any>>(`/admin/ads/${id}`, { method: 'DELETE' }),
        // Notícias
        listNews: () => request<ApiResponse<NewsArticle[]>>('/admin/news'),
        createNews: (data: any) => request<ApiResponse<NewsArticle>>('/admin/news', { method: 'POST', body: JSON.stringify(data) }),
        updateNews: (id: string, data: any) => request<ApiResponse<NewsArticle>>(`/admin/news/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        deleteNews: (id: string) => request<ApiResponse<any>>(`/admin/news/${id}`, { method: 'DELETE' }),
        setHeadline: (id: string) => request<ApiResponse<NewsArticle>>(`/admin/news/${id}/headline`, { method: 'PATCH' }),
        // Configurações
        getSettings: () => request<ApiResponse<Record<string, string>>>('/admin/settings'),
        updateSettings: (data: Record<string, string>) => request<ApiResponse<Record<string, string>>>('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
    },

    // ---- CONTENT (público) ----
    content: {
        ads: () => request<ApiResponse<Advertisement[]>>('/content/ads'),
        news: () => request<ApiResponse<NewsArticle[]>>('/content/news'),
        headline: () => request<ApiResponse<NewsArticle | null>>('/content/news/headline'),
        newsDetail: (id: string) => request<ApiResponse<NewsArticle>>(`/content/news/${id}`),
        settings: () => request<ApiResponse<Record<string, string>>>('/content/settings'),
    },
};
