// ============================================================
// Users Service — Gerenciamento de perfil
// ============================================================

import prisma from '../../config/database';
import { AppError } from '../../utils/response';

interface UpdateCandidateProfileInput {
    nome?: string;
    cidade?: string;
    estado?: string;
    telefone?: string;
    resumoProfissional?: string;
    linkCurriculo?: string;
    linkLinkedin?: string;
    areaInteresse?: string;
    experienciaAnos?: number;
}

interface UpdateCompanyProfileInput {
    nome?: string;
    cidade?: string;
    estado?: string;
    telefone?: string;
    nomeEmpresa?: string;
    cnpj?: string;
    areaAtuacao?: string;
    descricao?: string;
    site?: string;
    logoUrl?: string;
}

export class UsersService {
    /** Obtém perfil completo */
    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                candidateProfile: true,
                companyProfile: true,
            },
        });

        if (!user) throw new AppError('Usuário não encontrado.', 404);

        const { senhaHash, ...rest } = user;
        return rest;
    }

    /** Atualiza perfil do candidato */
    async updateCandidateProfile(userId: string, input: UpdateCandidateProfileInput) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                nome: input.nome,
                cidade: input.cidade,
                estado: input.estado,
                telefone: input.telefone,
                candidateProfile: {
                    update: {
                        resumoProfissional: input.resumoProfissional,
                        linkCurriculo: input.linkCurriculo,
                        linkLinkedin: input.linkLinkedin,
                        areaInteresse: input.areaInteresse,
                        experienciaAnos: input.experienciaAnos,
                    },
                },
            },
            include: { candidateProfile: true },
        });

        const { senhaHash, ...rest } = user;
        return rest;
    }

    /** Atualiza perfil da empresa */
    async updateCompanyProfile(userId: string, input: UpdateCompanyProfileInput) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                nome: input.nome,
                cidade: input.cidade,
                estado: input.estado,
                telefone: input.telefone,
                companyProfile: {
                    update: {
                        nomeEmpresa: input.nomeEmpresa,
                        cnpj: input.cnpj,
                        areaAtuacao: input.areaAtuacao,
                        descricao: input.descricao,
                        site: input.site,
                        logoUrl: input.logoUrl,
                    },
                },
            },
            include: { companyProfile: true },
        });

        const { senhaHash, ...rest } = user;
        return rest;
    }
}

export const usersService = new UsersService();
