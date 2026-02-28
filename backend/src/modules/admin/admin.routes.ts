// ============================================================
// Admin Routes — /api/admin
// ============================================================

import { Router } from 'express';
import { adminController } from './admin.controller';
import { uploadController } from './upload.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { upload } from '../../middleware/upload';

const router = Router();

// Todas as rotas requerem login como ADMIN
router.use(authenticate, authorize('ADMIN'));

// Dashboard
router.get('/summary', adminController.summary);
router.post('/admins', adminController.createAdmin); // Added route for creating admins
router.get('/dashboard', adminController.dashboard);
router.get('/activity', adminController.recentActivity);

// Usuários
router.get('/users', adminController.listUsers);
router.patch('/users/:id/toggle', adminController.toggleUser);
router.delete('/users/:id', adminController.deleteUser);

// Vagas
router.get('/jobs', adminController.listJobs);
router.patch('/jobs/:id', adminController.moderateJob);
router.delete('/jobs/:id', adminController.deleteJob);

// Aluguéis
router.get('/rentals', adminController.listRentals);
router.post('/rentals', adminController.createRental);
router.patch('/rentals/:id', adminController.moderateRental);
router.delete('/rentals/:id', adminController.deleteRental);

// Upload
router.post('/upload', upload.single('image'), uploadController.uploadImage);

// Candidaturas
router.get('/applications', adminController.listApplications);

// Mensagens de contato
router.get('/messages', adminController.listMessages);
router.delete('/messages/:id', adminController.deleteMessage);

// Anúncios
router.get('/ads', adminController.listAds);
router.post('/ads', adminController.createAd);
router.patch('/ads/:id', adminController.updateAd);
router.delete('/ads/:id', adminController.deleteAd);

// Notícias
router.get('/news', adminController.listNews);
router.post('/news', adminController.createNews);
router.patch('/news/:id', adminController.updateNews);
router.delete('/news/:id', adminController.deleteNews);
router.patch('/news/:id/headline', adminController.setHeadline);

// Configurações do site
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);
router.delete('/settings/:chave', adminController.deleteSetting);

export default router;
