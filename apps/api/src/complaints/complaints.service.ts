import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateComplaintDto } from "./dto/create-complaint.dto";
import { UpdateComplaintDto } from "./dto/update-complaint.dto";
import { QueryComplaintsDto } from "./dto/query-complaints.dto";
import { SearchComplaintDto } from "./dto/search-complaint.dto";
import { computeCaseStatus } from "./case-status.config";

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
};

function toRelationData(input: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) continue;
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
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateComplaintDto) {
    const { citizen, ...complaintData } = dto;

    const data: any = toRelationData(complaintData);
    data.arrivalDate = new Date(complaintData.arrivalDate);
    if (complaintData.authorityResponseDate) data.authorityResponseDate = new Date(complaintData.authorityResponseDate);
    if (complaintData.outgoingLetterDate) data.outgoingLetterDate = new Date(complaintData.outgoingLetterDate);
    if (complaintData.notificationOutDate) data.notificationOutDate = new Date(complaintData.notificationOutDate);
    if (complaintData.archiveDate) data.archiveDate = new Date(complaintData.archiveDate);
    if (complaintData.finalDecisionDate) data.finalDecisionDate = new Date(complaintData.finalDecisionDate);
    if (complaintData.endDate) data.endDate = new Date(complaintData.endDate);
    data.citizen = { create: citizen };

    const complaint = await this.prisma.client.complaint.create({
      data,
      include: complaintInclude,
    });

    return this.addCaseStatus(complaint);
  }

  async findAll(query: QueryComplaintsDto) {
    const { page = 1, limit = 20, departmentId, name, complaintNumber, statementYear } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (name) {
      where.citizen = {
        fullName: { contains: name, mode: "insensitive" },
      };
    }

    if (complaintNumber) {
      where.complaintNumber = { contains: complaintNumber, mode: "insensitive" };
    }

    if (statementYear) {
      where.statementYear = statementYear;
    }

    const [items, total] = await Promise.all([
      this.prisma.client.complaint.findMany({
        where,
        skip,
        take: limit,
        include: complaintInclude,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.client.complaint.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: items.map((item: any) => this.addCaseStatus(item)),
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

  async search(query: SearchComplaintDto) {
    const { name, id, year } = query;
    const where: any = {};

    if (name) {
      where.citizen = {
        fullName: { contains: name, mode: "insensitive" },
      };
    }

    if (id && year) {
      where.complaintNumber = id;
      where.statementYear = year;
    }

    const items = await this.prisma.client.complaint.findMany({
      where,
      include: complaintInclude,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return items.map((item: any) => this.addCaseStatus(item));
  }

  async findById(id: string) {
    const complaint = await this.prisma.client.complaint.findUnique({
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

    const data: any = toRelationData(complaintData);
    if (data.arrivalDate) data.arrivalDate = new Date(data.arrivalDate);
    if (data.authorityResponseDate) data.authorityResponseDate = new Date(data.authorityResponseDate);
    if (data.outgoingLetterDate) data.outgoingLetterDate = new Date(data.outgoingLetterDate);
    if (data.notificationOutDate) data.notificationOutDate = new Date(data.notificationOutDate);
    if (data.archiveDate) data.archiveDate = new Date(data.archiveDate);
    if (data.finalDecisionDate) data.finalDecisionDate = new Date(data.finalDecisionDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    if (citizen) {
      data.citizen = {
        update: citizen,
      };
    }

    const complaint = await this.prisma.client.complaint.update({
      where: { id },
      data,
      include: complaintInclude,
    });

    return this.addCaseStatus(complaint);
  }

  async getDepartments() {
    return this.prisma.client.department.findMany({
      orderBy: { name: "asc" },
    });
  }

  async getExaminationStatuses() {
    return this.prisma.client.examinationStatus.findMany({
      orderBy: { id: "asc" },
    });
  }

  async getReceptionMethods() {
    return this.prisma.client.receptionMethod.findMany({
      orderBy: { id: "asc" },
    });
  }

  async getComplaintTypes() {
    return this.prisma.client.complaintType.findMany({
      orderBy: { id: "asc" },
    });
  }

  async getPresentationStatuses() {
    return this.prisma.client.presentationStatus.findMany({
      orderBy: { id: "asc" },
    });
  }

  private addCaseStatus(complaint: any) {
    return {
      ...complaint,
      caseStatus: computeCaseStatus(complaint.examinationStatusId),
    };
  }
}
