import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser, CurrentUserPayload } from "../auth/decorators/current-user.decorator";
import { LettersService } from "./letters.service";
import { GenerateLetterDto } from "./dto/generate-letter.dto";

@Controller("complaints")
@UseGuards(JwtAuthGuard)
export class LettersController {
  constructor(private readonly lettersService: LettersService) {}

  @Post(":id/letters")
  generate(
    @Param("id") id: string,
    @Body() dto: GenerateLetterDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.lettersService.generate(
      id,
      dto.templateId,
      user.id,
      dto.variableValues,
    );
  }

  @Get(":id/letters")
  list(@Param("id") id: string) {
    return this.lettersService.listGenerated(id);
  }
}