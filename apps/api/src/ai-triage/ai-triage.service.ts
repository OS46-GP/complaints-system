import {
  Injectable,
  NotFoundException,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { PrismaService, Prisma } from "../prisma/prisma.service";
import { EmbeddingService, buildEmbeddingText } from "./embedding.service";
import { Severity } from "@prisma/client";
import { getOrCreateAgent, ENABLE_AI, triageResultSchema } from "./agents/triage-agent";
import { CheckDuplicatesDto } from "../complaints/dto/check-duplicates.dto";
import type {
  AnalyzeResult,
  SeverityLevel,
  RecurrenceMatch,
  RecurrenceCandidate,
  RecurrenceInput,
} from "./interfaces/analyze-result.interface";

// SeverityLevel uses PascalCase matching the Prisma Severity enum, so no
// translation map is needed between the agent output and the DB enum.

const RECURRENCE_WINDOW_DAYS = Number(
  process.env.RECURRENCE_WINDOW_DAYS ?? 365,
);
const RECURRENCE_TIME_WINDOW_MS =
  RECURRENCE_WINDOW_DAYS > 0 ? RECURRENCE_WINDOW_DAYS * 24 * 60 * 60 * 1000 : 0;

const MIN_CANDIDATES = 5;
const STAGE1_FETCH_SIZE = 200;
const STAGE1_RESULT_SIZE = 50;

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

    const triage = await this.runTriage(
      {
        id: complaint.id,
        subject: complaint.subject,
        annotation: complaint.annotation,
        departmentName: complaint.department?.name ?? null,
        complaintNumber: complaint.complaintNumber,
        statementYear: complaint.statementYear,
        arrivalDate: complaint.arrivalDate,
        departmentId: complaint.departmentId,
        citizen: {
          nationalId: complaint.citizen?.nationalId ?? null,
          village: complaint.citizen?.village ?? null,
          district: complaint.citizen?.district ?? null,
        },
      },
      {
        needSeverity: true,
      },
    );

    if (complaint.severity === Severity.Low) {
      await this.prisma.complaint.update({
        where: { id },
        data: { severity: triage.severity },
      });
    }

    return { severity: triage.severity, recurrenceMatches: triage.recurrenceMatches };
  }

  async checkDuplicates(
    dto: CheckDuplicatesDto,
  ): Promise<{ severity: SeverityLevel; recurrenceMatches: RecurrenceMatch[] }> {
    const candidate: RecurrenceInput = {
      subject: dto.subject,
      annotation: dto.annotation ?? null,
      statementYear: new Date().getFullYear(),
      arrivalDate: dto.arrivalDate ? new Date(dto.arrivalDate) : new Date(),
      departmentId: dto.departmentId ?? null,
      citizen: {
        nationalId: dto.citizen?.nationalId ?? null,
        village: dto.citizen?.village ?? null,
        district: dto.citizen?.district ?? null,
      },
    };

    const triage = await this.runTriage(candidate, {
      persist: false,
      needSeverity: true,
    });

    return {
      severity: triage.severity,
      recurrenceMatches: triage.recurrenceMatches,
    };
  }

  async reindexEmbeddings(
    limit = 100,
    cursor?: string,
  ): Promise<{ indexed: number; skipped: number; nextCursor: string | null }> {
    const complaints = await this.prisma.complaint.findMany({
      select: {
        id: true,
        subject: true,
        annotation: true,
        departmentId: true,
        citizen: {
          select: { village: true, district: true },
        },
      },
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [
        { statementYear: "desc" },
        { complaintNumber: "desc" },
        { id: "desc" },
      ],
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
          buildEmbeddingText(complaint.subject, complaint.annotation),
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
      data: { severity },
    });

    return { severity };
  }

  private async runTriage(
    complaint: RecurrenceInput,
    options?: { persist?: boolean; needSeverity?: boolean },
  ): Promise<{ severity: SeverityLevel; recurrenceMatches: RecurrenceMatch[] }> {
    const persist = options?.persist ?? true;
    const needSeverity = options?.needSeverity ?? true;

    // Stage 1: Structured narrowing
    const stage1Candidates = await this.structuredNarrowing(complaint);
    if (stage1Candidates.length === 0) {
      if (persist) await this.upsertCurrentEmbedding(complaint);
      const severity =
        ENABLE_AI && needSeverity
          ? (await this.triageWithAgent(complaint, [], new Set<string>())).severity
          : "Medium";
      return { severity, recurrenceMatches: [] };
    }

    // Exact national ID match → confirmed recurrence
    const exactMatches = this.filterExactNationalIdMatch(
      stage1Candidates,
      complaint,
    );
    const exactIds = new Set(exactMatches.map((c) => c.id));

    if (!ENABLE_AI) {
      if (persist) {
        await this.upsertCurrentEmbedding(complaint);
        if (complaint.id) {
          await this.linkRecurrences(complaint.id, exactMatches);
        }
      }
      return {
        severity: "Medium",
        recurrenceMatches: this.toRecurrenceMatches(exactMatches),
      };
    }

    // checkDuplicates: preserve current cost behavior — exact matches short-circuit
    if (exactMatches.length > 0 && !needSeverity) {
      if (persist) {
        await this.upsertCurrentEmbedding(complaint);
        if (complaint.id) {
          await this.linkRecurrences(complaint.id, exactMatches);
        }
      }
      return {
        severity: "Medium",
        recurrenceMatches: this.toRecurrenceMatches(exactMatches),
      };
    }

    // Stage 2: Embedding similarity search
    const similar = await this.embeddingService.searchSimilar(
      buildEmbeddingText(complaint.subject, complaint.annotation),
      stage1Candidates.map((c) => c.id),
      5,
    );

    const similarCandidates = similar
      .map((s) => stage1Candidates.find((c) => c.id === s.id))
      .filter(Boolean) as RecurrenceCandidate[];

    // Reasoning candidates: embedding-similar + exact-NID matches (deduped)
    const reasoningMap = new Map<string, RecurrenceCandidate>();
    for (const c of [...similarCandidates, ...exactMatches]) {
      reasoningMap.set(c.id, c);
    }
    const reasoningCandidates = [...reasoningMap.values()];

    // Stage 3: Single combined agent call — severity + recurrence together
    let severity: SeverityLevel = "Medium";
    let confirmed: RecurrenceCandidate[] = [];

    if (reasoningCandidates.length > 0 || needSeverity) {
      const triage = await this.triageWithAgent(
        complaint,
        reasoningCandidates,
        exactIds,
      );
      severity = triage.severity;
      const aiIds = new Set(triage.recurrenceIds);
      confirmed = reasoningCandidates.filter(
        (c) => aiIds.has(c.id) || exactIds.has(c.id),
      );
    }

    if (persist) {
      await this.upsertCurrentEmbedding(complaint);
      if (complaint.id) {
        await this.linkRecurrences(complaint.id, confirmed);
      }
    }

    return {
      severity,
      recurrenceMatches: this.toRecurrenceMatches(confirmed),
    };
  }

  private normalizeLocationText(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[\u064B-\u0652\u0640]/g, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/[\s\u00A0]+/g, " ");
  }

  private fuzzyLocationMatch(a: string | null, b: string | null): boolean {
    if (!a || !b) return false;
    const na = this.normalizeLocationText(a);
    const nb = this.normalizeLocationText(b);
    return na === nb || na.includes(nb) || nb.includes(na);
  }

  private locationMatches(
    candidate: { village: string | null; district: string | null },
    citizen: { village: string | null; district: string | null },
  ): boolean {
    return (
      this.fuzzyLocationMatch(candidate.village, citizen.village) ||
      this.fuzzyLocationMatch(candidate.district, citizen.district) ||
      this.fuzzyLocationMatch(candidate.village, citizen.district) ||
      this.fuzzyLocationMatch(candidate.district, citizen.village)
    );
  }

  private async structuredNarrowing(
    complaint: RecurrenceInput,
  ): Promise<RecurrenceCandidate[]> {
    const { citizen, departmentId, id } = complaint;

    const query = async (
      windowMs: number,
      withDepartment: boolean,
    ): Promise<RecurrenceCandidate[]> => {
      const where: Prisma.ComplaintWhereInput = {
        ...(id ? { id: { not: id } } : {}),
        ...(windowMs > 0 ? { createdAt: { gte: new Date(Date.now() - windowMs) } } : {}),
        ...(withDepartment && departmentId ? { departmentId } : {}),
      };

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
        take: STAGE1_FETCH_SIZE,
      }) as Promise<RecurrenceCandidate[]>;
    };

    const levels: Array<{
      name: string;
      windowMs: number;
      withDepartment: boolean;
      fuzzyLocation: boolean;
    }> = [
      { name: "strict (window + dept + fuzzy location)", windowMs: RECURRENCE_TIME_WINDOW_MS, withDepartment: true, fuzzyLocation: true },
      { name: "window + dept", windowMs: RECURRENCE_TIME_WINDOW_MS, withDepartment: true, fuzzyLocation: false },
      { name: "window only", windowMs: RECURRENCE_TIME_WINDOW_MS, withDepartment: false, fuzzyLocation: false },
      { name: "all-time", windowMs: 0, withDepartment: false, fuzzyLocation: false },
    ];

    let fallback: RecurrenceCandidate[] | null = null;

    for (const level of levels) {
      let candidates = await query(level.windowMs, level.withDepartment);
      if (level.fuzzyLocation) {
        candidates = candidates.filter((c) =>
          this.locationMatches(c.citizen ?? { village: null, district: null }, citizen ?? { village: null, district: null }),
        );
      }
      if (level === levels[levels.length - 1]) {
        fallback = candidates;
      }
      this.logger.debug(
        `structuredNarrowing level "${level.name}" produced ${candidates.length} candidates`,
      );
      if (candidates.length >= MIN_CANDIDATES) {
        return candidates.slice(0, STAGE1_RESULT_SIZE);
      }
    }

    return (fallback ?? []).slice(0, STAGE1_RESULT_SIZE);
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

  private async triageWithAgent(
    complaint: RecurrenceInput,
    candidates: RecurrenceCandidate[],
    exactIds: Set<string>,
  ): Promise<{ severity: SeverityLevel; recurrenceIds: string[] }> {
    try {
      const complaintText = [
        complaint.complaintNumber != null
          ? `#${complaint.complaintNumber}/${complaint.statementYear}`
          : `New complaint (${complaint.statementYear})`,
        `Subject: ${complaint.subject}`,
        complaint.annotation ? `Description: ${complaint.annotation}` : null,
        complaint.departmentName ? `Category: ${complaint.departmentName}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      const candidateText = candidates
        .map(
          (c) =>
            `[${c.id}] #${c.complaintNumber}/${c.statementYear}: "${c.subject}" (Status: ${c.examinationStatus?.name || "N/A"}, Date: ${new Date(c.arrivalDate).toISOString().split("T")[0]}, Resolved: ${c.endDate ? "yes" : "no"}${exactIds.has(c.id) ? ", Same citizen: confirmed" : ""})`,
        )
        .join("\n");

      const triagePrompt = `New complaint:
${complaintText}

${candidates.length > 0 ? `Existing complaints:
${candidateText}` : "No existing candidates found."}

Return JSON with "severity" (one of Low, Medium, High) and "recurrenceIds" (the [ids] of ALL existing complaints that describe the same real-world problem; [] if none). No explanation.`;

      this.logger.debug(`Triage prompt:\n${triagePrompt}`);
      const agent = await getOrCreateAgent();
      const result = await agent.generate(triagePrompt, {
        structuredOutput: {
          schema: triageResultSchema,
          jsonPromptInjection: "auto",
        },
      });
      this.logger.log(
        `Triage result severity="${result.object.severity}" ids="${JSON.stringify(result.object.recurrenceIds)}"`,
      );

      return {
        severity: result.object.severity,
        recurrenceIds: result.object.recurrenceIds,
      };
    } catch (error) {
      this.logger.error("Agent triage failed", error);
      throw new ServiceUnavailableException(
        "AI triage unavailable — LLM provider failed",
      );
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

  async unlinkComplaints(
    a: string,
    b: string,
  ): Promise<{ unlinked: boolean }> {
    const ids = [a, b].sort();
    const result = await this.prisma.complaintLink.deleteMany({
      where: {
        AND: [{ sourceId: ids[0] }, { targetId: ids[1] }],
      },
    });

    if (result.count === 0) {
      throw new NotFoundException("Complaint link not found");
    }

    this.logger.log(`Unlinked complaints ${ids[0]} <-> ${ids[1]}`);
    return { unlinked: true };
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
      return { severity: "Low", recurrenceMatches: [] };
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
      severity: "Low",
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
    annotation?: string | null;
    departmentId: string | null;
    citizen: { village: string | null; district: string | null };
  }): Promise<void> {
    try {
      if (!complaint.id) return;
      const location =
        complaint.citizen?.village || complaint.citizen?.district || null;
      await this.embeddingService.ensureEmbedding(
        complaint.id,
        buildEmbeddingText(complaint.subject, complaint.annotation),
        complaint.departmentId,
        location,
      );
    } catch (error) {
      this.logger.warn("Failed to upsert embedding", error);
    }
  }

  private toRecurrenceMatches(
    candidates: RecurrenceCandidate[],
  ): RecurrenceMatch[] {
    return candidates.map((c) => this.toRecurrenceMatch(c));
  }
}
