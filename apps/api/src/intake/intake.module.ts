import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { IntakeController } from "./intake.controller";
import { IntakeService } from "./intake.service";
import { OcrService } from "./ocr/ocr.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
    PrismaModule,
  ],
  controllers: [IntakeController],
  providers: [IntakeService, OcrService],
})
export class IntakeModule {}
