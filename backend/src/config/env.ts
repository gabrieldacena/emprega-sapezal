// ============================================================
// Configuração de variáveis de ambiente com validação Zod
// ============================================================

import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('3001'),
    NODE_ENV: z.string().default('development'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatório'),
    JWT_SECRET: z.string().min(10, 'JWT_SECRET é obrigatório'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    FRONTEND_URL: z.string().default('http://localhost:5173'),
    SUPABASE_URL: z.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error('❌ ERRO NAS VARIÁVEIS DE AMBIENTE:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
}

export const env = result.data;
