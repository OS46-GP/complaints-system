import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService, Prisma } from "../prisma/prisma.service";
import { EmbeddingService, buildEmbeddingText } from "../ai-triage/embedding.service";
import { CreateComplaintDto } from "./dto/create-complaint.dto";
import { UpdateComplaintDto } from "./dto/update-complaint.dto";
import { ReassignComplaintDto } from "./dto/reassign-complaint.dto";
import { CreateDepartmentResponseDto } from "./dto/create-department-response.dto";
import { CreateUrgencyDto } from "./dto/create-urgency.dto";
import { QueryComplaintsDto } from "./dto/query-complaints.dto";
import { computeCaseStatus } from "./case-status.config";
import {
  DepartmentAssignmentDto,
  toAssignmentLetterData,
  toDepartmentAssignmentPrisma,
} from "./dto/department-assignment.dto";

type DepartmentAssignmentInput = {
  departmentId: string;
  outgoingLetterNumber?: string | null;
  outgoingLetterDate?: string | null;
  responseDeadlineDays?: number | null;
};

export type AssignmentStatus =
  | "RESPONDED"
  | "ACTIVE"
  | "OVERDUE"
  | "ENDED_WITHOUT_RESPONSE"
  | "ENDED_WITH_RESPONSE";

type AssignmentStatusInput = {
  endedAt: Date | null;
  responseText: string | null;
  respondedAt: Date | null;
  outgoingLetterDate: Date | null;
  responseDeadlineDays: number | null;
};

export function computeAssignmentStatus(
  row: AssignmentStatusInput,
  now = new Date(),
): AssignmentStatus {
  const hasResponse = !!row.responseText || !!row.respondedAt;
  if (row.endedAt) {
    return hasResponse ? "ENDED_WITH_RESPONSE" : "ENDED_WITHOUT_RESPONSE";
  }
  if (hasResponse) return "RESPONDED";
  if (row.outgoingLetterDate && row.responseDeadlineDays) {
    const due = new Date(row.outgoingLetterDate);
    due.setDate(due.getDate() + row.responseDeadlineDays);
    if (due.getTime() < now.getTime()) return "OVERDUE";
  }
  return "ACTIVE";
}

const DATE_FIELDS = [
  "arrivalDate",
  "authorityResponseDate",
  "outgoingLetterDate",
  "notificationOutDate",
  "archiveDate",
  "finalDecisionDate",
  "endDate",
] as const;

const relationMap: Record<string, string> = {
  receptionMethodId: "receptionMethod",
  complaintTypeId: "complaintType",
  departmentId: "department",
  presentationStatusId: "presentationStatus",
  examinationStatusId: "examinationStatus",
};

const complaintInclude = {
  citizen: true,
  department: true,
  departments: {
    include: { department: true },
    orderBy: [{ assignmentIndex: "asc" }, { createdAt: "asc" }],
  },
  urgencies: {
    include: { department: true },
    orderBy: { createdAt: "asc" },
  },
  receptionMethod: true,
  complaintType: true,
  examinationStatus: true,
  presentationStatus: true,
  createdBy: {
    select: { id: true, username: true, role: true },
  },
  files: true,
} satisfies Prisma.ComplaintInclude;

function parseDates(input: Record<string, unknown>): void {
  for (const field of DATE_FIELDS) {
    const value = input[field];
    if (typeof value === "string") {
      input[field] = new Date(value);
    }
  }
}

function toRelationData(
  input: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === "") continue;
    const rel = relationMap[key];
    if (rel) {
      out[rel] = { connect: { id: value } };
    } else {
      out[key] = value;
    }
  }
  return out;
}

@Injectable()
export class ComplaintsService {
  private readonly logger = new Logger(ComplaintsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async create(dto: CreateComplaintDto, user?: { id: string; role: string }) {
    const { citizen, departmentIds, departments, ...complaintData } = dto;

    const uniqueDepartmentIds = [
      ...new Set((departmentIds ?? []).filter((id) => id?.trim())),
    ];

    const assignments: DepartmentAssignmentInput[] =
      departments && departments.length > 0
        ? departments
        : uniqueDepartmentIds.map((departmentId) => ({ departmentId }));

    const data: Record<string, unknown> = toRelationData(complaintData);
    if (assignments.length > 0) {
      data.department = { connect: { id: assignments[0].departmentId } };
      data.departments = {
        create: assignments.map((assignment) =>
          toDepartmentAssignmentPrisma(assignment as DepartmentAssignmentDto),
        ),
      };
    }
    parseDates(data);
    if (user) {
      data.createdBy = { connect: { id: user.id } };
    }

    const complaint = await this.prisma.client.$transaction(async (tx) => {
      const txPrisma = tx as typeof this.prisma.client;

      if (citizen.nationalId?.trim()) {
        const existing = await (txPrisma as any).citizen.findUnique({
          where: { nationalId: citizen.nationalId },
        });
        if (existing) {
          data.citizen = { connect: { id: existing.id } };
          await (txPrisma as any).citizen.update({
            where: { id: existing.id },
            data: citizen,
          });
        } else {
          data.citizen = { create: citizen };
        }
      } else {
        data.citizen = { create: citizen };
      }

      const counter = await (txPrisma as any).complaintYearCounter.upsert({
        where: { year: complaintData.statementYear },
        create: { year: complaintData.statementYear, currentNumber: 1 },
        update: { currentNumber: { increment: 1 } },
      });
      data.complaintNumber = counter.currentNumber;

      return (txPrisma as any).complaint.create({
        data: data,
        include: complaintInclude,
      });
    });

    const result = this.addCaseStatus(complaint);

    this.indexComplaint(complaint);

    return result;
  }

  async indexComplaint(complaint: {
    id: string;
    subject: string;
    annotation?: string | null;
    departmentId: string | null;
    citizen: { village: string | null; district: string | null };
  }): Promise<void> {
    try {
      const location = complaint.citizen?.village || complaint.citizen?.district || null;
      await this.embeddingService.ensureEmbedding(
        complaint.id,
        buildEmbeddingText(complaint.subject, complaint.annotation),
        complaint.departmentId,
        location,
      );
      this.logger.log(`Indexed embedding for complaint ${complaint.id}`);
    } catch (error) {
      this.logger.error(`Failed to index embedding for complaint ${complaint.id}: ${error instanceof Error ? error.message : error}`);
    }
  }

  async findAll(query: QueryComplaintsDto) {
    const {
      page = 1,
      limit = 20,
      departmentId,
      name,
      complaintNumber,
      statementYear,
      severity,
      complaintTypeId,
      examinationStatusId,
      receptionMethodId,
      presentationStatusId,
      sortBy,
      sortOrder = "desc",
      citizenNationalId,
      citizenFullName,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ComplaintWhereInput = {};

    if (departmentId) {
      where.departments = { some: { departmentId } };
    }

    if (citizenNationalId) {
      where.citizen = {
        ...(where.citizen as object | undefined),
        nationalId: citizenNationalId,
      };
    }

    if (citizenFullName?.trim()) {
      where.citizen = {
        ...(where.citizen as object | undefined),
        fullName: {
          equals: citizenFullName.trim(),
          mode: "insensitive",
        },
      };
    }

    if (name) {
      const trimmed = name.trim();
      const numeric = /^\d+$/.test(trimmed) ? parseInt(trimmed, 10) : null;
      where.OR = [
        { citizen: { fullName: { contains: trimmed, mode: "insensitive" } } },
        { subject: { contains: trimmed, mode: "insensitive" } },
        ...(numeric !== null && !Number.isNaN(numeric)
          ? [{ complaintNumber: numeric }]
          : []),
      ];
    }

    if (complaintNumber) {
      where.complaintNumber = complaintNumber;
    }

    if (statementYear) {
      where.statementYear = statementYear;
    }

    if (severity) {
      where.severity = severity;
    }

    if (complaintTypeId) {
      where.complaintTypeId = complaintTypeId;
    }

    if (examinationStatusId) {
      where.examinationStatusId = examinationStatusId;
    }

    if (receptionMethodId) {
      where.receptionMethodId = receptionMethodId;
    }

    if (presentationStatusId) {
      where.presentationStatusId = presentationStatusId;
    }

    const validSortFields = [
      "complaintNumber",
      "createdAt",
      "severity",
      "subject",
      "arrivalDate",
      "statementYear",
    ];
    const orderBy =
      sortBy === "complaintNumber"
        ? [
            { statementYear: sortOrder as Prisma.SortOrder },
            { complaintNumber: sortOrder as Prisma.SortOrder },
          ]
        : sortBy && validSortFields.includes(sortBy)
          ? { [sortBy]: sortOrder }
          : { createdAt: "desc" as const };

    const [items, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        include: complaintInclude,
        orderBy,
      }),
      this.prisma.complaint.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: items.map((item) => this.addCaseStatus(item)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: complaintInclude,
    });

    if (!complaint) {
      throw new NotFoundException("Complaint not found");
    }

    return this.addCaseStatus(complaint);
  }

  async findCitizenByNationalId(nationalId: string) {
    const trimmed = nationalId?.trim();
    if (!trimmed) return null;
    return this.prisma.citizen.findUnique({
      where: { nationalId: trimmed },
    });
  }

  async findCitizensByName(name: string) {
    const trimmed = name?.trim();
    if (!trimmed) return [];
    return this.prisma.citizen.findMany({
      where: {
        fullName: { equals: trimmed, mode: "insensitive" },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, dto: UpdateComplaintDto) {
    const current = await this.findById(id);

    const { citizen, departmentIds, departments, ...complaintData } = dto;

    const data: Record<string, unknown> = toRelationData(complaintData);
    parseDates(data);

    const assignments: DepartmentAssignmentInput[] | null =
      departments && departments.length > 0
        ? departments
        : departmentIds
          ? [
              ...new Set(departmentIds.filter((departmentId) => departmentId?.trim())),
            ].map((departmentId) => ({ departmentId }))
          : null;

    const uniqueDepartmentIds = assignments
      ? [...new Set(assignments.map((assignment) => assignment.departmentId))]
      : null;

    const currentCitizenId = (current as Record<string, unknown>).citizenId as string | undefined;

    if (citizen) {
      if (citizen.nationalId?.trim()) {
        const existing = await (this.prisma.client as any).citizen.findUnique({
          where: { nationalId: citizen.nationalId },
          select: { id: true },
        }) as { id: string } | null;
        if (existing && existing.id !== currentCitizenId) {
          data.citizen = { connect: { id: existing.id } };
          await (this.prisma.client as any).citizen.update({
            where: { id: existing.id },
            data: citizen,
          });
        } else {
          data.citizen = { update: citizen };
        }
      } else {
        data.citizen = { update: citizen };
      }
    }

    const complaint = await this.prisma.client.$transaction(async (tx) => {
      const txPrisma = tx as typeof this.prisma.client;

      if (uniqueDepartmentIds && assignments) {
        const byDepartmentId = new Map(
          assignments.map((assignment) => [assignment.departmentId, assignment]),
        );

        const existingRows = (await (txPrisma as any).complaintDepartment.findMany({
          where: { complaintId: id },
          orderBy: [{ assignmentIndex: "asc" }, { createdAt: "asc" }],
        })) as Array<{
          id: string;
          departmentId: string;
          assignmentIndex: number;
          endedAt: Date | null;
        }>;

        const openByDepartment = new Map<string, (typeof existingRows)[number]>();
        for (const row of existingRows) {
          if (row.endedAt === null) {
            const current = openByDepartment.get(row.departmentId);
            if (!current || row.assignmentIndex > current.assignmentIndex) {
              openByDepartment.set(row.departmentId, row);
            }
          }
        }

        for (const departmentId of uniqueDepartmentIds) {
          const assignment = byDepartmentId.get(departmentId) ?? { departmentId };
          const openRow = openByDepartment.get(departmentId);
          if (openRow) {
            await (txPrisma as any).complaintDepartment.update({
              where: { id: openRow.id },
              data: toAssignmentLetterData(assignment as DepartmentAssignmentDto),
            });
          } else {
            const fromDepartment = existingRows.filter(
              (row) => row.departmentId === departmentId,
            );
            const nextIndex =
              fromDepartment.reduce(
                (max, row) => Math.max(max, row.assignmentIndex),
                0,
              ) + 1;
            await (txPrisma as any).complaintDepartment.create({
              data: {
                complaintId: id,
                departmentId,
                assignmentIndex: nextIndex,
                ...toAssignmentLetterData(assignment as DepartmentAssignmentDto),
              },
            });
          }
        }

        for (const row of existingRows) {
          if (row.endedAt === null && !uniqueDepartmentIds.includes(row.departmentId)) {
            await (txPrisma as any).complaintDepartment.update({
              where: { id: row.id },
              data: { endedAt: new Date() },
            });
          }
        }

        delete data.department;
        data.department = uniqueDepartmentIds[0]
          ? { connect: { id: uniqueDepartmentIds[0] } }
          : { disconnect: true };
      }

      return txPrisma.complaint.update({
        where: { id },
        data: data as Prisma.ComplaintUpdateInput,
        include: complaintInclude,
      });
    });

    return this.addCaseStatus(complaint);
  }

  async addDepartmentResponse(
    complaintId: string,
    departmentId: string,
    dto: CreateDepartmentResponseDto,
  ) {
    await this.findById(complaintId);

    const target = await this.prisma.client.complaintDepartment.findFirst({
      where: { complaintId, departmentId },
      orderBy: [{ assignmentIndex: "desc" }, { createdAt: "desc" }],
    });

    if (!target) {
      throw new BadRequestException("Department is not linked to this complaint");
    }

    const data: Prisma.ComplaintDepartmentUpdateInput = {
      responseText: dto.responseText,
      responseDate: new Date(dto.responseDate),
      responseNumber: dto.responseNumber,
      importDate: dto.importDate ? new Date(dto.importDate) : new Date(dto.responseDate),
      examinationResult: dto.examinationResult ?? undefined,
      respondedAt: new Date(),
      ...(dto.examinationStatusId !== undefined
        ? { examinationStatus: { connect: { id: dto.examinationStatusId } } }
        : {}),
    };

    await this.prisma.client.complaintDepartment.update({
      where: { id: target.id },
      data,
    });

    const result = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
      include: complaintInclude,
    });

    return this.addCaseStatus(result!);
  }

  async reassignDepartment(complaintId: string, dto: ReassignComplaintDto) {
    await this.findById(complaintId);

    const { departmentId } = dto;

    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
      select: { id: true },
    });

    if (!department) {
      throw new BadRequestException("Department not found");
    }

    await this.prisma.client.$transaction(async (tx) => {
      const txPrisma = tx as typeof this.prisma.client;

      const openAssignment = await (txPrisma as any).complaintDepartment.findFirst({
        where: { complaintId, departmentId, endedAt: null },
        orderBy: [{ assignmentIndex: "desc" }, { createdAt: "desc" }],
        select: { id: true },
      });

      if (openAssignment) {
        await (txPrisma as any).complaintDepartment.update({
          where: { id: openAssignment.id },
          data: { endedAt: new Date() },
        });
      }

      const max = await (txPrisma as any).complaintDepartment.aggregate({
        _max: { assignmentIndex: true },
        where: { complaintId, departmentId },
      });
      const nextIndex =
        ((max as { _max: { assignmentIndex: number | null } })._max.assignmentIndex ?? 0) + 1;

      await (txPrisma as any).complaintDepartment.create({
        data: {
          complaintId,
          departmentId,
          assignmentIndex: nextIndex,
          ...toAssignmentLetterData(dto as DepartmentAssignmentDto),
        },
      });
    });

    const result = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
      include: complaintInclude,
    });

    return this.addCaseStatus(result!);
  }

  async sendUrgency(complaintId: string, dto: CreateUrgencyDto) {
    await this.findById(complaintId);

    const { departmentId } = dto;

    const target = await this.prisma.client.complaintDepartment.findFirst({
      where: { complaintId, departmentId },
      orderBy: [{ assignmentIndex: "desc" }, { createdAt: "desc" }],
      select: { id: true, endedAt: true, responseText: true, respondedAt: true, outgoingLetterDate: true, responseDeadlineDays: true },
    });

    if (!target) {
      throw new BadRequestException("Department is not linked to this complaint");
    }

    const status = computeAssignmentStatus(target);
    if (status !== "ACTIVE") {
      throw new BadRequestException(
        "Cannot send an urgency request: the assignment reached its deadline or is no longer active",
      );
    }

    await this.prisma.client.complaintUrgency.create({
      data: {
        complaintId,
        departmentId,
        assignmentId: target.id,
        outgoingLetterNumber: dto.outgoingLetterNumber,
        outgoingLetterDate: new Date(dto.outgoingLetterDate),
      },
    });

    const result = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
      include: complaintInclude,
    });

    return this.addCaseStatus(result!);
  }

  async getDepartments() {
    return this.prisma.department.findMany({
      orderBy: { name: "asc" },
    });
  }

  async getExaminationStatuses() {
    return this.prisma.examinationStatus.findMany({
      orderBy: { id: "asc" },
    });
  }

  async getReceptionMethods() {
    return this.prisma.receptionMethod.findMany({
      orderBy: { id: "asc" },
    });
  }

  async getComplaintTypes() {
    return this.prisma.complaintType.findMany({
      orderBy: { id: "asc" },
    });
  }

  async getPresentationStatuses() {
    return this.prisma.presentationStatus.findMany({
      orderBy: { id: "asc" },
    });
  }

  async getLocations() {
    const all = await this.prisma.location.findMany({
      orderBy: [{ level: "asc" }, { name: "asc" }],
    });

    const childrenOf = new Map<string, typeof all>();
    for (const location of all) {
      if (location.parentCode) {
        const list = childrenOf.get(location.parentCode) ?? [];
        list.push(location);
        childrenOf.set(location.parentCode, list);
      }
    }

    const governorate = all
      .filter((location) => location.level === 1)
      .sort(
        (a, b) =>
          (childrenOf.get(b.code) ?? []).filter((c) => c.level === 2).length -
          (childrenOf.get(a.code) ?? []).filter((c) => c.level === 2).length,
      )[0];

    if (!governorate) return [];

    const result: typeof all = [];
    const visit = (location: (typeof all)[number]) => {
      result.push(location);
      for (const child of childrenOf.get(location.code) ?? []) {
        visit(child);
      }
    };
    visit(governorate);

    return result;
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.complaint.delete({ where: { id } });
    return { success: true };
  }

  private addCaseStatus(complaint: Record<string, unknown>) {
    const departments = Array.isArray(complaint.departments)
      ? complaint.departments
      : [];
    const examinationStatus = (complaint as { examinationStatus?: { name?: string } | null })
      .examinationStatus;
    return {
      ...complaint,
      departments: departments.map((row) => ({
        ...(row as Record<string, unknown>),
        assignmentStatus: computeAssignmentStatus(row as AssignmentStatusInput),
      })),
      caseStatus: computeCaseStatus(examinationStatus?.name ?? null),
    };
  }
}
