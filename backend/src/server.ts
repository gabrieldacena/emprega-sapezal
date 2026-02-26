// ============================================================
// Express Server — Entry Point
// ============================================================

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Importar rotas
import authRoutes from './modules/auth/auth.routes';
import jobsRoutes from './modules/jobs/jobs.routes';
import rentalsRoutes from './modules/rentals/rentals.routes';
import applicationsRoutes from './modules/applications/applications.routes';
import usersRoutes from './modules/users/users.routes';
import adminRoutes from './modules/admin/admin.routes';
import contentRoutes from './modules/content/content.routes';

const app = express();

// ---- MIDDLEWARE GLOBAL ----

app.use(cors({
    origin: (origin, callback) => {
        // Permitir local e a URL configurada (com ou sem barra final)
        const allowed = [
            env.FRONTEND_URL,
            env.FRONTEND_URL.replace(/\/$/, ''),
            'https://emprega-sapezal.vercel.app',
        ];
        if (!origin || allowed.includes(origin) || env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error(`Não permitido pelo CORS: ${origin}`));
        }
    },
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- ROTAS ----

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/rentals', rentalsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);

// ---- ROTA 404 ----

app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint não encontrado.',
        code: 'NOT_FOUND',
    });
});

// ---- ERROR HANDLER ----

app.use(errorHandler);

// ---- INICIAR SERVIDOR ----

const PORT = parseInt(env.PORT);
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
    console.log(`📊 Health check: http://${HOST}:${PORT}/api/health`);
    console.log(`🌍 Ambiente: ${env.NODE_ENV}`);
});

export default app;
