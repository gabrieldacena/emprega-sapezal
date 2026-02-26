// ============================================================
// Auth Routes — /api/auth
// ============================================================

import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { registerCandidateSchema, registerCompanySchema, loginSchema } from './auth.schemas';

const router = Router();

// POST /api/auth/register/candidato
router.post(
    '/register/candidato',
    validate(registerCandidateSchema),
    authController.registerCandidate
);

// POST /api/auth/register/empresa
router.post(
    '/register/empresa',
    validate(registerCompanySchema),
    authController.registerCompany
);

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// GET /api/auth/me — retorna dados do usuário logado
router.get('/me', authenticate, authController.getMe);

export default router;
