import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface DelayThresholds {
  id: number;
  lowDays: number;
  mediumDays: number;
  highDays: number;
  updatedAt: Date;
}

const DEFAULT_THRESHOLDS = { lowDays: 45, mediumDays: 30, highDays: 15 };

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDelayThresholds(): Promise<DelayThresholds> {
    const row = await this.prisma.client.delayThreshold.findUnique({
      where: { id: 1 },
    });
    if (row) return row;

    return this.prisma.client.delayThreshold.create({
      data: { id: 1, ...DEFAULT_THRESHOLDS },
    });
  }

  async updateDelayThresholds(dto: {
    lowDays: number;
    mediumDays: number;
    highDays: number;
  }): Promise<DelayThresholds> {
    return this.prisma.client.delayThreshold.upsert({
      where: { id: 1 },
      create: { id: 1, ...dto },
      update: dto,
    });
  }
}