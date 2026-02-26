// ============================================================
// Rentals Routes — /api/rentals
// ============================================================

import { Router } from 'express';
import { rentalsController } from './rentals.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createRentalSchema, updateRentalSchema, updateRentalStatusSchema, contactMessageSchema } from './rentals.schemas';

const router = Router();

// Rotas públicas
router.get('/', rentalsController.list);
router.get('/my', authenticate, authorize('EMPRESA'), rentalsController.listMyRentals);
router.get('/:id', rentalsController.getById);

// Rotas protegidas (empresa)
router.post('/', authenticate, authorize('EMPRESA'), validate(createRentalSchema), rentalsController.create);
router.put('/:id', authenticate, authorize('EMPRESA'), validate(updateRentalSchema), rentalsController.update);
router.patch('/:id/status', authenticate, authorize('EMPRESA'), validate(updateRentalStatusSchema), rentalsController.updateStatus);
router.delete('/:id', authenticate, authorize('EMPRESA'), rentalsController.delete);

// Contato (qualquer pessoa pode enviar)
router.post('/:id/contact', validate(contactMessageSchema), rentalsController.sendContact);

export default router;
