// ============================================================
// Auth Controller — Endpoints de autenticação
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../utils/response';
import { setTokenCookie, clearTokenCookie } from '../../middleware/auth';

export class AuthController {
    async registerCandidate(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.registerCandidate(req.body);
            setTokenCookie(res, result.token);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }

    async registerCompany(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.registerCompany(req.body);
            setTokenCookie(res, result.token);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.login(req.body);
            setTokenCookie(res, result.token);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }

    async logout(_req: Request, res: Response) {
        clearTokenCookie(res);
        sendSuccess(res, { message: 'Logout realizado com sucesso.' });
    }

    async getMe(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await authService.getMe(req.user!.id);
            sendSuccess(res, user);
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();
