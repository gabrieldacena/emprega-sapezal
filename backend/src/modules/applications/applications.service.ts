// ============================================================
// Applications Service — Candidaturas a vagas
// ============================================================

import { ApplicationStatus, JobStatus } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../utils/response';

export class ApplicationsService {
    /** Candidatar-se a uma vaga */
    async apply(userId: string, jobId: string, mensagem?: string) {
        // Verifica se o candidato tem perfil
        const candidate = await prisma.candidateProfile.findUnique({
            where: { userId },
        });
        if (!candidate) {
            throw new AppError('Perfil de candidato não encontrado.', 404);
        }

        // Verifica se a vaga existe e está ativa
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) {
            throw new AppError('Vaga não encontrada.', 404);
        }
        if (job.status !== JobStatus.ATIVA) {
            throw new AppError('Esta vaga não está disponível para candidatura.', 400);
        }

        // Verifica duplicata
        const existing = await prisma.jobApplication.findUnique({
            where: { jobId_candidateId: { jobId, candidateId: candidate.id } },
        });
        if (existing) {
            throw new AppError('Você já se candidatou a esta vaga.', 409);
        }

        return prisma.jobApplication.create({
            data: {
                jobId,
                candidateId: candidate.id,
                mensagem,
                status: ApplicationStatus.ENVIADO,
            },
            include: {
                job: { select: { titulo: true, cidade: true, estado: true } },
            },
        });
    }

    /** Lista candidaturas do candidato logado */
    async listByCandidate(userId: string) {
        const candidate = await prisma.candidateProfile.findUnique({
            where: { userId },
        });
        if (!candidate) {
            throw new AppError('Perfil de candidato não encontrado.', 404);
        }

        return prisma.jobApplication.findMany({
            where: { candidateId: candidate.id },
            include: {
                job: {
                    select: {
                        id: true,
                        titulo: true,
                        cidade: true,
                        estado: true,
                        tipoContrato: true,
                        faixaSalarial: true,
                        company: { select: { nomeEmpresa: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /** Lista candidaturas recebidas para uma vaga (empresa) */
    async listByJob(jobId: string, userId: string) {
        // Verifica que a vaga pertence à empresa
        const company = await prisma.companyProfile.findUnique({ where: { userId } });
        if (!company) throw new AppError('Perfil de empresa não encontrado.', 404);

        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) throw new AppError('Vaga não encontrada.', 404);
        if (job.companyId !== company.id) throw new AppError('Sem permissão.', 403);

        return prisma.jobApplication.findMany({
            where: { jobId },
            include: {
                candidate: {
                    select: {
                        id: true,
                        resumoProfissional: true,
                        linkCurriculo: true,
                        linkLinkedin: true,
                        user: {
                            select: {
                                nome: true,
                                email: true,
                                telefone: true,
                                cidade: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /** Atualiza status de uma candidatura (empresa) */
    async updateStatus(applicationId: string, userId: string, status: ApplicationStatus) {
        const application = await prisma.jobApplication.findUnique({
            where: { id: applicationId },
            include: { job: true },
        });

        if (!application) {
            throw new AppError('Candidatura não encontrada.', 404);
        }

        // Verifica que a vaga pertence à empresa
        const company = await prisma.companyProfile.findUnique({ where: { userId } });
        if (!company || application.job.companyId !== company.id) {
            throw new AppError('Sem permissão para alterar esta candidatura.', 403);
        }

        return prisma.jobApplication.update({
            where: { id: applicationId },
            data: { status },
        });
    }
}

export const applicationsService = new ApplicationsService();
