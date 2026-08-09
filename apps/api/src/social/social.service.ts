import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";

type SocialDraftStatus = "Pending" | "Approved" | "Rejected";

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  async listDrafts(status?: SocialDraftStatus) {
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    return this.prisma.client.socialDraft.findMany({
      where,
      orderBy: { detectedAt: "desc" },
    });
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

  async deleteDraft(id: string) {
    const draft = await this.prisma.client.socialDraft.findUnique({
      where: { id },
    });
    if (!draft) throw new NotFoundException("Social draft not found");

    return this.prisma.client.socialDraft.delete({ where: { id } });
  }

  async linkDraftToComplaint(id: string, complaintId: string) {
    const draft = await this.prisma.client.socialDraft.findUnique({
      where: { id },
    });
    if (!draft) throw new NotFoundException("Social draft not found");
    if (draft.status !== "Pending")
      throw new BadRequestException("Draft is not pending");

    return this.prisma.client.socialDraft.update({
      where: { id },
      data: {
        status: "Approved" as SocialDraftStatus,
        complaintId,
      },
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
    try {
      return await this.prisma.client.monitoredGroup.create({ data });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Group is already monitored");
      }
      throw error;
    }
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