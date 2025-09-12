/*
  Warnings:

  - You are about to drop the column `tigger` on the `Node` table. All the data in the column will be lost.
  - Added the required column `action` to the `Node` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trigger` to the `Node` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ActionType" AS ENUM ('Trigger', 'Action');

-- AlterTable
ALTER TABLE "public"."Node" DROP COLUMN "tigger",
ADD COLUMN     "action" "public"."ActionType" NOT NULL,
ADD COLUMN     "trigger" "public"."TriggerType" NOT NULL;
