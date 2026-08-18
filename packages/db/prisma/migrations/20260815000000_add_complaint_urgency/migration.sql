-- CreateTable
CREATE TABLE "ComplaintUrgency" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "assignmentId" TEXT,
    "outgoingLetterNumber" TEXT NOT NULL,
    "outgoingLetterDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplaintUrgency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComplaintUrgency_complaintId_idx" ON "ComplaintUrgency"("complaintId");

-- CreateIndex
CREATE INDEX "ComplaintUrgency_departmentId_idx" ON "ComplaintUrgency"("departmentId");

-- CreateIndex
CREATE INDEX "ComplaintUrgency_assignmentId_idx" ON "ComplaintUrgency"("assignmentId");

-- AddForeignKey
ALTER TABLE "ComplaintUrgency" ADD CONSTRAINT "ComplaintUrgency_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintUrgency" ADD CONSTRAINT "ComplaintUrgency_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintUrgency" ADD CONSTRAINT "ComplaintUrgency_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "ComplaintDepartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;