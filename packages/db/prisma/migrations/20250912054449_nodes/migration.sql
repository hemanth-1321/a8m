-- AlterTable
ALTER TABLE "public"."Node" ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Workflow" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
