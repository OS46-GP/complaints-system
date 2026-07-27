import { Injectable, OnModuleInit } from '@nestjs/common';
import { prisma, Prisma } from '@complaints/db';

@Injectable()
export class PrismaService implements OnModuleInit {
  async onModuleInit() {
    await prisma.$connect();
  }

  get client() {
    return prisma;
  }

  get complaint() {
    return prisma.complaint;
  }

  get citizen() {
    return prisma.citizen;
  }

  get department() {
    return prisma.department;
  }

  get examinationStatus() {
    return prisma.examinationStatus;
  }

  get generatedReport() {
    return prisma.generatedReport;
  }

  get complaintFile() {
    return prisma.complaintFile;
  }

  get complaintType() {
    return prisma.complaintType;
  }

  get receptionMethod() {
    return prisma.receptionMethod;
  }

  get presentationStatus() {
    return prisma.presentationStatus;
  }

  get user() {
    return prisma.user;
  }

  get complaintYearCounter() {
    return prisma.complaintYearCounter;
  }
}

export { Prisma };
