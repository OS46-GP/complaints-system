import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ComplaintsService } from "../complaints/complaints.service";

type SocialDraftStatus = "Pending" | "Approved" | "Rejected";

@Injectable()
export class SocialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly complaintsService: ComplaintsService,
  ) {}

  async listDrafts(status?: SocialDraftStatus) {
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    return this.prisma.client.socialDraft.findMany({
      where,
      orderBy: { detectedAt: "desc" },
    });
  }

  async approveDraft(id: string, userId: string) {
    const draft = await this.prisma.client.socialDraft.findUnique({
      where: { id },
    });
    if (!draft) throw new NotFoundException("Social draft not found");
    if (draft.status !== "Pending")
      throw new BadRequestException("Draft is not pending");

    const complaint = await this.complaintsService.create(
      {
        statementYear: new Date().getFullYear(),
        arrivalDate: draft.postedAt.toISOString(),
        subject: draft.postText,
        citizen: {
          fullName: draft.authorName || "مواطن",
        },
      },
      { id: userId, role: "Official" },
    );

    await this.prisma.client.socialDraft.update({
      where: { id },
      data: {
        status: "Approved" as SocialDraftStatus,
        complaintId: (complaint as Record<string, unknown>).id as string,
      },
    });

    return complaint;
  }

  async rejectDraft(id: string, notes?: string) {
    const draft = await this.prisma.client.socialDraft.findUnique({
      where: { id },
    });
    if (!draft) throw new NotFoundException("Social draft not found");
    if (draft.status !== "Pending")
      throw new BadRequestException("Draft is not pending");

    return this.prisma.client.socialDraft.update({
      where: { id },
      data: { status: "Rejected" as SocialDraftStatus, notes },
    });
  }

  async listMonitoredGroups() {
    return this.prisma.client.monitoredGroup.findMany({
      orderBy: { name: "asc" },
    });
  }

  async addMonitoredGroup(data: {
    groupId: string;
    name: string;
    type: "Group" | "Page";
  }) {
    return this.prisma.client.monitoredGroup.create({ data });
  }

  async removeMonitoredGroup(id: string) {
    return this.prisma.client.monitoredGroup.delete({ where: { id } });
  }

  async toggleMonitoredGroup(id: string, isActive: boolean) {
    return this.prisma.client.monitoredGroup.update({
      where: { id },
      data: { isActive },
    });
  }
}