// ============================================================
// Content Routes — Rotas públicas para anúncios, notícias e settings
// ============================================================

import { Router } from 'express';
import prisma from '../../config/database';
import { sendSuccess } from '../../utils/response';

const router = Router();

// Anúncios ativos (público)
router.get('/ads', async (_req, res, next) => {
    try {
        const ads = await prisma.advertisement.findMany({
            where: { ativo: true },
            orderBy: [{ ordem: 'asc' }, { createdAt: 'desc' }],
        });
        sendSuccess(res, ads);
    } catch (error) { next(error); }
});

// Notícias ativas (público)
router.get('/news', async (_req, res, next) => {
    try {
        const news = await prisma.newsArticle.findMany({
            where: { ativo: true },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        sendSuccess(res, news);
    } catch (error) { next(error); }
});

// Notícia destaque principal (público)
router.get('/news/headline', async (_req, res, next) => {
    try {
        const headline = await prisma.newsArticle.findFirst({
            where: { ativo: true, destaquePrincipal: true },
            orderBy: { updatedAt: 'desc' },
        });
        sendSuccess(res, headline);
    } catch (error) { next(error); }
});

// Notícia por ID (público)
router.get('/news/:id', async (req, res, next) => {
    try {
        const article = await prisma.newsArticle.findUnique({ where: { id: req.params.id } });
        if (!article) return res.status(404).json({ success: false, message: 'Notícia não encontrada.' });
        sendSuccess(res, article);
    } catch (error) { next(error); }
});

// Configurações do site (público)
router.get('/settings', async (_req, res, next) => {
    try {
        const settings = await prisma.siteSettings.findMany();
        const result: Record<string, string> = {};
        settings.forEach(s => { result[s.chave] = s.valor; });
        sendSuccess(res, result);
    } catch (error) { next(error); }
});

export default router;
