import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { LettersService } from "./letters.service";
import { LetterTemplatesService } from "./letter-templates.service";
import { LetterSettingsService } from "./letter-settings.service";
import { LetterTemplatesController } from "./letter-templates.controller";
import { LetterSettingsController } from "./letter-settings.controller";
import { LettersController } from "./letters.controller";

@Module({
  imports: [PrismaModule],
  controllers: [
    LetterTemplatesController,
    LetterSettingsController,
    LettersController,
  ],
  providers: [
    LettersService,
    LetterTemplatesService,
    LetterSettingsService,
  ],
})
export class LettersModule {}