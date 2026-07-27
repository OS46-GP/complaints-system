import { IsOptional, IsString, IsInt } from "class-validator";
import { Type } from "class-transformer";

export class SearchComplaintDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;
}
