-- CreateEnum
CREATE TYPE "SocialDraftStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('Group', 'Page');

-- CreateTable
CREATE TABLE "MonitoredGroup" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "GroupType" NOT NULL DEFAULT 'Group',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonitoredGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialDraft" (
    "id" TEXT NOT NULL,
    "sourcePostId" TEXT NOT NULL,
    "sourceLink" TEXT NOT NULL,
    "postText" TEXT NOT NULL,
    "authorName" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SocialDraftStatus" NOT NULL DEFAULT 'Pending',
    "groupId" TEXT,
    "groupName" TEXT,
    "notes" TEXT,
    "complaintId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonitoredGroup_groupId_key" ON "MonitoredGroup"("groupId");

-- CreateIndex
CREATE INDEX "MonitoredGroup_isActive_idx" ON "MonitoredGroup"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SocialDraft_sourcePostId_key" ON "SocialDraft"("sourcePostId");

-- CreateIndex
CREATE INDEX "SocialDraft_status_idx" ON "SocialDraft"("status");

-- CreateIndex
CREATE INDEX "SocialDraft_detectedAt_idx" ON "SocialDraft"("detectedAt");

-- AddForeignKey
ALTER TABLE "SocialDraft" ADD CONSTRAINT "SocialDraft_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE SET NULL ON UPDATE CASCADE;
