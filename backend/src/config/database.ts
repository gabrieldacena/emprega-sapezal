// ============================================================
// Instância compartilhada do Prisma Client
// ============================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

/**
 * Função utilitária para executar operações com tentativas de reconexão
 */
export async function withRetry<T>(operation: () => Promise<T>, retries = 3): Promise<T> {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;
            // Se for erro de conexão (P1001, P1002, P1003, P1008, P1017)
            const connectionErrors = ['P1001', 'P1002', 'P1003', 'P1008', 'P1017'];
            if (connectionErrors.includes(error.code) || error.message.includes('Can\'t reach database')) {
                console.warn(`[Prisma] Falha de conexão. Tentativa ${i + 1} de ${retries}...`);
                await new Promise(res => setTimeout(res, 1000 * (i + 1))); // Exponential backoff
                await prisma.$connect().catch(() => { }); // Tenta reconectar explicitamente
                continue;
            }
            throw error; // Se não for erro de conexão, lança imediatamente
        }
    }
    throw lastError;
}

export default prisma;
