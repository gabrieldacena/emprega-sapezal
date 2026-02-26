-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CANDIDATO', 'EMPRESA', 'ADMIN');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('CLT', 'PJ', 'ESTAGIO', 'TEMPORARIO', 'FREELANCER');

-- CreateEnum
CREATE TYPE "WorkModel" AS ENUM ('PRESENCIAL', 'HIBRIDO', 'REMOTO');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('ATIVA', 'INATIVA', 'PENDENTE_APROVACAO', 'REPROVADA', 'OCULTA');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('ENVIADO', 'EM_ANALISE', 'APROVADO', 'REPROVADO');

-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('ATIVO', 'INATIVO', 'PENDENTE_APROVACAO', 'REPROVADO', 'OCULTO');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('CASA', 'APARTAMENTO', 'SALA_COMERCIAL', 'KITNET', 'TERRENO', 'CHACARA', 'OUTRO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CANDIDATO',
    "cidade" TEXT,
    "estado" TEXT,
    "telefone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resumo_profissional" TEXT,
    "link_curriculo" TEXT,
    "link_linkedin" TEXT,
    "area_interesse" TEXT,
    "experiencia_anos" INTEGER,

    CONSTRAINT "candidate_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nome_empresa" TEXT NOT NULL,
    "cnpj" TEXT,
    "area_atuacao" TEXT,
    "descricao" TEXT,
    "site" TEXT,
    "logo_url" TEXT,

    CONSTRAINT "company_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "requisitos" TEXT,
    "beneficios" TEXT,
    "tipo_contrato" "ContractType" NOT NULL,
    "faixa_salarial" TEXT,
    "modelo_trabalho" "WorkModel" NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDENTE_APROVACAO',
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_applications" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'ENVIADO',
    "mensagem" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rentals" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo_imovel" "PropertyType" NOT NULL,
    "valor_aluguel" DOUBLE PRECISION NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" "RentalStatus" NOT NULL DEFAULT 'PENDENTE_APROVACAO',
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rentals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_images" (
    "id" TEXT NOT NULL,
    "rental_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "rental_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "rental_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "mensagem" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_profiles_user_id_key" ON "candidate_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_profiles_user_id_key" ON "company_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_job_id_candidate_id_key" ON "job_applications"("job_id", "candidate_id");

-- AddForeignKey
ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_images" ADD CONSTRAINT "rental_images_rental_id_fkey" FOREIGN KEY ("rental_id") REFERENCES "rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_rental_id_fkey" FOREIGN KEY ("rental_id") REFERENCES "rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
