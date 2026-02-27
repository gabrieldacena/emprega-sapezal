// ============================================================
// Script para gerenciar admins via linha de comando
// Uso:
//   npx tsx scripts/admin.ts criar email@exemplo.com "Nome" senha123
//   npx tsx scripts/admin.ts excluir email@exemplo.com
//   npx tsx scripts/admin.ts listar
// ============================================================

import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../src/config/database';

async function main() {
    const [, , acao, ...args] = process.argv;

    if (!acao) {
        console.log(`
🛡️  Gerenciador de Admins — Emprega Sapezal

Comandos:
  npx tsx scripts/admin.ts criar email@exemplo.com "Nome do Admin" senha123
  npx tsx scripts/admin.ts excluir email@exemplo.com
  npx tsx scripts/admin.ts listar
        `);
        return;
    }

    switch (acao) {
        case 'criar': {
            const [email, nome, senha] = args;
            if (!email || !nome || !senha) {
                console.log('❌ Use: npx tsx scripts/admin.ts criar email nome senha');
                return;
            }
            const existe = await prisma.user.findUnique({ where: { email } });
            if (existe) {
                console.log(`❌ Já existe um usuário com o email ${email}`);
                return;
            }
            const senhaHash = await bcrypt.hash(senha, 12);
            const admin = await prisma.user.create({
                data: {
                    email,
                    nome,
                    senhaHash,
                    role: UserRole.ADMIN,
                    cidade: 'Sapezal',
                    estado: 'MT',
                },
            });
            console.log(`✅ Admin criado!`);
            console.log(`   Email: ${admin.email}`);
            console.log(`   Nome:  ${admin.nome}`);
            console.log(`   ID:    ${admin.id}`);
            break;
        }

        case 'excluir': {
            const [email] = args;
            if (!email) {
                console.log('❌ Use: npx tsx scripts/admin.ts excluir email');
                return;
            }
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                console.log(`❌ Usuário ${email} não encontrado.`);
                return;
            }
            if (user.role !== 'ADMIN') {
                console.log(`❌ ${email} não é admin (role: ${user.role}).`);
                return;
            }
            await prisma.user.delete({ where: { email } });
            console.log(`✅ Admin ${email} excluído!`);
            break;
        }

        case 'listar': {
            const admins = await prisma.user.findMany({
                where: { role: UserRole.ADMIN },
                select: { id: true, email: true, nome: true, createdAt: true },
            });
            if (admins.length === 0) {
                console.log('Nenhum admin encontrado.');
                return;
            }
            console.log(`\n🛡️ Admins (${admins.length}):\n`);
            admins.forEach(a => {
                console.log(`  📧 ${a.email} — ${a.nome} (desde ${a.createdAt.toLocaleDateString('pt-BR')})`);
            });
            break;
        }

        default:
            console.log(`❌ Ação "${acao}" não reconhecida. Use: criar, excluir, listar`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
