// ============================================================
// Rentals Controller — Endpoints de anúncios de aluguel
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { rentalsService } from './rentals.service';
import { sendSuccess, sendPaginated } from '../../utils/response';

export class RentalsController {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await rentalsService.listPublic(req.query as any);
            sendPaginated(res, result.rentals, result.total, result.page, result.limit);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const rental = await rentalsService.getById(req.params.id as string);
            sendSuccess(res, rental);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const rental = await rentalsService.create(req.user!.id, req.body);
            sendSuccess(res, rental, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const rental = await rentalsService.update(req.params.id as string, req.user!.id, req.body);
            sendSuccess(res, rental);
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const rental = await rentalsService.updateStatus(req.params.id as string, req.user!.id, req.body.status);
            sendSuccess(res, rental);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await rentalsService.delete(req.params.id as string, req.user!.id);
            sendSuccess(res, { message: 'Anúncio excluído com sucesso.' });
        } catch (error) {
            next(error);
        }
    }

    async listMyRentals(req: Request, res: Response, next: NextFunction) {
        try {
            const rentals = await rentalsService.listByCompany(req.user!.id);
            sendSuccess(res, rentals);
        } catch (error) {
            next(error);
        }
    }

    async sendContact(req: Request, res: Response, next: NextFunction) {
        try {
            const message = await rentalsService.sendContactMessage(req.params.id as string, req.body);
            sendSuccess(res, message, 201);
        } catch (error) {
            next(error);
        }
    }
}

export const rentalsController = new RentalsController();
