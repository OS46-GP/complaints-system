import { IsString, IsIn } from "class-validator";

export class UpdateSeverityDto {
  @IsString()
  @IsIn(["Low", "Medium", "High"])
  severity!: "Low" | "Medium" | "High";
}
