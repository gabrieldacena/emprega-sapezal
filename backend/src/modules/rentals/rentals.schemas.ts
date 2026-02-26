// ============================================================
// Rentals Schemas — Validação com Zod
// ============================================================

import { z } from 'zod';

export const createRentalSchema = z.object({
    titulo: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(200),
    tipoImovel: z.enum(['CASA', 'APARTAMENTO', 'SALA_COMERCIAL', 'KITNET', 'TERRENO', 'CHACARA', 'OUTRO']),
    valorAluguel: z.number().positive('Valor deve ser maior que zero'),
    cidade: z.string().min(2, 'Cidade é obrigatória'),
    estado: z.string().min(2).max(2, 'Use a sigla do estado (ex: MT)'),
    descricao: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
    imagens: z.array(z.string().url('URL de imagem inválida')).optional(),
});

export const updateRentalSchema = createRentalSchema.partial();

export const updateRentalStatusSchema = z.object({
    status: z.enum(['ATIVO', 'INATIVO']),
});

export const contactMessageSchema = z.object({
    nome: z.string().min(2, 'Nome é obrigatório'),
    email: z.string().email('E-mail inválido'),
    telefone: z.string().optional(),
    mensagem: z.string().min(5, 'Mensagem deve ter pelo menos 5 caracteres'),
});
