// ============================================================
// Configuração de variáveis de ambiente com validação Zod
// ============================================================

import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('3001'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatório'),
    JWT_SECRET: z.string().min(10, 'JWT_SECRET deve ter pelo menos 10 caracteres'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    FRONTEND_URL: z.string().default('http://localhost:5173'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error('❌ ERRO NAS VARIÁVEIS DE AMBIENTE:');
    const errors = result.error.flatten().fieldErrors;
    Object.entries(errors).forEach(([field, messages]) => {
        console.error(`   - ${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`);
    });
    process.exit(1);
}

export const env = result.data;
