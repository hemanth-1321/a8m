-- CreateTable
CREATE TABLE "public"."_WorkflowCredentials" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WorkflowCredentials_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_WorkflowCredentials_B_index" ON "public"."_WorkflowCredentials"("B");

-- AddForeignKey
ALTER TABLE "public"."_WorkflowCredentials" ADD CONSTRAINT "_WorkflowCredentials_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Credentials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_WorkflowCredentials" ADD CONSTRAINT "_WorkflowCredentials_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
