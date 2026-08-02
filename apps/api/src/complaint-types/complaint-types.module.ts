import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ComplaintTypesService } from './complaint-types.service';
import { ComplaintTypesController } from './complaint-types.controller';

@Module({
  imports: [PrismaModule],
  providers: [ComplaintTypesService],
  controllers: [ComplaintTypesController],
  exports: [ComplaintTypesService],
})
export class ComplaintTypesModule {}
