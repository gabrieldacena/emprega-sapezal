-- AlterTable
ALTER TABLE "company_profiles" ADD COLUMN     "whatsapp" TEXT;

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "link_externo" TEXT,
ADD COLUMN     "whatsapp" TEXT;

-- AlterTable
ALTER TABLE "rentals" ADD COLUMN     "link_externo" TEXT,
ADD COLUMN     "whatsapp" TEXT;
