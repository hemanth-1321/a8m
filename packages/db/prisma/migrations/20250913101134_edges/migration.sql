/*
  Warnings:

  - Added the required column `data` to the `Node` table without a default value. This is not possible if the table is not empty.
  - Added the required column `positionX` to the `Node` table without a default value. This is not possible if the table is not empty.
  - Added the required column `positionY` to the `Node` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Node" ADD COLUMN     "data" JSONB NOT NULL,
ADD COLUMN     "positionX" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "positionY" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "public"."Edge" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,

    CONSTRAINT "Edge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Edge" ADD CONSTRAINT "Edge_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
