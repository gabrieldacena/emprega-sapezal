// ============================================================
// Jobs Schemas — Validação com Zod
// ============================================================

import { z } from 'zod';

export const createJobSchema = z.object({
    titulo: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(200),
    descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
    requisitos: z.string().optional(),
    beneficios: z.string().optional(),
    tipoContrato: z.enum(['CLT', 'PJ', 'ESTAGIO', 'TEMPORARIO', 'FREELANCER']),
    faixaSalarial: z.string().optional(),
    modeloTrabalho: z.enum(['PRESENCIAL', 'HIBRIDO', 'REMOTO']),
    cidade: z.string().min(2, 'Cidade é obrigatória'),
    estado: z.string().min(2).max(2, 'Use a sigla do estado (ex: MT)'),
});

export const updateJobSchema = createJobSchema.partial();

export const updateJobStatusSchema = z.object({
    status: z.enum(['ATIVA', 'INATIVA']),
});
