/*
  Warnings:

  - You are about to drop the column `action` on the `Node` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Node" DROP COLUMN "action";

-- DropEnum
DROP TYPE "public"."ActionType";
