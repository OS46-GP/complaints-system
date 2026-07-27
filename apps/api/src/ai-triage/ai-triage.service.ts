import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EmbeddingService } from "./embedding.service";
import { Severity } from "@prisma/client";
import { getOrCreateAgent, ENABLE_AI } from "./agents/triage-agent";
import type {
  AnalyzeResult,
  SeverityLevel,
  RecurrenceMatch,
  RecurrenceCandidate,
} from "./interfaces/analyze-result.interface";

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
      include: {
        citizen: true,
        department: true,
        examinationStatus: true,
      },
    });

    if (!complaint) {
      throw new NotFoundException("Complaint not found");
    }

    const recurrenceMatches = await this.detectRecurrence(complaint);

    const severity = await this.scoreSeverity(complaint);

    await this.prisma.complaint.update({
      where: { id },
      data: { severity: API_TO_PRISMA_SEVERITY[severity] },
    });

    return { severity, recurrenceMatches };
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

  private async detectRecurrence(complaint: {
    id: string;
    subject: string;
    complaintNumber: number;
    statementYear: number;
    arrivalDate: Date;
    departmentId: string | null;
    citizen: {
      nationalId: string | null;
      village: string | null;
      district: string | null;
    };
    examinationStatus?: { name: string } | null;
  }): Promise<RecurrenceMatch[]> {
    // Stage 1: Structured narrowing
    const stage1Candidates = await this.structuredNarrowing(complaint);
    if (stage1Candidates.length === 0) {
      await this.upsertCurrentEmbedding(complaint);
      return [];
    }

    // Exact national ID match → confirmed recurrence
    const exactMatches = this.filterExactNationalIdMatch(
      stage1Candidates,
      complaint,
    );
    if (exactMatches.length > 0) {
      await this.upsertCurrentEmbedding(complaint);
      return this.toRecurrenceMatches(exactMatches);
    }

    if (!ENABLE_AI) {
      await this.upsertCurrentEmbedding(complaint);
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
      await this.upsertCurrentEmbedding(complaint);
      return [];
    }

    const candidatesForAgent = similar
      .map((s) => stage1Candidates.find((c) => c.id === s.id))
      .filter(Boolean) as RecurrenceCandidate[];

    // Stage 3: Agent reasoning
    const confirmed = await this.agentRecurrenceReasoning(complaint, candidatesForAgent);
    await this.upsertCurrentEmbedding(complaint);

    await this.linkRecurrences(complaint.id, confirmed);

    return this.toRecurrenceMatches(confirmed);
  }

  private async structuredNarrowing(complaint: {
    id: string;
    complaintNumber: number;
    statementYear: number;
    arrivalDate: Date;
    departmentId: string | null;
    citizen: {
      nationalId: string | null;
      village: string | null;
      district: string | null;
    };
  }): Promise<RecurrenceCandidate[]> {
    const { citizen, departmentId } = complaint;
    const timeWindowStart = new Date(Date.now() - RECURRENCE_TIME_WINDOW_MS);

    const where: Record<string, unknown> = {
      id: { not: complaint.id },
      createdAt: { gte: timeWindowStart },
    };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (citizen?.village || citizen?.district) {
      where.citizen = {};
      const or: Record<string, string>[] = [];
      if (citizen.village) {
        or.push({ village: citizen.village });
      }
      if (citizen.district) {
        or.push({ district: citizen.district });
      }
      if (or.length > 0) {
        (where.citizen as Record<string, unknown>).OR = or;
      }
    }

    return this.prisma.complaint.findMany({
      where: where as never,
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
      complaintNumber: number;
      statementYear: number;
      subject: string;
    },
    candidates: RecurrenceCandidate[],
  ): Promise<RecurrenceCandidate[]> {
    try {
      const newComplaintText = `#${complaint.complaintNumber}/${complaint.statementYear}: "${complaint.subject}"`;

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

      this.logger.log(`Recurrence prompt:\n${recurrencePrompt}`);
      const result = await agent.generate(recurrencePrompt);
      this.logger.log(`Recurrence raw response: "${result.text}"`);

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
        const indices = matches[1]
          .split(",")
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n) && n >= 0 && n < maxIndex);
        return indices.length > 0 ? indices : null;
      }
      return null;
    }
  }

  private async linkRecurrences(sourceId: string, matches: RecurrenceCandidate[]): Promise<void> {
    try {
      for (const m of matches) {
        const ids = [sourceId, m.id].sort();
        await this.prisma.client.complaintLink.upsert({
          where: { sourceId_targetId: { sourceId: ids[0], targetId: ids[1] } },
          create: { sourceId: ids[0], targetId: ids[1] },
          update: {},
        });
      }
    } catch (error) {
      this.logger.warn('Failed to persist recurrence link', error);
    }
  }

  private async upsertCurrentEmbedding(complaint: {
    id: string;
    subject: string;
    departmentId: string | null;
    citizen: { village: string | null; district: string | null };
  }): Promise<void> {
    try {
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

      this.logger.log(`Severity prompt:\n${severityPrompt}`);
      const result = await agent.generate(severityPrompt);
      this.logger.log(`Severity raw response: "${result.text}"`);

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
    return candidates.map((c) => ({
      id: c.id,
      complaintNumber: c.complaintNumber,
      statementYear: c.statementYear,
      arrivalDate:
        c.arrivalDate instanceof Date
          ? c.arrivalDate.toISOString()
          : String(c.arrivalDate),
      subject: c.subject,
      examinationStatus: c.examinationStatus?.name ?? null,
      endDate:
        c.endDate instanceof Date
          ? c.endDate.toISOString()
          : (c.endDate ?? null),
      actions: c.actions.map((a) => ({
        id: a.id,
        action: a.action,
        actionDate:
          a.actionDate instanceof Date
            ? a.actionDate.toISOString()
            : String(a.actionDate),
        notes: a.notes,
      })),
    }));
  }
}
