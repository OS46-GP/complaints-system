import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ComplaintsController } from "./complaints.controller";
import { ComplaintsService } from "./complaints.service";
import { ComplaintFilesService } from "./complaint-files.service";

@Module({
  imports: [PrismaModule],
  controllers: [ComplaintsController],
  providers: [ComplaintsService, ComplaintFilesService],
})
export class ComplaintsModule {}
