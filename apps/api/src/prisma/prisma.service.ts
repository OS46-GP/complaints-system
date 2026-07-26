import { Injectable, OnModuleInit } from '@nestjs/common';
import { prisma } from '@complaints/db';

@Injectable()
export class PrismaService implements OnModuleInit {
  // Expose the prisma client instance directly
  public readonly client = prisma;

  async onModuleInit() {
    await this.client.$connect();
  }
}
