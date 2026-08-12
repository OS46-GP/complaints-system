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
import { QueryComplaintsDto } from "./dto/query-complaints.dto";
import { computeCaseStatus } from "./case-status.config";

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
    const { citizen, departmentIds, ...complaintData } = dto;

    const uniqueDepartmentIds = [...new Set((departmentIds ?? []).filter((id) => id?.trim()))];

    const data: Record<string, unknown> = toRelationData(complaintData);
    if (uniqueDepartmentIds.length > 0) {
      data.department = { connect: { id: uniqueDepartmentIds[0] } };
      data.departments = {
        create: uniqueDepartmentIds.map((departmentId) => ({ departmentId })),
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
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ComplaintWhereInput = {};

    if (departmentId) {
      where.departments = { some: { departmentId } };
    }

    if (citizenNationalId) {
      where.citizen = { nationalId: citizenNationalId };
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

  async update(id: string, dto: UpdateComplaintDto) {
    const current = await this.findById(id);

    const { citizen, departmentIds, ...complaintData } = dto;

    const data: Record<string, unknown> = toRelationData(complaintData);
    parseDates(data);

    const uniqueDepartmentIds = departmentIds
      ? [...new Set(departmentIds.filter((departmentId) => departmentId?.trim()))]
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

      if (uniqueDepartmentIds) {
        await (txPrisma as any).complaintDepartment.deleteMany({
          where: { complaintId: id },
        });
        if (uniqueDepartmentIds.length > 0) {
          await (txPrisma as any).complaintDepartment.createMany({
            data: uniqueDepartmentIds.map((departmentId) => ({
              complaintId: id,
              departmentId,
            })),
          });
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

  private addCaseStatus(complaint: {
    examinationStatus?: { name: string } | null;
    examinationStatusId?: number | null;
    [key: string]: unknown;
  }) {
    return {
      ...complaint,
      caseStatus: computeCaseStatus(complaint.examinationStatus?.name),
    };
  }
}
