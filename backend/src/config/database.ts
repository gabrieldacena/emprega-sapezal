// ============================================================
// Instância compartilhada do Prisma Client
// ============================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasourceUrl: process.env.DATABASE_URL + '&connect_timeout=30&pool_timeout=30',
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
            const connectionErrors = ['P1001', 'P1002', 'P1003', 'P1008', 'P1017', 'P2021', 'P2025'];
            const isConnectionError = connectionErrors.includes(error.code) ||
                error.message.includes('Can\'t reach database') ||
                error.message.includes('Timed out') ||
                error.message.includes('connection error');

            if (isConnectionError) {
                console.warn(`[Prisma] Falha de conexão detectada. Tentativa ${i + 1} de ${retries}...`);
                const delay = 1000 * Math.pow(2, i); // Exponential backoff: 1s, 2s, 4s
                await new Promise(res => setTimeout(res, delay));

                // Tenta reconectar explicitamente com tratamento de erro
                try {
                    await prisma.$connect();
                } catch (cErr: any) {
                    console.error('[Prisma] Falha ao tentar reconectar:', cErr.message);
                }
                continue;
            }
            throw error; // Se não for erro de conexão, lança imediatamente
        }
    }
    throw lastError;
}

export default prisma;
