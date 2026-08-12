import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsInt, Min } from "class-validator";

export class DepartmentAssignmentDto {
  @IsString()
  @IsNotEmpty()
  departmentId!: string;

  @IsOptional()
  @IsString()
  outgoingLetterNumber?: string;

  @IsOptional()
  @IsDateString()
  outgoingLetterDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  responseDeadlineDays?: number;
}

export type DepartmentAssignmentData = DepartmentAssignmentDto;

export type AssignmentLetterData = {
  outgoingLetterNumber: string | null;
  outgoingLetterDate: Date | null;
  responseDeadlineDays: number | null;
};

export function toAssignmentLetterData(
  item: Pick<DepartmentAssignmentDto, "outgoingLetterNumber" | "outgoingLetterDate" | "responseDeadlineDays">,
): AssignmentLetterData {
  return {
    outgoingLetterNumber: item.outgoingLetterNumber ?? null,
    outgoingLetterDate: item.outgoingLetterDate ? new Date(item.outgoingLetterDate) : null,
    responseDeadlineDays: item.responseDeadlineDays ?? null,
  };
}

export function toDepartmentAssignmentPrisma(
  item: DepartmentAssignmentDto,
): Record<string, unknown> {
  return {
    departmentId: item.departmentId,
    ...toAssignmentLetterData(item),
  };
}