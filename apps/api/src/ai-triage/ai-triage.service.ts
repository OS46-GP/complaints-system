import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService, Prisma } from "../prisma/prisma.service";
import { EmbeddingService } from "./embedding.service";
import { Severity } from "@prisma/client";
import { getOrCreateAgent, ENABLE_AI } from "./agents/triage-agent";
import { CheckDuplicatesDto } from "../complaints/dto/check-duplicates.dto";
import type {
  AnalyzeResult,
  SeverityLevel,
  RecurrenceMatch,
  RecurrenceCandidate,
  RecurrenceInput,
} from "./interfaces/analyze-result.interface";

function sanitizeForLog(value: string): string {
  const maxLen = 80;
  if (value.length <= maxLen) return value;
  return value.slice(0, maxLen) + "...";
}

const API_TO_PRISMA_SEVERITY: Record<SeverityLevel, Severity> = {
  LOW: Severity.Low,
  MEDIUM: Severity.Medium,
  HIGH: Severity.High,
};

const RECURRENCE_TIME_WINDOW_MS = 365 * 24 * 60 * 60 * 1000;

@Injectable()
export class AiTriageService {
  private readonly logger = new Logger(AiTriageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async analyze(id: string): Promise<AnalyzeResult> {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      select: {
        id: true,
        subject: true,
        complaintNumber: true,
        statementYear: true,
        arrivalDate: true,
        departmentId: true,
        severity: true,
        annotation: true,
        examinationResult: true,
        authorityResponseText: true,
        citizen: {
          select: { nationalId: true, village: true, district: true, fullName: true, mobileNumber: true },
        },
        department: { select: { name: true } },
        examinationStatus: { select: { name: true } },
      },
    });

    if (!complaint) {
      throw new NotFoundException("Complaint not found");
    }

    const recurrenceMatches = await this.detectRecurrence(complaint);

    const severity = await this.scoreSeverity(complaint);

    if (complaint.severity === Severity.Low) {
      await this.prisma.complaint.update({
        where: { id },
        data: { severity: API_TO_PRISMA_SEVERITY[severity] },
      });
    }

    return { severity, recurrenceMatches };
  }

  async checkDuplicates(
    dto: CheckDuplicatesDto,
  ): Promise<{ recurrenceMatches: RecurrenceMatch[] }> {
    const candidate: RecurrenceInput = {
      subject: dto.subject,
      statementYear: new Date().getFullYear(),
      arrivalDate: dto.arrivalDate ? new Date(dto.arrivalDate) : new Date(),
      departmentId: dto.departmentId ?? null,
      citizen: {
        nationalId: dto.citizen?.nationalId ?? null,
        village: dto.citizen?.village ?? null,
        district: dto.citizen?.district ?? null,
      },
    };

    const recurrenceMatches = await this.detectRecurrence(candidate, {
      persist: false,
    });

    return { recurrenceMatches };
  }

  async reindexEmbeddings(
    limit = 100,
    cursor?: string,
  ): Promise<{ indexed: number; skipped: number; nextCursor: string | null }> {
    const complaints = await this.prisma.complaint.findMany({
      select: {
        id: true,
        subject: true,
        departmentId: true,
        citizen: {
          select: { village: true, district: true },
        },
      },
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit,
    });

    let indexed = 0;
    let skipped = 0;

    for (const complaint of complaints) {
      try {
        const location =
          complaint.citizen?.village || complaint.citizen?.district || null;
        await this.embeddingService.upsertEmbedding(
          complaint.id,
          complaint.subject,
          complaint.departmentId,
          location,
        );
        indexed++;
      } catch (error) {
        skipped++;
        this.logger.warn(
          `Failed to index complaint ${complaint.id}`,
          error,
        );
      }
    }

    const nextCursor =
      complaints.length === limit
        ? complaints[complaints.length - 1].id
        : null;

    this.logger.log(
      `Embedding reindex complete: ${indexed} indexed, ${skipped} skipped, nextCursor: ${nextCursor ?? "null"}`,
    );
    return { indexed, skipped, nextCursor };
  }

  async updateSeverity(
    id: string,
    severity: SeverityLevel,
  ): Promise<{ severity: SeverityLevel }> {
    const complaint = await this.prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
      throw new NotFoundException("Complaint not found");
    }

    await this.prisma.complaint.update({
      where: { id },
      data: { severity: API_TO_PRISMA_SEVERITY[severity] },
    });

    return { severity };
  }

  private async detectRecurrence(
    complaint: RecurrenceInput,
    options?: { persist?: boolean },
  ): Promise<RecurrenceMatch[]> {
    const persist = options?.persist ?? true;

    // Stage 1: Structured narrowing
    const stage1Candidates = await this.structuredNarrowing(complaint);
    if (stage1Candidates.length === 0) {
      if (persist) await this.upsertCurrentEmbedding(complaint);
      return [];
    }

    // Exact national ID match → confirmed recurrence
    const exactMatches = this.filterExactNationalIdMatch(
      stage1Candidates,
      complaint,
    );
    if (exactMatches.length > 0) {
      if (persist) {
        await this.upsertCurrentEmbedding(complaint);
        if (complaint.id) {
          await this.linkRecurrences(complaint.id, exactMatches);
        }
      }
      return this.toRecurrenceMatches(exactMatches);
    }

    if (!ENABLE_AI) {
      if (persist) await this.upsertCurrentEmbedding(complaint);
      return [];
    }

    // Stage 2: Embedding similarity search
    const candidateIds = stage1Candidates.map((c) => c.id);
    const similar = await this.embeddingService.searchSimilar(
      complaint.subject,
      candidateIds,
      5,
    );

    if (similar.length === 0) {
      if (persist) await this.upsertCurrentEmbedding(complaint);
      return [];
    }

    const candidatesForAgent = similar
      .map((s) => stage1Candidates.find((c) => c.id === s.id))
      .filter(Boolean) as RecurrenceCandidate[];

    // Stage 3: Agent reasoning
    const confirmed = await this.agentRecurrenceReasoning(complaint, candidatesForAgent);
    if (persist) await this.upsertCurrentEmbedding(complaint);

    if (persist && complaint.id) {
      await this.linkRecurrences(complaint.id, confirmed);
    }

    return this.toRecurrenceMatches(confirmed);
  }

  private async structuredNarrowing(
    complaint: RecurrenceInput,
  ): Promise<RecurrenceCandidate[]> {
    const { citizen, departmentId, id } = complaint;
    const timeWindowStart = new Date(Date.now() - RECURRENCE_TIME_WINDOW_MS);

    const where: Prisma.ComplaintWhereInput = {
      ...(id ? { id: { not: id } } : {}),
      createdAt: { gte: timeWindowStart },
    };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (citizen?.village || citizen?.district) {
      const OR: Prisma.CitizenWhereInput[] = [];
      if (citizen.village) {
        OR.push({ village: citizen.village });
      }
      if (citizen.district) {
        OR.push({ district: citizen.district });
      }
      where.citizen = { OR };
    }

    return this.prisma.complaint.findMany({
      where,
      include: {
        citizen: {
          select: { nationalId: true, village: true, district: true },
        },
        examinationStatus: { select: { name: true } },
        actions: { orderBy: { actionDate: "desc" } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }) as Promise<RecurrenceCandidate[]>;
  }

  private filterExactNationalIdMatch(
    candidates: RecurrenceCandidate[],
    complaint: { citizen: { nationalId: string | null } },
  ): RecurrenceCandidate[] {
    if (!complaint.citizen?.nationalId) return [];
    return candidates.filter(
      (c) => c.citizen?.nationalId === complaint.citizen.nationalId,
    );
  }

  private async agentRecurrenceReasoning(
    complaint: {
      complaintNumber?: number;
      statementYear: number;
      subject: string;
    },
    candidates: RecurrenceCandidate[],
  ): Promise<RecurrenceCandidate[]> {
    try {
      const newComplaintText =
        complaint.complaintNumber != null
          ? `#${complaint.complaintNumber}/${complaint.statementYear}: "${complaint.subject}"`
          : `"${complaint.subject}"`;

      const candidateText = candidates
        .map(
          (c, i) =>
            `[${i}] #${c.complaintNumber}/${c.statementYear}: "${c.subject}" (Status: ${c.examinationStatus?.name || "N/A"}, Date: ${new Date(c.arrivalDate).toISOString().split("T")[0]})`,
        )
        .join("\n");

      const agent = await getOrCreateAgent();
      const recurrencePrompt = `You are comparing a new complaint against existing ones. Return the indices of ALL existing complaints that describe the SAME real-world problem — same issue, same location — not just those filed by the same person.

New complaint: ${newComplaintText}

Existing complaints:
${candidateText}

If ANY existing complaint has an identical or very similar description about the same issue at the same location, it is a recurrence. Flag it.
If ALL describe the same issue, return ALL indices.

Return ONLY a JSON array of indices. Example: [0, 1, 2] or [0, 3] or [].

No explanation.`;

      this.logger.debug(`Recurrence prompt:\n${recurrencePrompt}`);
      const result = await agent.generate(recurrencePrompt);
      this.logger.log(`Recurrence response indices: "${result.text}"`);

      const matchIndices = this.parseSimilarityResult(
        result.text,
        candidates.length,
      );
      if (!matchIndices) return [];

      return matchIndices.map((i: number) => candidates[i]).filter(Boolean);
    } catch (error) {
      this.logger.error("Agent recurrence reasoning failed", error);
      return [];
    }
  }

  private parseSimilarityResult(
    text: string,
    maxIndex: number,
  ): number[] | null {
    try {
      const cleaned = text
        .trim()
        .replace(/```json\s*|\s*```/g, "")
        .replace(/```/g, "")
        .trim();
      if (cleaned.length === 0) return null;
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (i: unknown) => typeof i === "number" && i >= 0 && i < maxIndex,
        );
      }
      return null;
    } catch {
      const matches = text.match(/\[([\d,\s]*)\]/);
      if (matches) {
        const raw = matches[1].trim();
        if (raw.length === 0) return [];
        const indices = raw
          .split(",")
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n) && n >= 0 && n < maxIndex);
        return indices;
      }
      return null;
    }
  }

  private async linkRecurrences(sourceId: string, matches: RecurrenceCandidate[]): Promise<void> {
    try {
      for (const m of matches) {
        const ids = [sourceId, m.id].sort();
        await this.prisma.complaintLink.upsert({
          where: { sourceId_targetId: { sourceId: ids[0], targetId: ids[1] } },
          create: { sourceId: ids[0], targetId: ids[1] },
          update: {},
        });
      }
    } catch (error) {
      this.logger.warn('Failed to persist recurrence link', error);
    }
  }

  async getLinks(complaintId: string): Promise<AnalyzeResult> {
    const visited = new Set<string>([complaintId]);
    const frontier = [complaintId];
    const groupIds = new Set<string>();

    while (frontier.length > 0) {
      const batch = frontier.splice(0, 500);
      const links = await this.prisma.complaintLink.findMany({
        where: {
          OR: [{ sourceId: { in: batch } }, { targetId: { in: batch } }],
        },
        select: { sourceId: true, targetId: true },
      });

      for (const link of links) {
        for (const id of [link.sourceId, link.targetId]) {
          if (!visited.has(id)) {
            visited.add(id);
            groupIds.add(id);
            frontier.push(id);
          }
        }
      }
    }

    if (groupIds.size === 0) {
      return { severity: "LOW", recurrenceMatches: [] };
    }

    const complaints = await this.prisma.complaint.findMany({
      where: { id: { in: [...groupIds] } },
      include: {
        citizen: true,
        department: true,
        examinationStatus: true,
        actions: { orderBy: { actionDate: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      severity: "LOW",
      recurrenceMatches: complaints.map((c) => this.toRecurrenceMatch(c)),
    };
  }

  private toRecurrenceMatch(complaint: {
    id: string;
    complaintNumber: number;
    statementYear: number;
    arrivalDate: Date;
    subject: string;
    examinationStatus?: { name: string } | null;
    endDate: Date | null;
    actions: {
      id: string;
      action: string;
      actionDate: Date;
      notes: string | null;
    }[];
  }): RecurrenceMatch {
    return {
      id: complaint.id,
      complaintNumber: complaint.complaintNumber,
      statementYear: complaint.statementYear,
      arrivalDate:
        complaint.arrivalDate instanceof Date
          ? complaint.arrivalDate.toISOString()
          : String(complaint.arrivalDate),
      subject: complaint.subject,
      examinationStatus: complaint.examinationStatus?.name ?? null,
      endDate:
        complaint.endDate instanceof Date
          ? complaint.endDate.toISOString()
          : (complaint.endDate ?? null),
      actions: complaint.actions.map((a) => ({
        id: a.id,
        action: a.action,
        actionDate:
          a.actionDate instanceof Date
            ? a.actionDate.toISOString()
            : String(a.actionDate),
        notes: a.notes,
      })),
    };
  }

  private async upsertCurrentEmbedding(complaint: {
    id?: string;
    subject: string;
    departmentId: string | null;
    citizen: { village: string | null; district: string | null };
  }): Promise<void> {
    try {
      if (!complaint.id) return;
      const location =
        complaint.citizen?.village || complaint.citizen?.district || null;
      await this.embeddingService.ensureEmbedding(
        complaint.id,
        complaint.subject,
        complaint.departmentId,
        location,
      );
    } catch (error) {
      this.logger.warn("Failed to upsert embedding", error);
    }
  }

  private async scoreSeverity(complaint: {
    subject: string;
    department?: { name: string } | null;
    annotation?: string | null;
    examinationResult?: string | null;
    authorityResponseText?: string | null;
  }): Promise<SeverityLevel> {
    if (!ENABLE_AI) {
      return "MEDIUM";
    }

    try {
      const departmentName = complaint.department?.name || "General";
      const impactInfo =
        complaint.annotation ||
        complaint.examinationResult ||
        complaint.authorityResponseText ||
        "Not specified";

      const agent = await getOrCreateAgent();
      const severityPrompt = `Assess the severity of this government complaint.

Complaint Category: ${departmentName}
Description: "${complaint.subject}"
Additional Context: "${impactInfo}"

Respond with exactly one word: LOW, MEDIUM, or HIGH.`;

      this.logger.debug(`Severity prompt for complaint (dept=${departmentName}): ${sanitizeForLog(complaint.subject)}`);
      const result = await agent.generate(severityPrompt);
      this.logger.log(`Severity response: "${result.text}"`);

      return this.parseSeverityResult(result.text);
    } catch (error) {
      this.logger.error("Severity scoring failed", error);
      return "MEDIUM";
    }
  }

  private parseSeverityResult(text: string): SeverityLevel {
    const cleaned = text.trim().toUpperCase();
    if (cleaned.includes("HIGH")) return "HIGH";
    if (cleaned.includes("MEDIUM")) return "MEDIUM";
    if (cleaned.includes("LOW")) return "LOW";
    return "MEDIUM";
  }

  private toRecurrenceMatches(
    candidates: RecurrenceCandidate[],
  ): RecurrenceMatch[] {
    return candidates.map((c) => this.toRecurrenceMatch(c));
  }
}
