// ============================================================
// Auth Service — Registro, Login, Perfil
// ============================================================

import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../utils/response';
import { generateToken } from '../../middleware/auth';

interface RegisterCandidateInput {
    nome: string;
    email: string;
    senha: string;
    cidade?: string;
    estado?: string;
    telefone?: string;
}

interface RegisterCompanyInput {
    nome: string;
    email: string;
    senha: string;
    cidade?: string;
    estado?: string;
    telefone?: string;
    nomeEmpresa: string;
    cnpj?: string;
    areaAtuacao?: string;
}

interface LoginInput {
    email: string;
    senha: string;
}

export class AuthService {
    /** Registra um novo candidato */
    async registerCandidate(input: RegisterCandidateInput) {
        const existing = await prisma.user.findUnique({ where: { email: input.email } });
        if (existing) {
            throw new AppError('Este e-mail já está cadastrado.', 409, 'DUPLICATE_EMAIL');
        }

        const senhaHash = await bcrypt.hash(input.senha, 12);

        const user = await prisma.user.create({
            data: {
                nome: input.nome,
                email: input.email,
                senhaHash,
                role: UserRole.CANDIDATO,
                cidade: input.cidade,
                estado: input.estado,
                telefone: input.telefone,
                candidateProfile: {
                    create: {},
                },
            },
            include: { candidateProfile: true },
        });

        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
            nome: user.nome,
        });

        return { user: this.sanitizeUser(user), token };
    }

    /** Registra uma nova empresa */
    async registerCompany(input: RegisterCompanyInput) {
        const existing = await prisma.user.findUnique({ where: { email: input.email } });
        if (existing) {
            throw new AppError('Este e-mail já está cadastrado.', 409, 'DUPLICATE_EMAIL');
        }

        const senhaHash = await bcrypt.hash(input.senha, 12);

        const user = await prisma.user.create({
            data: {
                nome: input.nome,
                email: input.email,
                senhaHash,
                role: UserRole.EMPRESA,
                cidade: input.cidade,
                estado: input.estado,
                telefone: input.telefone,
                companyProfile: {
                    create: {
                        nomeEmpresa: input.nomeEmpresa,
                        cnpj: input.cnpj,
                        areaAtuacao: input.areaAtuacao,
                    },
                },
            },
            include: { companyProfile: true },
        });

        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
            nome: user.nome,
        });

        return { user: this.sanitizeUser(user), token };
    }

    /** Login de qualquer tipo de usuário */
    async login(input: LoginInput) {
        const user = await prisma.user.findUnique({
            where: { email: input.email },
            include: {
                candidateProfile: true,
                companyProfile: true,
            },
        });

        if (!user) {
            throw new AppError('E-mail ou senha incorretos.', 401, 'INVALID_CREDENTIALS');
        }

        if (!user.ativo) {
            throw new AppError('Sua conta foi desativada. Entre em contato com o administrador.', 403, 'ACCOUNT_DISABLED');
        }

        const senhaValida = await bcrypt.compare(input.senha, user.senhaHash);
        if (!senhaValida) {
            throw new AppError('E-mail ou senha incorretos.', 401, 'INVALID_CREDENTIALS');
        }

        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
            nome: user.nome,
        });

        return { user: this.sanitizeUser(user), token };
    }

    /** Obtém dados do usuário logado */
    async getMe(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                candidateProfile: true,
                companyProfile: true,
            },
        });

        if (!user) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        return this.sanitizeUser(user);
    }

    /** Remove senha do retorno */
    private sanitizeUser(user: any) {
        const { senhaHash, ...rest } = user;
        return rest;
    }
}

export const authService = new AuthService();
