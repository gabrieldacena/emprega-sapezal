// ============================================================
// Jobs Service — CRUD de vagas de emprego
// ============================================================

import { JobStatus, Prisma } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../utils/response';

interface CreateJobInput {
    titulo: string;
    descricao: string;
    requisitos?: string;
    beneficios?: string;
    tipoContrato: string;
    faixaSalarial?: string;
    modeloTrabalho: string;
    cidade: string;
    estado: string;
}

interface JobFilters {
    cidade?: string;
    estado?: string;
    modeloTrabalho?: string;
    tipoContrato?: string;
    salarioMin?: string;
    salarioMax?: string;
    busca?: string;
    page?: string;
    limit?: string;
}

export class JobsService {
    /** Lista vagas ativas (públicas) com filtros e paginação */
    async listPublic(filters: JobFilters) {
        const page = parseInt(filters.page || '1');
        const limit = Math.min(parseInt(filters.limit || '12'), 50);
        const skip = (page - 1) * limit;

        const where: Prisma.JobWhereInput = {
            status: JobStatus.ATIVA,
        };

        if (filters.cidade) {
            where.cidade = { contains: filters.cidade, mode: 'insensitive' };
        }
        if (filters.estado) {
            where.estado = { equals: filters.estado, mode: 'insensitive' };
        }
        if (filters.modeloTrabalho) {
            where.modeloTrabalho = filters.modeloTrabalho as any;
        }
        if (filters.tipoContrato) {
            where.tipoContrato = filters.tipoContrato as any;
        }
        if (filters.busca) {
            where.OR = [
                { titulo: { contains: filters.busca, mode: 'insensitive' } },
                { descricao: { contains: filters.busca, mode: 'insensitive' } },
            ];
        }

        const [jobs, total] = await Promise.all([
            prisma.job.findMany({
                where,
                include: {
                    company: { select: { nomeEmpresa: true, logoUrl: true } },
                },
                orderBy: [{ destaque: 'desc' }, { createdAt: 'desc' }],
                skip,
                take: limit,
            }),
            prisma.job.count({ where }),
        ]);

        return { jobs, total, page, limit };
    }

    /** Detalhe de uma vaga */
    async getById(id: string) {
        const job = await prisma.job.findUnique({
            where: { id },
            include: {
                company: {
                    select: {
                        id: true,
                        nomeEmpresa: true,
                        areaAtuacao: true,
                        descricao: true,
                        site: true,
                        logoUrl: true,
                    },
                },
                _count: { select: { applications: true } },
            },
        });

        if (!job) {
            throw new AppError('Vaga não encontrada.', 404);
        }

        return job;
    }

    /** Cria uma vaga (empresa) */
    async create(companyUserId: string, input: CreateJobInput) {
        const company = await prisma.companyProfile.findUnique({
            where: { userId: companyUserId },
        });

        if (!company) {
            throw new AppError('Perfil de empresa não encontrado.', 404);
        }

        const job = await prisma.job.create({
            data: {
                companyId: company.id,
                titulo: input.titulo,
                descricao: input.descricao,
                requisitos: input.requisitos,
                beneficios: input.beneficios,
                tipoContrato: input.tipoContrato as any,
                faixaSalarial: input.faixaSalarial,
                modeloTrabalho: input.modeloTrabalho as any,
                cidade: input.cidade,
                estado: input.estado,
                status: JobStatus.PENDENTE_APROVACAO,
            },
            include: {
                company: { select: { nomeEmpresa: true } },
            },
        });

        return job;
    }

    /** Edita uma vaga (somente se a empresa for dona) */
    async update(jobId: string, userId: string, input: Partial<CreateJobInput>) {
        const job = await this.findOwnedJob(jobId, userId);

        const updated = await prisma.job.update({
            where: { id: job.id },
            data: {
                titulo: input.titulo,
                descricao: input.descricao,
                requisitos: input.requisitos,
                beneficios: input.beneficios,
                tipoContrato: input.tipoContrato as any,
                faixaSalarial: input.faixaSalarial,
                modeloTrabalho: input.modeloTrabalho as any,
                cidade: input.cidade,
                estado: input.estado,
            },
        });

        return updated;
    }

    /** Atualiza status da vaga (pausar/ativar) */
    async updateStatus(jobId: string, userId: string, status: JobStatus) {
        const job = await this.findOwnedJob(jobId, userId);

        // Empresa só pode alternar entre ATIVA e INATIVA
        if (!([JobStatus.ATIVA, JobStatus.INATIVA] as string[]).includes(status)) {
            throw new AppError('Status inválido. Use ATIVA ou INATIVA.', 400);
        }

        const updated = await prisma.job.update({
            where: { id: job.id },
            data: { status },
        });

        return updated;
    }

    /** Exclui vaga (empresa dona ou admin) */
    async delete(jobId: string, userId: string) {
        const job = await this.findOwnedJob(jobId, userId);
        await prisma.job.delete({ where: { id: job.id } });
    }

    /** Lista vagas da empresa logada */
    async listByCompany(userId: string) {
        const company = await prisma.companyProfile.findUnique({
            where: { userId },
        });

        if (!company) {
            throw new AppError('Perfil de empresa não encontrado.', 404);
        }

        const jobs = await prisma.job.findMany({
            where: { companyId: company.id },
            include: {
                _count: { select: { applications: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return jobs;
    }

    /** Busca vaga verificando que pertence à empresa do userId */
    private async findOwnedJob(jobId: string, userId: string) {
        const company = await prisma.companyProfile.findUnique({
            where: { userId },
        });

        if (!company) {
            throw new AppError('Perfil de empresa não encontrado.', 404);
        }

        const job = await prisma.job.findUnique({ where: { id: jobId } });

        if (!job) {
            throw new AppError('Vaga não encontrada.', 404);
        }

        if (job.companyId !== company.id) {
            throw new AppError('Você não tem permissão para alterar esta vaga.', 403);
        }

        return job;
    }
}

export const jobsService = new JobsService();
