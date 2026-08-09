-- CreateTable
CREATE TABLE "DelayThreshold" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "lowDays" INTEGER NOT NULL DEFAULT 45,
    "mediumDays" INTEGER NOT NULL DEFAULT 30,
    "highDays" INTEGER NOT NULL DEFAULT 15,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DelayThreshold_pkey" PRIMARY KEY ("id")
);