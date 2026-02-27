import { PrismaClient } from '@prisma/client';

async function testConnection() {
    console.log('--- Diagnóstico de Conexão Supabase ---');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':***@')); // Oculta a senha

    const prisma = new PrismaClient();

    try {
        console.log('Tentando conectar...');
        await prisma.$connect();
        console.log('✅ Conexão básica estabelecida!');

        const count = await prisma.user.count();
        console.log(`✅ Consulta realizada com sucesso! Total de usuários: ${count}`);

        // Teste de Prepared Statement
        await prisma.user.findFirst();
        await prisma.user.findFirst();
        console.log('✅ Teste de repetição (Prepared Statement) OK!');

    } catch (error: any) {
        console.error('❌ Falha na conexão:');
        console.error(error.message);
        if (error.code === 'P1001') {
            console.log('\nDica: O erro P1001 indica que o servidor não foi encontrado ou está inacessível. Verifique se o hostname e a porta estão corretos.');
        }
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
