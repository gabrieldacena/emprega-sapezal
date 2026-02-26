// ============================================================
// Utilitários para respostas padronizadas da API
// ============================================================

import { Response } from 'express';

/** Classe customizada de erro com status HTTP */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;

    constructor(message: string, statusCode: number = 400, code: string = 'BAD_REQUEST') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

/** Resposta de sucesso */
export function sendSuccess(res: Response, data: any, statusCode: number = 200) {
    return res.status(statusCode).json({
        success: true,
        data,
    });
}

/** Resposta de sucesso com paginação */
export function sendPaginated(
    res: Response,
    data: any[],
    total: number,
    page: number,
    limit: number
) {
    return res.status(200).json({
        success: true,
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
}

/** Resposta de erro */
export function sendError(res: Response, message: string, statusCode: number = 400, code?: string) {
    return res.status(statusCode).json({
        success: false,
        message,
        code: code || getCodeFromStatus(statusCode),
    });
}

function getCodeFromStatus(status: number): string {
    const map: Record<number, string> = {
        400: 'BAD_REQUEST',
        401: 'UNAUTHORIZED',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        409: 'CONFLICT',
        422: 'UNPROCESSABLE_ENTITY',
        500: 'INTERNAL_SERVER_ERROR',
    };
    return map[status] || 'ERROR';
}
