// ============================================================
// Rentals Service — CRUD de anúncios de aluguel
// ============================================================

import { RentalStatus, Prisma } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../utils/response';

interface CreateRentalInput {
    titulo: string;
    tipoImovel: string;
    valorAluguel: number;
    cidade: string;
    estado: string;
    descricao: string;
    imagens?: string[]; // URLs de imagens
}

interface RentalFilters {
    cidade?: string;
    estado?: string;
    tipoImovel?: string;
    valorMin?: string;
    valorMax?: string;
    busca?: string;
    page?: string;
    limit?: string;
}

export class RentalsService {
    /** Lista anúncios ativos com filtros e paginação */
    async listPublic(filters: RentalFilters) {
        const page = parseInt(filters.page || '1');
        const limit = Math.min(parseInt(filters.limit || '12'), 50);
        const skip = (page - 1) * limit;

        const where: Prisma.RentalWhereInput = {
            status: RentalStatus.ATIVO,
        };

        if (filters.cidade) {
            where.cidade = { contains: filters.cidade, mode: 'insensitive' };
        }
        if (filters.estado) {
            where.estado = { equals: filters.estado, mode: 'insensitive' };
        }
        if (filters.tipoImovel) {
            where.tipoImovel = filters.tipoImovel as any;
        }
        if (filters.valorMin || filters.valorMax) {
            where.valorAluguel = {};
            if (filters.valorMin) (where.valorAluguel as any).gte = parseFloat(filters.valorMin);
            if (filters.valorMax) (where.valorAluguel as any).lte = parseFloat(filters.valorMax);
        }
        if (filters.busca) {
            where.OR = [
                { titulo: { contains: filters.busca, mode: 'insensitive' } },
                { descricao: { contains: filters.busca, mode: 'insensitive' } },
            ];
        }

        const [rentals, total] = await Promise.all([
            prisma.rental.findMany({
                where,
                include: {
                    company: { select: { nomeEmpresa: true, logoUrl: true } },
                    imagens: { orderBy: { ordem: 'asc' }, take: 1 },
                },
                orderBy: [{ destaque: 'desc' }, { createdAt: 'desc' }],
                skip,
                take: limit,
            }),
            prisma.rental.count({ where }),
        ]);

        return { rentals, total, page, limit };
    }

    /** Detalhe de um anúncio */
    async getById(id: string) {
        const rental = await prisma.rental.findUnique({
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
                imagens: { orderBy: { ordem: 'asc' } },
            },
        });

        if (!rental) {
            throw new AppError('Anúncio não encontrado.', 404);
        }

        return rental;
    }

    /** Cria anúncio (empresa) */
    async create(userId: string, input: CreateRentalInput) {
        const company = await prisma.companyProfile.findUnique({
            where: { userId },
        });

        if (!company) {
            throw new AppError('Perfil de empresa não encontrado.', 404);
        }

        const rental = await prisma.rental.create({
            data: {
                companyId: company.id,
                titulo: input.titulo,
                tipoImovel: input.tipoImovel as any,
                valorAluguel: input.valorAluguel,
                cidade: input.cidade,
                estado: input.estado,
                descricao: input.descricao,
                status: RentalStatus.PENDENTE_APROVACAO,
                imagens: input.imagens?.length
                    ? {
                        create: input.imagens.map((url, index) => ({
                            url,
                            ordem: index,
                        })),
                    }
                    : undefined,
            },
            include: {
                company: { select: { nomeEmpresa: true } },
                imagens: true,
            },
        });

        return rental;
    }

    /** Edita anúncio */
    async update(rentalId: string, userId: string, input: Partial<CreateRentalInput>) {
        const rental = await this.findOwnedRental(rentalId, userId);

        const updated = await prisma.rental.update({
            where: { id: rental.id },
            data: {
                titulo: input.titulo,
                tipoImovel: input.tipoImovel as any,
                valorAluguel: input.valorAluguel,
                cidade: input.cidade,
                estado: input.estado,
                descricao: input.descricao,
            },
            include: { imagens: true },
        });

        // Atualiza imagens se fornecidas
        if (input.imagens) {
            await prisma.rentalImage.deleteMany({ where: { rentalId: rental.id } });
            if (input.imagens.length > 0) {
                await prisma.rentalImage.createMany({
                    data: input.imagens.map((url, index) => ({
                        rentalId: rental.id,
                        url,
                        ordem: index,
                    })),
                });
            }
        }

        return updated;
    }

    /** Atualiza status (pausar/ativar) */
    async updateStatus(rentalId: string, userId: string, status: RentalStatus) {
        const rental = await this.findOwnedRental(rentalId, userId);

        if (!([RentalStatus.ATIVO, RentalStatus.INATIVO] as string[]).includes(status)) {
            throw new AppError('Status inválido. Use ATIVO ou INATIVO.', 400);
        }

        return prisma.rental.update({
            where: { id: rental.id },
            data: { status },
        });
    }

    /** Exclui anúncio */
    async delete(rentalId: string, userId: string) {
        const rental = await this.findOwnedRental(rentalId, userId);
        await prisma.rental.delete({ where: { id: rental.id } });
    }

    /** Lista anúncios da empresa logada */
    async listByCompany(userId: string) {
        const company = await prisma.companyProfile.findUnique({
            where: { userId },
        });

        if (!company) {
            throw new AppError('Perfil de empresa não encontrado.', 404);
        }

        return prisma.rental.findMany({
            where: { companyId: company.id },
            include: {
                imagens: { orderBy: { ordem: 'asc' }, take: 1 },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /** Enviar mensagem de contato ao anunciante */
    async sendContactMessage(rentalId: string, data: { nome: string; email: string; telefone?: string; mensagem: string }) {
        const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
        if (!rental) {
            throw new AppError('Anúncio não encontrado.', 404);
        }

        return prisma.contactMessage.create({
            data: {
                rentalId,
                nome: data.nome,
                email: data.email,
                telefone: data.telefone,
                mensagem: data.mensagem,
            },
        });
    }

    private async findOwnedRental(rentalId: string, userId: string) {
        const company = await prisma.companyProfile.findUnique({ where: { userId } });
        if (!company) throw new AppError('Perfil de empresa não encontrado.', 404);

        const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
        if (!rental) throw new AppError('Anúncio não encontrado.', 404);
        if (rental.companyId !== company.id) throw new AppError('Sem permissão.', 403);

        return rental;
    }
}

export const rentalsService = new RentalsService();
