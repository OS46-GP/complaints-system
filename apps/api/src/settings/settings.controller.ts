import { Controller, Get, Put, Body, UseGuards } from "@nestjs/common";
import { IsInt, Min, Max } from "class-validator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { SettingsService } from "./settings.service";

class UpdateDelayThresholdsDto {
  @IsInt()
  @Min(1)
  @Max(365)
  lowDays!: number;

  @IsInt()
  @Min(1)
  @Max(365)
  mediumDays!: number;

  @IsInt()
  @Min(1)
  @Max(365)
  highDays!: number;
}

@Controller("settings")
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get("delay-thresholds")
  getDelayThresholds() {
    return this.settingsService.getDelayThresholds();
  }

  @Put("delay-thresholds")
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  updateDelayThresholds(@Body() dto: UpdateDelayThresholdsDto) {
    return this.settingsService.updateDelayThresholds(dto);
  }
}