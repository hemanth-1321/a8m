-- CreateEnum
CREATE TYPE "public"."NodeType" AS ENUM ('FORM', 'ACTION', 'TRIGGER');

-- AlterTable
ALTER TABLE "public"."Node" ADD COLUMN     "type" "public"."NodeType";
