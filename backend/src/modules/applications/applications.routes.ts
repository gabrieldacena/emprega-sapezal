// ============================================================
// Applications Routes — /api/applications
// ============================================================

import { Router } from 'express';
import { applicationsController } from './applications.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { applySchema, updateApplicationStatusSchema } from './applications.schemas';

const router = Router();

// Candidato se candidata
router.post('/', authenticate, authorize('CANDIDATO'), validate(applySchema), applicationsController.apply);

// Candidato vê suas candidaturas
router.get('/my', authenticate, authorize('CANDIDATO'), applicationsController.listMy);

// Empresa vê candidaturas de uma vaga
router.get('/job/:jobId', authenticate, authorize('EMPRESA'), applicationsController.listByJob);

// Empresa atualiza status de candidatura
router.patch('/:id/status', authenticate, authorize('EMPRESA'), validate(updateApplicationStatusSchema), applicationsController.updateStatus);

export default router;
