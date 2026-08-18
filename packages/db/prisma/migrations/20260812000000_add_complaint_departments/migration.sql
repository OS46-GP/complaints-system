-- CreateTable
CREATE TABLE "ComplaintDepartment" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComplaintDepartment_complaintId_departmentId_key" ON "ComplaintDepartment"("complaintId", "departmentId");

-- CreateIndex
CREATE INDEX "ComplaintDepartment_departmentId_idx" ON "ComplaintDepartment"("departmentId");

-- AddForeignKey
ALTER TABLE "ComplaintDepartment" ADD CONSTRAINT "ComplaintDepartment_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintDepartment" ADD CONSTRAINT "ComplaintDepartment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;