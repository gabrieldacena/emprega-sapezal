// ============================================================
// Admin Controller
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { sendSuccess, sendPaginated } from '../../utils/response';

export class AdminController {
    async dashboard(_req: Request, res: Response, next: NextFunction) {
        try {
            const stats = await adminService.getDashboard();
            sendSuccess(res, stats);
        } catch (error) {
            next(error);
        }
    }

    async recentActivity(_req: Request, res: Response, next: NextFunction) {
        try {
            const activity = await adminService.getRecentActivity();
            sendSuccess(res, activity);
        } catch (error) {
            next(error);
        }
    }

    async listUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await adminService.listUsers(req.query as any);
            sendPaginated(res, result.users, result.total, result.page, result.limit);
        } catch (error) {
            next(error);
        }
    }

    async toggleUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await adminService.toggleUser(req.params.id as string);
            sendSuccess(res, user);
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            await adminService.deleteUser(req.params.id as string);
            sendSuccess(res, { message: 'Usuário excluído.' });
        } catch (error) {
            next(error);
        }
    }

    async listJobs(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await adminService.listAllJobs(req.query as any);
            sendPaginated(res, result.jobs, result.total, result.page, result.limit);
        } catch (error) {
            next(error);
        }
    }

    async moderateJob(req: Request, res: Response, next: NextFunction) {
        try {
            const job = await adminService.moderateJob(req.params.id as string, req.body);
            sendSuccess(res, job);
        } catch (error) {
            next(error);
        }
    }

    async deleteJob(req: Request, res: Response, next: NextFunction) {
        try {
            await adminService.deleteJob(req.params.id as string);
            sendSuccess(res, { message: 'Vaga excluída.' });
        } catch (error) {
            next(error);
        }
    }

    async listRentals(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await adminService.listAllRentals(req.query as any);
            sendPaginated(res, result.rentals, result.total, result.page, result.limit);
        } catch (error) {
            next(error);
        }
    }

    async moderateRental(req: Request, res: Response, next: NextFunction) {
        try {
            const rental = await adminService.moderateRental(req.params.id as string, req.body);
            sendSuccess(res, rental);
        } catch (error) {
            next(error);
        }
    }

    async deleteRental(req: Request, res: Response, next: NextFunction) {
        try {
            await adminService.deleteRental(req.params.id as string);
            sendSuccess(res, { message: 'Anúncio excluído.' });
        } catch (error) {
            next(error);
        }
    }

    async listApplications(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await adminService.listApplications(req.query as any);
            sendPaginated(res, result.applications, result.total, result.page, result.limit);
        } catch (error) {
            next(error);
        }
    }

    async listMessages(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await adminService.listContactMessages(req.query as any);
            sendPaginated(res, result.messages, result.total, result.page, result.limit);
        } catch (error) {
            next(error);
        }
    }

    async deleteMessage(req: Request, res: Response, next: NextFunction) {
        try {
            await adminService.deleteContactMessage(req.params.id as string);
            sendSuccess(res, { message: 'Mensagem excluída.' });
        } catch (error) {
            next(error);
        }
    }

    // ---- ANÚNCIOS ----

    async listAds(_req: Request, res: Response, next: NextFunction) {
        try { sendSuccess(res, await adminService.listAds()); } catch (e) { next(e); }
    }
    async createAd(req: Request, res: Response, next: NextFunction) {
        try { sendSuccess(res, await adminService.createAd(req.body), 201); } catch (e) { next(e); }
    }
    async updateAd(req: Request, res: Response, next: NextFunction) {
        try { sendSuccess(res, await adminService.updateAd(req.params.id, req.body)); } catch (e) { next(e); }
    }
    async deleteAd(req: Request, res: Response, next: NextFunction) {
        try { await adminService.deleteAd(req.params.id); sendSuccess(res, { message: 'Anúncio excluído.' }); } catch (e) { next(e); }
    }

    // ---- NOTÍCIAS ----

    async listNews(_req: Request, res: Response, next: NextFunction) {
        try { sendSuccess(res, await adminService.listNews()); } catch (e) { next(e); }
    }
    async createNews(req: Request, res: Response, next: NextFunction) {
        try { sendSuccess(res, await adminService.createNews(req.body), 201); } catch (e) { next(e); }
    }
    async updateNews(req: Request, res: Response, next: NextFunction) {
        try { sendSuccess(res, await adminService.updateNews(req.params.id, req.body)); } catch (e) { next(e); }
    }
    async deleteNews(req: Request, res: Response, next: NextFunction) {
        try { await adminService.deleteNews(req.params.id); sendSuccess(res, { message: 'Notícia excluída.' }); } catch (e) { next(e); }
    }
    async setHeadline(req: Request, res: Response, next: NextFunction) {
        try { sendSuccess(res, await adminService.setHeadline(req.params.id)); } catch (e) { next(e); }
    }

    // ---- CONFIGURAÇÕES ----

    async getSettings(_req: Request, res: Response, next: NextFunction) {
        try { sendSuccess(res, await adminService.getSettings()); } catch (e) { next(e); }
    }
    async updateSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const entries = Object.entries(req.body) as [string, string][];
            for (const [chave, valor] of entries) {
                await adminService.updateSetting(chave, valor);
            }
            sendSuccess(res, await adminService.getSettings());
        } catch (e) { next(e); }
    }
    async deleteSetting(req: Request, res: Response, next: NextFunction) {
        try { await adminService.deleteSetting(req.params.chave); sendSuccess(res, { message: 'Configuração removida.' }); } catch (e) { next(e); }
    }
}

export const adminController = new AdminController();
