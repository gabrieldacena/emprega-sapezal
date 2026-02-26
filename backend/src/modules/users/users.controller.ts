// ============================================================
// Users Controller
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { sendSuccess } from '../../utils/response';

export class UsersController {
    async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const profile = await usersService.getProfile(req.user!.id);
            sendSuccess(res, profile);
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            let profile;
            if (req.user!.role === 'CANDIDATO') {
                profile = await usersService.updateCandidateProfile(req.user!.id, req.body);
            } else if (req.user!.role === 'EMPRESA') {
                profile = await usersService.updateCompanyProfile(req.user!.id, req.body);
            } else {
                profile = await usersService.getProfile(req.user!.id);
            }
            sendSuccess(res, profile);
        } catch (error) {
            next(error);
        }
    }
}

export const usersController = new UsersController();
