-- CreateEnum
CREATE TYPE "public"."TriggerType" AS ENUM ('WebHook', 'Manual', 'Cron');

-- CreateTable
CREATE TABLE "public"."Workflow" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "trigger" "public"."TriggerType" NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Node" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "tigger" "public"."TriggerType" NOT NULL,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Workflow" ADD CONSTRAINT "Workflow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Node" ADD CONSTRAINT "Node_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
