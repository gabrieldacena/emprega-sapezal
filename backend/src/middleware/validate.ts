// ============================================================
// Middleware de validação genérica com Zod
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { sendError } from '../utils/response';

/**
 * Cria middleware que valida body, query ou params do request.
 *
 * @example
 * router.post('/jobs', validate(createJobSchema, 'body'), controller.create)
 */
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            const messages = result.error.errors.map((e) => {
                const field = e.path.join('.');
                return field ? `${field}: ${e.message}` : e.message;
            });

            res.status(422).json({
                success: false,
                message: 'Dados inválidos.',
                code: 'VALIDATION_ERROR',
                errors: messages,
            });
            return;
        }

        // Substitui dados com os valores parseados (coerce, defaults, etc.)
        req[source] = result.data;
        next();
    };
}
