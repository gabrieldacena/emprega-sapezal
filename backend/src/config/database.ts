import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Helper para garantir parâmetros na DATABASE_URL
const getBaseUrl = () => {
    const url = env.DATABASE_URL;
    const connector = url.includes('?') ? '&' : '?';
    // Forçamos limites baixos de conexão para evitar exaustão no Render
    // E garantimos que sslmode esteja presente se não estiver
    const baseParams = 'connect_timeout=30&pool_timeout=30&connection_limit=3';
    const sslParam = url.includes('sslmode') ? '' : '&sslmode=require';
    return `${url}${connector}${baseParams}${sslParam}`;
};

const prisma = new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: {
        db: {
            url: getBaseUrl(),
        },
    },
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
