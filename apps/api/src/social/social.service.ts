import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { summarizeComplaints } from "./agents/social-summary-agent";

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

  /**
   * Generate an AI summary/report of the drafts captured between `from` and
   * `to` (inclusive, based on detectedAt). Returns the matching drafts plus
   * the summary; summary is null when AI is disabled, no drafts match, or the
   * agent call fails.
   */
  async summarizeDraftsByDate(from?: string, to?: string) {
    const fromDate = from ? new Date(`${from}T00:00:00`) : undefined;
    const toDate = to ? new Date(`${to}T23:59:59.999`) : undefined;

    if (fromDate && Number.isNaN(fromDate.getTime())) {
      throw new BadRequestException("Invalid from date");
    }
    if (toDate && Number.isNaN(toDate.getTime())) {
      throw new BadRequestException("Invalid to date");
    }
    if (fromDate && toDate && fromDate > toDate) {
      throw new BadRequestException("from date must be before to date");
    }

    const where: Prisma.SocialDraftWhereInput = {};
    if (fromDate) {
      where.detectedAt = { ...(where.detectedAt as object), gte: fromDate };
    }
    if (toDate) {
      where.detectedAt = {
        ...(where.detectedAt as object),
        lte: toDate,
      };
    }

    const drafts = await this.prisma.client.socialDraft.findMany({
      where,
      orderBy: { detectedAt: "desc" },
    });

    const summary = await summarizeComplaints(
      drafts.map((draft) => {
        const fields =
          draft.extractedFields && typeof draft.extractedFields === "object"
            ? (draft.extractedFields as Record<string, unknown>)
            : {};
        return {
          subject: typeof fields.subject === "string" ? fields.subject : "",
          annotation:
            typeof fields.annotation === "string"
              ? fields.annotation
              : draft.postText,
          complaintType:
            typeof fields.complaintType === "string" ? fields.complaintType : "",
          severity:
            fields.severity === "Low" || fields.severity === "High"
              ? fields.severity
              : "Medium",
          groupName: draft.groupName || "",
        };
      }),
    );

    return { count: drafts.length, drafts, summary };
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