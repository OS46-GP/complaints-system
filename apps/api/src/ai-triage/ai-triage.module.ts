import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AiTriageController } from './ai-triage.controller';
import { AiTriageService } from './ai-triage.service';
import { EmbeddingService } from './embedding.service';

@Module({
  imports: [PrismaModule],
  controllers: [AiTriageController],
  providers: [AiTriageService, EmbeddingService],
  exports: [EmbeddingService],
})
export class AiTriageModule {}
