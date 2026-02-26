// ============================================================
// Applications Controller
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { applicationsService } from './applications.service';
import { sendSuccess } from '../../utils/response';

export class ApplicationsController {
    async apply(req: Request, res: Response, next: NextFunction) {
        try {
            const application = await applicationsService.apply(req.user!.id, req.body.jobId, req.body.mensagem);
            sendSuccess(res, application, 201);
        } catch (error) {
            next(error);
        }
    }

    async listMy(req: Request, res: Response, next: NextFunction) {
        try {
            const applications = await applicationsService.listByCandidate(req.user!.id);
            sendSuccess(res, applications);
        } catch (error) {
            next(error);
        }
    }

    async listByJob(req: Request, res: Response, next: NextFunction) {
        try {
            const applications = await applicationsService.listByJob(req.params.jobId as string, req.user!.id);
            sendSuccess(res, applications);
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const application = await applicationsService.updateStatus(req.params.id as string, req.user!.id, req.body.status);
            sendSuccess(res, application);
        } catch (error) {
            next(error);
        }
    }
}

export const applicationsController = new ApplicationsController();
