// ============================================================
// Users Routes — /api/users
// ============================================================

import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/profile', authenticate, usersController.getProfile);
router.put('/profile', authenticate, usersController.updateProfile);

export default router;
