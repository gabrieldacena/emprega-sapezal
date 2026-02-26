// ============================================================
// Auth Schemas — Validação com Zod
// ============================================================

import { z } from 'zod';

export const registerCandidateSchema = z.object({
    nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    cidade: z.string().optional(),
    estado: z.string().max(2).optional(),
    telefone: z.string().optional(),
});

export const registerCompanySchema = z.object({
    nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    cidade: z.string().optional(),
    estado: z.string().max(2).optional(),
    telefone: z.string().optional(),
    nomeEmpresa: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
    cnpj: z.string().optional(),
    areaAtuacao: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(1, 'Senha é obrigatória'),
});
