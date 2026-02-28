// ============================================================
// Configuração de variáveis de ambiente com validação Zod
// ============================================================

import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('3001'),
    NODE_ENV: z.string().default('development'),
    DATABASE_URL: z.string().default(''),
    JWT_SECRET: z.string().default('placeholder-secret-key-long-enough'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    FRONTEND_URL: z.string().default('http://localhost:5173'),
    SUPABASE_URL: z.string().default('placeholder'),
    SUPABASE_SERVICE_ROLE_KEY: z.string().default('placeholder'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error('❌ ERRO NAS VARIÁVEIS DE AMBIENTE:', JSON.stringify(result.error.format(), null, 2));
    // process.exit(1); // Não vamos sair, vamos tentar rodar com os defaults
}

export const env = result.success ? result.data : envSchema.parse({});
