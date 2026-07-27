import { IsString, IsIn } from "class-validator";

export class UpdateSeverityDto {
  @IsString()
  @IsIn(["LOW", "MEDIUM", "HIGH"])
  severity!: "LOW" | "MEDIUM" | "HIGH";
}
