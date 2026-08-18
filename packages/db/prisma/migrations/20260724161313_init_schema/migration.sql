-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Official',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Citizen" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "nationalId" TEXT,
    "mobileNumber" TEXT,
    "address" TEXT,
    "village" TEXT,
    "district" TEXT,
    "locationCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Citizen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentCode" TEXT,
    "level" INTEGER,
    "levelDesc" TEXT,
    "p0" TEXT,
    "p1" TEXT,
    "p2" TEXT,
    "p3" TEXT,
    "p4" TEXT,
    "p5" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subAuthority" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceptionMethod" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ReceptionMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ComplaintType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExaminationStatus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ExaminationStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresentationStatus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PresentationStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "complaintNumber" TEXT NOT NULL,
    "statementYear" INTEGER NOT NULL,
    "arrivalDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NotFinished',
    "receptionMethodId" INTEGER,
    "complaintTypeId" INTEGER,
    "subject" TEXT NOT NULL,
    "respondentName" TEXT,
    "departmentId" TEXT,
    "presentationStatusId" INTEGER,
    "annotation" TEXT,
    "examinationStatusId" INTEGER,
    "examinationResult" TEXT,
    "authorityResponseText" TEXT,
    "authorityResponseDate" TIMESTAMP(3),
    "outgoingLetterNumber" TEXT,
    "outgoingLetterDate" TIMESTAMP(3),
    "incomingResponseNumber" TEXT,
    "notificationMethod" TEXT,
    "notificationOutNumber" TEXT,
    "notificationOutDate" TIMESTAMP(3),
    "archiveNumber" TEXT,
    "archiveDate" TIMESTAMP(3),
    "archiveLocation" TEXT,
    "weeklyMeeting" INTEGER,
    "finalDecisionDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "attachmentCount" INTEGER DEFAULT 0,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "citizenId" TEXT NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintAction" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actionDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintEscalation" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "urgencyNumber" TEXT,
    "urgencyDate" TIMESTAMP(3),
    "responseDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintEscalation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintFile" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Citizen_nationalId_idx" ON "Citizen"("nationalId");

-- CreateIndex
CREATE INDEX "Location_parentCode_idx" ON "Location"("parentCode");

-- CreateIndex
CREATE UNIQUE INDEX "ReceptionMethod_name_key" ON "ReceptionMethod"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ComplaintType_name_key" ON "ComplaintType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ExaminationStatus_name_key" ON "ExaminationStatus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PresentationStatus_name_key" ON "PresentationStatus"("name");

-- CreateIndex
CREATE INDEX "Complaint_citizenId_idx" ON "Complaint"("citizenId");

-- CreateIndex
CREATE INDEX "Complaint_departmentId_idx" ON "Complaint"("departmentId");

-- CreateIndex
CREATE INDEX "Complaint_status_idx" ON "Complaint"("status");

-- CreateIndex
CREATE INDEX "Complaint_statementYear_idx" ON "Complaint"("statementYear");

-- CreateIndex
CREATE INDEX "Complaint_createdAt_idx" ON "Complaint"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Complaint_complaintNumber_statementYear_key" ON "Complaint"("complaintNumber", "statementYear");

-- CreateIndex
CREATE INDEX "ComplaintAction_complaintId_idx" ON "ComplaintAction"("complaintId");

-- CreateIndex
CREATE INDEX "ComplaintEscalation_complaintId_idx" ON "ComplaintEscalation"("complaintId");

-- CreateIndex
CREATE INDEX "ComplaintFile_complaintId_idx" ON "ComplaintFile"("complaintId");

-- AddForeignKey
ALTER TABLE "Citizen" ADD CONSTRAINT "Citizen_locationCode_fkey" FOREIGN KEY ("locationCode") REFERENCES "Location"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_parentCode_fkey" FOREIGN KEY ("parentCode") REFERENCES "Location"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_receptionMethodId_fkey" FOREIGN KEY ("receptionMethodId") REFERENCES "ReceptionMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_complaintTypeId_fkey" FOREIGN KEY ("complaintTypeId") REFERENCES "ComplaintType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_presentationStatusId_fkey" FOREIGN KEY ("presentationStatusId") REFERENCES "PresentationStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_examinationStatusId_fkey" FOREIGN KEY ("examinationStatusId") REFERENCES "ExaminationStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "Citizen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintAction" ADD CONSTRAINT "ComplaintAction_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintEscalation" ADD CONSTRAINT "ComplaintEscalation_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintFile" ADD CONSTRAINT "ComplaintFile_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
