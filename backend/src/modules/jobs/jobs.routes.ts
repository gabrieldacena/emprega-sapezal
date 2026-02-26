// ============================================================
// Jobs Routes — /api/jobs
// ============================================================

import { Router } from 'express';
import { jobsController } from './jobs.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createJobSchema, updateJobSchema, updateJobStatusSchema } from './jobs.schemas';

const router = Router();

// Rotas públicas
router.get('/', jobsController.list);
router.get('/my', authenticate, authorize('EMPRESA'), jobsController.listMyJobs);
router.get('/:id', jobsController.getById);

// Rotas protegidas (empresa)
router.post('/', authenticate, authorize('EMPRESA'), validate(createJobSchema), jobsController.create);
router.put('/:id', authenticate, authorize('EMPRESA'), validate(updateJobSchema), jobsController.update);
router.patch('/:id/status', authenticate, authorize('EMPRESA'), validate(updateJobStatusSchema), jobsController.updateStatus);
router.delete('/:id', authenticate, authorize('EMPRESA'), jobsController.delete);

export default router;
