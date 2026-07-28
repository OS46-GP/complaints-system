import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService, Prisma } from "../prisma/prisma.service";
import { EmbeddingService } from "../ai-triage/embedding.service";
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
    const { citizen, ...complaintData } = dto;

    const data: Record<string, unknown> = toRelationData(complaintData);
    parseDates(data);
    data.citizen = { create: citizen };
    if (user) {
      data.createdBy = { connect: { id: user.id } };
    }

    const complaint = await this.prisma.client.$transaction(async (tx) => {
      const txPrisma = tx as typeof this.prisma.client;

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

  async indexAll(): Promise<{ indexed: number }> {
    const batchSize = 100;
    let indexed = 0;
    let skip = 0;
    let count: number;

    do {
      const batch = await this.prisma.complaint.findMany({
        skip,
        take: batchSize,
        include: { citizen: { select: { village: true, district: true } } },
        orderBy: { createdAt: "desc" },
      });
      count = batch.length;
      for (const c of batch) {
        await this.indexComplaint(c);
        indexed++;
      }
      skip += batchSize;
    } while (count === batchSize);

    return { indexed };
  }

  async indexComplaint(complaint: {
    id: string;
    subject: string;
    departmentId: string | null;
    citizen: { village: string | null; district: string | null };
  }): Promise<void> {
    try {
      const location = complaint.citizen?.village || complaint.citizen?.district || null;
      await this.embeddingService.ensureEmbedding(
        complaint.id,
        complaint.subject,
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
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ComplaintWhereInput = {};

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (name) {
      where.citizen = {
        fullName: { contains: name, mode: "insensitive" },
      };
    }

    if (complaintNumber) {
      where.complaintNumber = complaintNumber;
    }

    if (statementYear) {
      where.statementYear = statementYear;
    }

    const [items, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        skip,
        take: limit,
        include: complaintInclude,
        orderBy: { createdAt: "desc" },
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

  async update(id: string, dto: UpdateComplaintDto) {
    await this.findById(id);

    const { citizen, ...complaintData } = dto;

    const data: Record<string, unknown> = toRelationData(complaintData);
    parseDates(data);

    if (citizen) {
      data.citizen = {
        update: citizen,
      };
    }

    const complaint = await this.prisma.complaint.update({
      where: { id },
      data: data as Prisma.ComplaintUpdateInput,
      include: complaintInclude,
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
