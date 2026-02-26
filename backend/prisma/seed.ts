// ============================================================
// Seed — Dados de exemplo para desenvolvimento
// Cria: 1 admin, 1 empresa (2 vagas + 1 aluguel), 2 candidatos
// ============================================================

import { PrismaClient, UserRole, ContractType, WorkModel, JobStatus, RentalStatus, PropertyType, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed...');

    // Limpar dados existentes
    await prisma.contactMessage.deleteMany();
    await prisma.jobApplication.deleteMany();
    await prisma.rentalImage.deleteMany();
    await prisma.rental.deleteMany();
    await prisma.job.deleteMany();
    await prisma.candidateProfile.deleteMany();
    await prisma.companyProfile.deleteMany();
    await prisma.user.deleteMany();

    const senhaHash = await bcrypt.hash('123456', 12);

    // ---- ADMIN ----
    const admin = await prisma.user.create({
        data: {
            nome: 'Administrador',
            email: 'admin@empregasapezal.com',
            senhaHash,
            role: UserRole.ADMIN,
            cidade: 'Sapezal',
            estado: 'MT',
            telefone: '(65) 99999-0000',
        },
    });
    console.log(`✅ Admin criado: ${admin.email}`);

    // ---- EMPRESA ----
    const empresaUser = await prisma.user.create({
        data: {
            nome: 'João Empresário',
            email: 'empresa@teste.com',
            senhaHash,
            role: UserRole.EMPRESA,
            cidade: 'Sapezal',
            estado: 'MT',
            telefone: '(65) 99999-1111',
            companyProfile: {
                create: {
                    nomeEmpresa: 'AgroTech Sapezal LTDA',
                    cnpj: '12.345.678/0001-90',
                    areaAtuacao: 'Agronegócio e Tecnologia',
                    descricao: 'Empresa inovadora no setor de agronegócio, combinando tecnologia e sustentabilidade para o agricultor moderno.',
                    site: 'https://agrotech-sapezal.com.br',
                },
            },
        },
        include: { companyProfile: true },
    });
    console.log(`✅ Empresa criada: ${empresaUser.email}`);

    const companyId = empresaUser.companyProfile!.id;

    // ---- VAGAS ----
    const vaga1 = await prisma.job.create({
        data: {
            companyId,
            titulo: 'Desenvolvedor Full-Stack Pleno',
            descricao: 'Buscamos um desenvolvedor full-stack para atuar no desenvolvimento de sistemas internos de gestão agrícola. O profissional será responsável por criar e manter aplicações web utilizando tecnologias modernas.',
            requisitos: '- Experiência com React e Node.js\n- Conhecimento em bancos de dados relacionais\n- Familiaridade com metodologias ágeis\n- Boa comunicação e trabalho em equipe',
            beneficios: '- Salário competitivo\n- Vale alimentação\n- Plano de saúde\n- Home office 2x por semana\n- Participação nos lucros',
            tipoContrato: ContractType.CLT,
            faixaSalarial: 'R$ 6.000 - R$ 9.000',
            modeloTrabalho: WorkModel.HIBRIDO,
            cidade: 'Sapezal',
            estado: 'MT',
            status: JobStatus.ATIVA,
            destaque: true,
        },
    });

    const vaga2 = await prisma.job.create({
        data: {
            companyId,
            titulo: 'Técnico Agrícola de Campo',
            descricao: 'Precisamos de técnico agrícola para acompanhamento de lavouras, monitoramento de pragas e análise de solo nas fazendas parceiras da região de Sapezal.',
            requisitos: '- Formação técnica em Agronomia ou Agrícola\n- CNH categoria B\n- Disponibilidade para viagens na região\n- Experiência com culturas de soja e milho (diferencial)',
            beneficios: '- Salário + comissão\n- Veículo da empresa\n- Vale alimentação\n- Alojamento quando necessário',
            tipoContrato: ContractType.CLT,
            faixaSalarial: 'R$ 3.500 - R$ 5.000',
            modeloTrabalho: WorkModel.PRESENCIAL,
            cidade: 'Sapezal',
            estado: 'MT',
            status: JobStatus.ATIVA,
            destaque: false,
        },
    });

    console.log('✅ 2 vagas criadas');

    // ---- ANÚNCIO DE ALUGUEL ----
    const aluguel = await prisma.rental.create({
        data: {
            companyId,
            titulo: 'Casa 3 Quartos — Centro de Sapezal',
            tipoImovel: PropertyType.CASA,
            valorAluguel: 2500,
            cidade: 'Sapezal',
            estado: 'MT',
            descricao: 'Casa espaçosa com 3 quartos (1 suíte), sala ampla, cozinha americana, 2 banheiros, garagem para 2 carros. Localização privilegiada no centro, próxima a supermercados e escolas.',
            status: RentalStatus.ATIVO,
            destaque: true,
            imagens: {
                create: [
                    { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', ordem: 0 },
                    { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', ordem: 1 },
                    { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', ordem: 2 },
                ],
            },
        },
    });
    console.log('✅ 1 anúncio de aluguel criado');

    // ---- CANDIDATOS ----
    const candidato1User = await prisma.user.create({
        data: {
            nome: 'Maria da Silva',
            email: 'maria@teste.com',
            senhaHash,
            role: UserRole.CANDIDATO,
            cidade: 'Sapezal',
            estado: 'MT',
            telefone: '(65) 99999-2222',
            candidateProfile: {
                create: {
                    resumoProfissional: 'Desenvolvedora web com 3 anos de experiência em React e Node.js. Formada em Ciência da Computação pela UFMT. Apaixonada por tecnologia e inovação no agronegócio.',
                    linkCurriculo: 'https://drive.google.com/curriculo-maria',
                    linkLinkedin: 'https://linkedin.com/in/maria-silva',
                    areaInteresse: 'Tecnologia',
                    experienciaAnos: 3,
                },
            },
        },
        include: { candidateProfile: true },
    });

    const candidato2User = await prisma.user.create({
        data: {
            nome: 'Carlos Oliveira',
            email: 'carlos@teste.com',
            senhaHash,
            role: UserRole.CANDIDATO,
            cidade: 'Campo Novo do Parecis',
            estado: 'MT',
            telefone: '(65) 99999-3333',
            candidateProfile: {
                create: {
                    resumoProfissional: 'Técnico agrícola formado pelo IFMT com 5 anos de experiência em fazendas de soja e milho na região noroeste do Mato Grosso. Especialista em manejo integrado de pragas.',
                    linkLinkedin: 'https://linkedin.com/in/carlos-oliveira-agro',
                    areaInteresse: 'Agronegócio',
                    experienciaAnos: 5,
                },
            },
        },
        include: { candidateProfile: true },
    });

    console.log('✅ 2 candidatos criados');

    // ---- CANDIDATURAS ----
    await prisma.jobApplication.create({
        data: {
            jobId: vaga1.id,
            candidateId: candidato1User.candidateProfile!.id,
            status: ApplicationStatus.EM_ANALISE,
            mensagem: 'Olá! Tenho grande interesse na vaga. Minha experiência com React e Node.js se alinha perfeitamente com os requisitos. Gostaria de conversar mais sobre a oportunidade.',
        },
    });

    await prisma.jobApplication.create({
        data: {
            jobId: vaga2.id,
            candidateId: candidato2User.candidateProfile!.id,
            status: ApplicationStatus.ENVIADO,
            mensagem: 'Sou técnico agrícola com experiência na região. Disponível para início imediato.',
        },
    });

    await prisma.jobApplication.create({
        data: {
            jobId: vaga1.id,
            candidateId: candidato2User.candidateProfile!.id,
            status: ApplicationStatus.ENVIADO,
        },
    });

    console.log('✅ 3 candidaturas criadas');

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Credenciais de teste (todas com senha: 123456):');
    console.log('  Admin:     admin@empregasapezal.com');
    console.log('  Empresa:   empresa@teste.com');
    console.log('  Candidato: maria@teste.com');
    console.log('  Candidato: carlos@teste.com');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
