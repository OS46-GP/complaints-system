import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReceptionMethodsService } from './reception-methods.service';
import { ReceptionMethodsController } from './reception-methods.controller';

@Module({
  imports: [PrismaModule],
  providers: [ReceptionMethodsService],
  controllers: [ReceptionMethodsController],
  exports: [ReceptionMethodsService],
})
export class ReceptionMethodsModule {}
