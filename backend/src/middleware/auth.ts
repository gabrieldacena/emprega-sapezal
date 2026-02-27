// ============================================================
// Middleware de autenticação JWT e autorização por role
// ============================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { env } from '../config/env';
import { sendError } from '../utils/response';
import prisma from '../config/database';

// Estende o tipo Request do Express para incluir dados do usuário autenticado
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: UserRole;
                nome: string;
            };
        }
    }
}

interface JwtPayload {
    id: string;
    email: string;
    role: UserRole;
    nome: string;
}

/**
 * Middleware que verifica se o usuário possui um token JWT válido.
 * O token é lido do cookie HTTP-only "token".
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const token = req.cookies?.token;

    if (!token) {
        sendError(res, 'Autenticação necessária. Faça login para continuar.', 401);
        return;
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            nome: decoded.nome,
        };
        next();
    } catch (error) {
        sendError(res, 'Token inválido ou expirado. Faça login novamente.', 401);
        return;
    }
}

/**
 * Middleware opcional que tenta autenticar mas não bloqueia se não houver token.
 * Útil para rotas públicas que podem ter comportamento diferente para logados.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
    const token = req.cookies?.token;

    if (!token) {
        next();
        return;
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            nome: decoded.nome,
        };
    } catch {
        // Token inválido — segue sem autenticar
    }

    next();
}

/**
 * Factory que retorna middleware de autorização por role.
 * Verifica se o usuário autenticado possui um dos roles permitidos.
 *
 * @example authorize('EMPRESA', 'ADMIN')
 */
export function authorize(...roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            sendError(res, 'Autenticação necessária.', 401);
            return;
        }

        if (!roles.includes(req.user.role)) {
            sendError(res, 'Você não tem permissão para acessar este recurso.', 403, 'FORBIDDEN');
            return;
        }

        next();
    };
}

/**
 * Gera um token JWT para o usuário.
 */
export function generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN as any,
    });
}

/**
 * Define o cookie HTTP-only com o token JWT.
 */
export function setTokenCookie(res: Response, token: string): void {
    res.cookie('token', token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax', // Permite cross-domain no Render/Vercel
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        path: '/',
    });
}

export function clearTokenCookie(res: Response): void {
    res.clearCookie('token', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
    });
}
