-- CreateTable
CREATE TABLE "ComplaintLink" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComplaintLink_sourceId_targetId_key" ON "ComplaintLink"("sourceId", "targetId");

-- CreateIndex
CREATE INDEX "ComplaintLink_sourceId_idx" ON "ComplaintLink"("sourceId");

-- CreateIndex
CREATE INDEX "ComplaintLink_targetId_idx" ON "ComplaintLink"("targetId");

-- AddForeignKey
ALTER TABLE "ComplaintLink" ADD CONSTRAINT "ComplaintLink_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintLink" ADD CONSTRAINT "ComplaintLink_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
