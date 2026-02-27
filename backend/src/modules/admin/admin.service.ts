// ============================================================
// Admin Service — Dashboard, moderação de usuários/vagas/aluguéis/candidaturas/mensagens
// ============================================================

import { JobStatus, RentalStatus } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../utils/response';

export class AdminService {
    /** Resumo completo para o dashboard (Stats + Atividade) em uma única transação */
    async getSummary() {
        return prisma.$transaction(async (tx) => {
            const stats = await Promise.all([
                tx.user.count(),
                tx.user.count({ where: { role: 'CANDIDATO' } }),
                tx.user.count({ where: { role: 'EMPRESA' } }),
                tx.job.count({ where: { status: 'ATIVA' } }),
                tx.job.count({ where: { status: 'PENDENTE_APROVACAO' } }),
                tx.job.count({ where: { status: 'REPROVADA' } }),
                tx.job.count(),
                tx.rental.count({ where: { status: 'ATIVO' } }),
                tx.rental.count({ where: { status: 'PENDENTE_APROVACAO' } }),
                tx.rental.count(),
                tx.jobApplication.count(),
                tx.jobApplication.count({ where: { status: 'EM_ANALISE' } }),
                tx.contactMessage.count(),
                tx.user.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
            ]);

            const [recentUsers, recentJobs, recentApplications] = await Promise.all([
                tx.user.findMany({
                    select: { id: true, nome: true, role: true, createdAt: true },
                    orderBy: { createdAt: 'desc' },
                    take: 8,
                }),
                tx.job.findMany({
                    select: { id: true, titulo: true, status: true, createdAt: true, company: { select: { nomeEmpresa: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 8,
                }),
                tx.jobApplication.findMany({
                    select: {
                        id: true, status: true, createdAt: true,
                        candidate: { select: { user: { select: { nome: true } } } },
                        job: { select: { titulo: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 8,
                }),
            ]);

            return {
                stats: {
                    totalUsers: stats[0],
                    totalCandidatos: stats[1],
                    totalEmpresas: stats[2],
                    vagasAtivas: stats[3],
                    vagasPendentes: stats[4],
                    vagasReprovadas: stats[5],
                    totalVagas: stats[6],
                    alugueisAtivos: stats[7],
                    alugueisPendentes: stats[8],
                    totalAlugueis: stats[9],
                    totalCandidaturas: stats[10],
                    candidaturasEmAnalise: stats[11],
                    totalMensagens: stats[12],
                    novosUsuarios7d: stats[13],
                },
                activity: { recentUsers, recentJobs, recentApplications }
            };
        });
    }

    /** Dashboard com estatísticas completas */
    async getDashboard() {
        const stats = await prisma.$transaction([
            prisma.user.count(),
            prisma.user.count({ where: { role: 'CANDIDATO' } }),
            prisma.user.count({ where: { role: 'EMPRESA' } }),
            prisma.job.count({ where: { status: 'ATIVA' } }),
            prisma.job.count({ where: { status: 'PENDENTE_APROVACAO' } }),
            prisma.job.count({ where: { status: 'REPROVADA' } }),
            prisma.job.count(),
            prisma.rental.count({ where: { status: 'ATIVO' } }),
            prisma.rental.count({ where: { status: 'PENDENTE_APROVACAO' } }),
            prisma.rental.count(),
            prisma.jobApplication.count(),
            prisma.jobApplication.count({ where: { status: 'EM_ANALISE' } }),
            prisma.contactMessage.count(),
            prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
        ]);

        const [
            totalUsers,
            totalCandidatos,
            totalEmpresas,
            vagasAtivas,
            vagasPendentes,
            vagasReprovadas,
            totalVagas,
            alugueisAtivos,
            alugueisPendentes,
            totalAlugueis,
            totalCandidaturas,
            candidaturasEmAnalise,
            totalMensagens,
            novosUsuarios7d,
        ] = stats;

        return {
            totalUsers,
            totalCandidatos,
            totalEmpresas,
            vagasAtivas,
            vagasPendentes,
            vagasReprovadas,
            totalVagas,
            alugueisAtivos,
            alugueisPendentes,
            totalAlugueis,
            totalCandidaturas,
            candidaturasEmAnalise,
            totalMensagens,
            novosUsuarios7d,
        };
    }

    /** Atividade recente — últimos registros de cada tipo */
    async getRecentActivity() {
        const [recentUsers, recentJobs, recentApplications] = await prisma.$transaction([
            prisma.user.findMany({
                select: { id: true, nome: true, role: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 8,
            }),
            prisma.job.findMany({
                select: { id: true, titulo: true, status: true, createdAt: true, company: { select: { nomeEmpresa: true } } },
                orderBy: { createdAt: 'desc' },
                take: 8,
            }),
            prisma.jobApplication.findMany({
                select: {
                    id: true, status: true, createdAt: true,
                    candidate: { select: { user: { select: { nome: true } } } },
                    job: { select: { titulo: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 8,
            }),
        ]);

        return { recentUsers, recentJobs, recentApplications };
    }

    /** Lista todos os usuários (com filtros) */
    async listUsers(filters: { tipo?: string; busca?: string; page?: string; limit?: string }) {
        const page = parseInt(filters.page || '1');
        const limit = Math.min(parseInt(filters.limit || '20'), 100);
        const skip = (page - 1) * limit;

        const where: any = {};
        if (filters.tipo) where.role = filters.tipo;
        if (filters.busca) {
            where.OR = [
                { nome: { contains: filters.busca, mode: 'insensitive' } },
                { email: { contains: filters.busca, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    role: true,
                    cidade: true,
                    telefone: true,
                    ativo: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        return { users, total, page, limit };
    }

    /** Ativa/desativa um usuário */
    async toggleUser(userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError('Usuário não encontrado.', 404);
        if (user.role === 'ADMIN') throw new AppError('Não é possível desativar um admin.', 400);

        return prisma.user.update({
            where: { id: userId },
            data: { ativo: !user.ativo },
            select: { id: true, nome: true, ativo: true },
        });
    }

    /** Exclui um usuário permanentemente */
    async deleteUser(userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError('Usuário não encontrado.', 404);
        if (user.role === 'ADMIN') throw new AppError('Não é possível excluir um admin.', 400);
        await prisma.user.delete({ where: { id: userId } });
    }

    /** Lista todas as vagas (admin pode ver todas) */
    async listAllJobs(filters: { status?: string; busca?: string; page?: string; limit?: string }) {
        const page = parseInt(filters.page || '1');
        const limit = Math.min(parseInt(filters.limit || '20'), 100);
        const skip = (page - 1) * limit;

        const where: any = {};
        if (filters.status) where.status = filters.status;
        if (filters.busca) {
            where.OR = [
                { titulo: { contains: filters.busca, mode: 'insensitive' } },
            ];
        }

        const [jobs, total] = await Promise.all([
            prisma.job.findMany({
                where,
                include: {
                    company: { select: { nomeEmpresa: true } },
                    _count: { select: { applications: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.job.count({ where }),
        ]);

        return { jobs, total, page, limit };
    }

    /** Moderação de vaga (aprovar, reprovar, ocultar, destacar) */
    async moderateJob(jobId: string, data: { action?: string; status?: JobStatus; destaque?: boolean }) {
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) throw new AppError('Vaga não encontrada.', 404);

        const updateData: { status?: JobStatus; destaque?: boolean } = {};

        // Aceita action do frontend ou status direto
        if (data.action) {
            switch (data.action) {
                case 'approve': updateData.status = 'ATIVA' as JobStatus; break;
                case 'reject': updateData.status = 'REPROVADA' as JobStatus; break;
                case 'hide': updateData.status = 'OCULTA' as JobStatus; break;
                case 'feature': updateData.destaque = true; break;
                case 'unfeature': updateData.destaque = false; break;
            }
        } else {
            if (data.status) updateData.status = data.status;
            if (data.destaque !== undefined) updateData.destaque = data.destaque;
        }

        return prisma.job.update({ where: { id: jobId }, data: updateData });
    }

    /** Exclui vaga (admin) */
    async deleteJob(jobId: string) {
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) throw new AppError('Vaga não encontrada.', 404);
        await prisma.job.delete({ where: { id: jobId } });
    }

    /** Lista todos os anúncios de aluguel */
    async listAllRentals(filters: { status?: string; busca?: string; page?: string; limit?: string }) {
        const page = parseInt(filters.page || '1');
        const limit = Math.min(parseInt(filters.limit || '20'), 100);
        const skip = (page - 1) * limit;

        const where: any = {};
        if (filters.status) where.status = filters.status;
        if (filters.busca) {
            where.OR = [
                { titulo: { contains: filters.busca, mode: 'insensitive' } },
            ];
        }

        const [rentals, total] = await Promise.all([
            prisma.rental.findMany({
                where,
                include: {
                    company: { select: { nomeEmpresa: true } },
                    imagens: { orderBy: { ordem: 'asc' }, take: 1 },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.rental.count({ where }),
        ]);

        return { rentals, total, page, limit };
    }

    /** Moderação de anúncio */
    async moderateRental(rentalId: string, data: { action?: string; status?: RentalStatus; destaque?: boolean }) {
        const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
        if (!rental) throw new AppError('Anúncio não encontrado.', 404);

        const updateData: { status?: RentalStatus; destaque?: boolean } = {};

        if (data.action) {
            switch (data.action) {
                case 'approve': updateData.status = 'ATIVO' as RentalStatus; break;
                case 'reject': updateData.status = 'REPROVADO' as RentalStatus; break;
                case 'hide': updateData.status = 'OCULTO' as RentalStatus; break;
                case 'feature': updateData.destaque = true; break;
                case 'unfeature': updateData.destaque = false; break;
            }
        } else {
            if (data.status) updateData.status = data.status;
            if (data.destaque !== undefined) updateData.destaque = data.destaque;
        }

        return prisma.rental.update({ where: { id: rentalId }, data: updateData });
    }

    /** Exclui anúncio (admin) */
    async deleteRental(rentalId: string) {
        const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
        if (!rental) throw new AppError('Anúncio não encontrado.', 404);
        await prisma.rental.delete({ where: { id: rentalId } });
    }

    /** Lista todas as candidaturas */
    async listApplications(filters: { status?: string; busca?: string; page?: string; limit?: string }) {
        const page = parseInt(filters.page || '1');
        const limit = Math.min(parseInt(filters.limit || '20'), 100);
        const skip = (page - 1) * limit;

        const where: any = {};
        if (filters.status) where.status = filters.status;

        const [applications, total] = await Promise.all([
            prisma.jobApplication.findMany({
                where,
                include: {
                    job: { select: { id: true, titulo: true, cidade: true, company: { select: { nomeEmpresa: true } } } },
                    candidate: { select: { id: true, user: { select: { nome: true, email: true, telefone: true } } } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.jobApplication.count({ where }),
        ]);

        return { applications, total, page, limit };
    }

    /** Lista todas as mensagens de contato */
    async listContactMessages(filters: { page?: string; limit?: string }) {
        const page = parseInt(filters.page || '1');
        const limit = Math.min(parseInt(filters.limit || '20'), 100);
        const skip = (page - 1) * limit;

        const [messages, total] = await Promise.all([
            prisma.contactMessage.findMany({
                include: {
                    rental: { select: { id: true, titulo: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.contactMessage.count(),
        ]);

        return { messages, total, page, limit };
    }

    /** Exclui mensagem de contato */
    async deleteContactMessage(messageId: string) {
        const msg = await prisma.contactMessage.findUnique({ where: { id: messageId } });
        if (!msg) throw new AppError('Mensagem não encontrada.', 404);
        await prisma.contactMessage.delete({ where: { id: messageId } });
    }

    // ---- ANÚNCIOS ----

    async listAds() {
        return prisma.advertisement.findMany({ orderBy: [{ ordem: 'asc' }, { createdAt: 'desc' }] });
    }

    async createAd(data: { titulo: string; imagemUrl: string; linkUrl?: string; posicao?: string; ordem?: number }) {
        return prisma.advertisement.create({ data: data as any });
    }

    async updateAd(id: string, data: { titulo?: string; imagemUrl?: string; linkUrl?: string; posicao?: string; ativo?: boolean; ordem?: number }) {
        const ad = await prisma.advertisement.findUnique({ where: { id } });
        if (!ad) throw new AppError('Anúncio não encontrado.', 404);
        return prisma.advertisement.update({ where: { id }, data: data as any });
    }

    async deleteAd(id: string) {
        const ad = await prisma.advertisement.findUnique({ where: { id } });
        if (!ad) throw new AppError('Anúncio não encontrado.', 404);
        await prisma.advertisement.delete({ where: { id } });
    }

    // ---- NOTÍCIAS ----

    async listNews() {
        return prisma.newsArticle.findMany({ orderBy: { createdAt: 'desc' } });
    }

    async createNews(data: { titulo: string; conteudo: string; imagemUrl?: string; destaquePrincipal?: boolean }) {
        // Se marcou como destaque principal, remove o destaque das outras
        if (data.destaquePrincipal) {
            await prisma.newsArticle.updateMany({ where: { destaquePrincipal: true }, data: { destaquePrincipal: false } });
        }
        return prisma.newsArticle.create({ data });
    }

    async updateNews(id: string, data: { titulo?: string; conteudo?: string; imagemUrl?: string; destaquePrincipal?: boolean; ativo?: boolean }) {
        const article = await prisma.newsArticle.findUnique({ where: { id } });
        if (!article) throw new AppError('Notícia não encontrada.', 404);
        if (data.destaquePrincipal) {
            await prisma.newsArticle.updateMany({ where: { destaquePrincipal: true }, data: { destaquePrincipal: false } });
        }
        return prisma.newsArticle.update({ where: { id }, data });
    }

    async deleteNews(id: string) {
        const article = await prisma.newsArticle.findUnique({ where: { id } });
        if (!article) throw new AppError('Notícia não encontrada.', 404);
        await prisma.newsArticle.delete({ where: { id } });
    }

    async setHeadline(id: string) {
        await prisma.newsArticle.updateMany({ where: { destaquePrincipal: true }, data: { destaquePrincipal: false } });
        return prisma.newsArticle.update({ where: { id }, data: { destaquePrincipal: true } });
    }

    // ---- CONFIGURAÇÕES DO SITE ----

    async getSettings() {
        const settings = await prisma.siteSettings.findMany();
        const result: Record<string, string> = {};
        settings.forEach((s: any) => { result[s.chave] = s.valor; });
        return result;
    }

    async updateSetting(chave: string, valor: string) {
        return prisma.siteSettings.upsert({
            where: { chave },
            update: { valor },
            create: { chave, valor },
        });
    }

    async deleteSetting(chave: string) {
        const setting = await prisma.siteSettings.findUnique({ where: { chave } });
        if (!setting) throw new AppError('Configuração não encontrada.', 404);
        await prisma.siteSettings.delete({ where: { chave } });
    }
}

export const adminService = new AdminService();
