
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
    const email = 'admin@admin.com';
    const novaSenha = '99157881';

    console.log(`🔐 Resetando senha para ${email}...`);

    const senhaHash = await bcrypt.hash(novaSenha, 12);

    try {
        await prisma.user.update({
            where: { email },
            data: { senhaHash }
        });
        console.log('✅ Senha resetada com sucesso para: 99157881');
    } catch (error: any) {
        console.error('❌ Erro ao resetar senha:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();
