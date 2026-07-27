import { Module } from "@nestjs/common";
import { ComplaintsController } from "./complaints.controller";
import { ComplaintsService } from "./complaints.service";
import { ComplaintFilesService } from "./complaint-files.service";

@Module({
  controllers: [ComplaintsController],
  providers: [ComplaintsService, ComplaintFilesService],
})
export class ComplaintsModule {}
