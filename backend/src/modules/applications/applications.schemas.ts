// ============================================================
// Applications Schemas
// ============================================================

import { z } from 'zod';

export const applySchema = z.object({
    jobId: z.string().uuid('ID da vaga inválido'),
    mensagem: z.string().optional(),
});

export const updateApplicationStatusSchema = z.object({
    status: z.enum(['ENVIADO', 'EM_ANALISE', 'APROVADO', 'REPROVADO']),
});
