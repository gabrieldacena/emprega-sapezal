// ============================================================
// Tipos TypeScript compartilhados pelo frontend
// ============================================================

export type UserRole = 'CANDIDATO' | 'EMPRESA' | 'ADMIN';
export type ContractType = 'CLT' | 'PJ' | 'ESTAGIO' | 'TEMPORARIO' | 'FREELANCER';
export type WorkModel = 'PRESENCIAL' | 'HIBRIDO' | 'REMOTO';
export type JobStatus = 'ATIVA' | 'INATIVA' | 'PENDENTE_APROVACAO' | 'REPROVADA' | 'OCULTA';
export type ApplicationStatus = 'ENVIADO' | 'EM_ANALISE' | 'APROVADO' | 'REPROVADO';
export type RentalStatus = 'ATIVO' | 'INATIVO' | 'PENDENTE_APROVACAO' | 'REPROVADO' | 'OCULTO';
export type PropertyType = 'CASA' | 'APARTAMENTO' | 'SALA_COMERCIAL' | 'KITNET' | 'TERRENO' | 'CHACARA' | 'OUTRO';

export interface User {
    id: string;
    nome: string;
    email: string;
    role: UserRole;
    cidade?: string;
    estado?: string;
    telefone?: string;
    ativo: boolean;
    createdAt: string;
    updatedAt: string;
    candidateProfile?: CandidateProfile;
    companyProfile?: CompanyProfile;
}

export interface CandidateProfile {
    id: string;
    userId: string;
    resumoProfissional?: string;
    linkCurriculo?: string;
    linkLinkedin?: string;
    areaInteresse?: string;
    experienciaAnos?: number;
}

export interface CompanyProfile {
    id: string;
    userId: string;
    nomeEmpresa: string;
    cnpj?: string;
    areaAtuacao?: string;
    descricao?: string;
    site?: string;
    whatsapp?: string;
    logoUrl?: string;
}

export interface Job {
    id: string;
    companyId: string;
    titulo: string;
    descricao: string;
    requisitos?: string;
    beneficios?: string;
    tipoContrato: ContractType;
    faixaSalarial?: string;
    modeloTrabalho: WorkModel;
    cidade: string;
    estado: string;
    whatsapp?: string;
    linkExterno?: string;
    status: JobStatus;
    destaque: boolean;
    createdAt: string;
    updatedAt: string;
    company?: { nomeEmpresa: string; logoUrl?: string; areaAtuacao?: string; descricao?: string; site?: string; whatsapp?: string; id?: string };
    _count?: { applications: number };
}

export interface JobApplication {
    id: string;
    jobId: string;
    candidateId: string;
    status: ApplicationStatus;
    mensagem?: string;
    createdAt: string;
    job?: {
        id: string;
        titulo: string;
        cidade: string;
        estado: string;
        tipoContrato: ContractType;
        faixaSalarial?: string;
        company?: { nomeEmpresa: string };
    };
    candidate?: {
        id: string;
        resumoProfissional?: string;
        linkCurriculo?: string;
        linkLinkedin?: string;
        user?: { nome: string; email: string; telefone?: string; cidade?: string };
    };
}

export interface Rental {
    id: string;
    companyId: string;
    titulo: string;
    tipoImovel: PropertyType;
    valorAluguel: number;
    cidade: string;
    estado: string;
    descricao: string;
    whatsapp?: string;
    linkExterno?: string;
    status: RentalStatus;
    destaque: boolean;
    createdAt: string;
    updatedAt: string;
    company?: { nomeEmpresa: string; logoUrl?: string; areaAtuacao?: string; descricao?: string; site?: string; whatsapp?: string; id?: string };
    imagens?: RentalImage[];
}

export interface RentalImage {
    id: string;
    url: string;
    ordem: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    code?: string;
    errors?: string[];
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface DashboardStats {
    totalUsers: number;
    totalCandidatos: number;
    totalEmpresas: number;
    vagasAtivas: number;
    vagasPendentes: number;
    vagasReprovadas: number;
    totalVagas: number;
    alugueisAtivos: number;
    alugueisPendentes: number;
    totalAlugueis: number;
    totalCandidaturas: number;
    candidaturasEmAnalise: number;
    totalMensagens: number;
    novosUsuarios7d: number;
}

export interface ContactMessage {
    id: string;
    rentalId: string;
    nome: string;
    email: string;
    telefone?: string;
    mensagem: string;
    createdAt: string;
    rental?: { id: string; titulo: string };
}

export interface RecentActivity {
    recentUsers: { id: string; nome: string; role: UserRole; createdAt: string }[];
    recentJobs: { id: string; titulo: string; status: JobStatus; createdAt: string; company?: { nomeEmpresa: string } }[];
    recentApplications: { id: string; status: ApplicationStatus; createdAt: string; candidate?: { user?: { nome: string } }; job?: { titulo: string } }[];
}

export type AdPosition = 'TOPO' | 'ENTRE_SECOES' | 'LATERAL' | 'RODAPE';

export interface Advertisement {
    id: string;
    titulo: string;
    imagemUrl: string;
    linkUrl?: string;
    posicao: AdPosition;
    ativo: boolean;
    ordem: number;
    createdAt: string;
}

export interface NewsArticle {
    id: string;
    titulo: string;
    conteudo: string;
    imagemUrl?: string;
    destaquePrincipal: boolean;
    ativo: boolean;
    createdAt: string;
    updatedAt: string;
}
