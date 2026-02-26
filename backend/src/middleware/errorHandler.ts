// ============================================================
// Middleware global de tratamento de erros
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/response';
import { ZodError } from 'zod';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
    console.error(`[ERROR] ${err.message}`, err.stack);

    // Erro customizado da aplicação
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            code: err.code,
        });
        return;
    }

    // Erro de validação Zod
    if (err instanceof ZodError) {
        const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        res.status(422).json({
            success: false,
            message: 'Dados inválidos.',
            code: 'VALIDATION_ERROR',
            errors: messages,
        });
        return;
    }

    // Erros do Prisma (violação de unicidade, etc.)
    if (err.constructor.name === 'PrismaClientKnownRequestError') {
        const prismaErr = err as any;
        if (prismaErr.code === 'P2002') {
            res.status(409).json({
                success: false,
                message: 'Registro já existente. Verifique os dados informados.',
                code: 'DUPLICATE_ENTRY',
            });
            return;
        }
        if (prismaErr.code === 'P2025') {
            res.status(404).json({
                success: false,
                message: 'Registro não encontrado.',
                code: 'NOT_FOUND',
            });
            return;
        }
    }

    // Erro genérico
    res.status(500).json({
        success: false,
        message: err.message || 'Erro interno do servidor.', // Expor mensagem para debug
        code: 'INTERNAL_SERVER_ERROR',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
}
