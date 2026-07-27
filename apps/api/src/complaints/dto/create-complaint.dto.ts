import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsDateString, IsOptional, ValidateNested, IsInt, Min } from "class-validator";
import { CreateCitizenDto } from "./create-citizen.dto";

export class CreateComplaintDto {
  @IsInt()
  @Min(2000)
  statementYear!: number;

  @IsDateString()
  arrivalDate!: string;

  @IsOptional()
  @IsInt()
  receptionMethodId?: number;

  @IsOptional()
  @IsInt()
  complaintTypeId?: number;

  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsOptional()
  @IsString()
  respondentName?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsInt()
  presentationStatusId?: number;

  @IsOptional()
  @IsString()
  annotation?: string;

  @IsOptional()
  @IsInt()
  examinationStatusId?: number;

  @IsOptional()
  @IsString()
  examinationResult?: string;

  @IsOptional()
  @IsString()
  authorityResponseText?: string;

  @IsOptional()
  @IsDateString()
  authorityResponseDate?: string;

  @IsOptional()
  @IsString()
  outgoingLetterNumber?: string;

  @IsOptional()
  @IsDateString()
  outgoingLetterDate?: string;

  @IsOptional()
  @IsString()
  incomingResponseNumber?: string;

  @IsOptional()
  @IsString()
  notificationMethod?: string;

  @IsOptional()
  @IsString()
  notificationOutNumber?: string;

  @IsOptional()
  @IsDateString()
  notificationOutDate?: string;

  @IsOptional()
  @IsString()
  archiveNumber?: string;

  @IsOptional()
  @IsDateString()
  archiveDate?: string;

  @IsOptional()
  @IsString()
  archiveLocation?: string;

  @IsOptional()
  @IsInt()
  weeklyMeeting?: number;

  @IsOptional()
  @IsDateString()
  finalDecisionDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  attachmentCount?: number;

  @ValidateNested()
  @Type(() => CreateCitizenDto)
  citizen!: CreateCitizenDto;
}
