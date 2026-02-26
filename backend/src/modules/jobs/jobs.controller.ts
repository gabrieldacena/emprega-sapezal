// ============================================================
// Jobs Controller — Endpoints de vagas de emprego
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { jobsService } from './jobs.service';
import { sendSuccess, sendPaginated } from '../../utils/response';

export class JobsController {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await jobsService.listPublic(req.query as any);
            sendPaginated(res, result.jobs, result.total, result.page, result.limit);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const job = await jobsService.getById(req.params.id as string);
            sendSuccess(res, job);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const job = await jobsService.create(req.user!.id, req.body);
            sendSuccess(res, job, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const job = await jobsService.update(req.params.id as string, req.user!.id, req.body);
            sendSuccess(res, job);
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const job = await jobsService.updateStatus(req.params.id as string, req.user!.id, req.body.status);
            sendSuccess(res, job);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await jobsService.delete(req.params.id as string, req.user!.id);
            sendSuccess(res, { message: 'Vaga excluída com sucesso.' });
        } catch (error) {
            next(error);
        }
    }

    async listMyJobs(req: Request, res: Response, next: NextFunction) {
        try {
            const jobs = await jobsService.listByCompany(req.user!.id);
            sendSuccess(res, jobs);
        } catch (error) {
            next(error);
        }
    }
}

export const jobsController = new JobsController();
