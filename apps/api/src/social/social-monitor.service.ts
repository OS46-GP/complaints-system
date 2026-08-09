import { Injectable, Logger, Inject } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SOCIAL_DATA_SOURCE_TOKEN } from "./providers";
import type { SocialDataSourceProvider } from "./providers";
import type { SocialPost } from "./providers/social-data-source.interface";
import { analyzePosts, ENABLE_AI } from "./agents/social-intake-agent";
import type { PostToAnalyze, SocialIntakeResult } from "./agents/social-intake-agent";

const SPAM_PATTERNS = [
  /(?:buy|sell|shop|order|discount|price|offer|limited)\s*(?:now|today|online)/i,
  /(?:click|tap|follow)\s*(?:here|link|the\s*link)/i,
  /(?:free|win|earn|cash|prize|lottery|winner)/i,
  /https?:\/\/[^\s]+\s*https?:\/\/[^\s]+/,
  /(?:للبيع|معروض للبيع|مطلوب\s*(?:للبيع|للشراء|أرض|شقة|قطعة)|بيع\s*و|شراء\s*)/,
  /(?:سعر|خصم|عرض\s*خاص|إعلان|اعلان|للإيجار|للايجار)/,
  /(?:ت\.\s*\d|واتساب|واتس\s*اب|للتواصل|رقم\s*التواصل|مع\s*الف سلامة)/,
];

const MIN_TEXT_LENGTH = 20;

@Injectable()
export class SocialMonitorService {
  private readonly logger = new Logger(SocialMonitorService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(SOCIAL_DATA_SOURCE_TOKEN)
    private readonly provider: SocialDataSourceProvider,
  ) {}

  async poll() {
    this.logger.log(`Polling Facebook via ${this.provider.name}`);

    const groups = await this.prisma.client.monitoredGroup.findMany({
      where: { isActive: true },
    });

    if (groups.length === 0) {
      this.logger.log("No active monitored groups — skipping poll");
      return {
        groupsPolled: 0,
        postsFetched: 0,
        spamSkipped: 0,
        aiFiltered: 0,
        duplicatesSkipped: 0,
        draftsCreated: [],
      };
    }

    const draftsCreated = [];
    const pending: { post: SocialPost; group: { groupId: string; name: string } }[] = [];
    let postsFetched = 0;
    let spamSkipped = 0;
    let aiFiltered = 0;
    let duplicatesSkipped = 0;

    for (const group of groups) {
      try {
        const posts = await this.provider.fetchPosts(group.groupId, group.name);

        for (const post of posts) {
          postsFetched++;
          if (this.isSpam(post.message)) {
            spamSkipped++;
            continue;
          }
          pending.push({ post, group });
        }
      } catch (error) {
        this.logger.error(
          `Failed to poll group ${group.name} (${group.groupId}): ${error instanceof Error ? error.message : error}`,
        );
      }
    }

    const analyses = new Map<
      number,
      { isRelevant: boolean; fields: SocialIntakeResult["fields"] | null }
    >();
    if (ENABLE_AI && pending.length > 0) {
      const complaintTypes = await this.prisma.client.complaintType.findMany({
        select: { name: true },
        orderBy: { name: "asc" },
      });
      const toAnalyze: PostToAnalyze[] = pending.map((p) => ({
        text: p.post.message,
        authorName: p.post.authorName,
      }));
      this.logger.log(
        `Running AI intake on ${toAnalyze.length} posts in a single batch call`,
      );
      const results = await analyzePosts(
        toAnalyze,
        complaintTypes.map((t) => t.name),
      );
      for (const result of results) {
        const hasExtraction =
          result.fields.subject ||
          result.fields.annotation ||
          result.fields.citizenFullName ||
          result.fields.citizenNationalId ||
          result.fields.citizenMobileNumber ||
          result.fields.citizenAddress ||
          result.fields.citizenVillage ||
          result.fields.citizenDistrict ||
          result.fields.complaintType ||
          result.fields.receptionMethod ||
          result.fields.severity !== "Medium";
        analyses.set(result.index, {
          isRelevant: result.isRelevant,
          fields: hasExtraction ? result.fields : null,
        });
      }
    }

    for (let i = 0; i < pending.length; i++) {
      const { post, group } = pending[i];
      const analysis = analyses.get(i);

      if (analysis && !analysis.isRelevant) {
        aiFiltered++;
        this.logger.log(`AI filtered post ${post.id} in ${group.name}`);
        continue;
      }

      const existing = await this.prisma.client.socialDraft.findUnique({
        where: { sourcePostId: post.id },
      });
      if (existing) {
        const storedFields =
          existing.extractedFields && typeof existing.extractedFields === "object"
            ? (existing.extractedFields as Record<string, unknown>)
            : null;
        const isStale =
          existing.status === "Pending" &&
          (!storedFields || !("citizenAddress" in storedFields));
        if (isStale && analysis?.fields) {
          await this.prisma.client.socialDraft.update({
            where: { id: existing.id },
            data: { extractedFields: analysis.fields },
          });
          this.logger.log(
            `Re-extracted fields for existing draft ${existing.id} (${group.name})`,
          );
        }
        duplicatesSkipped++;
        continue;
      }

      const draft = await this.prisma.client.socialDraft.create({
        data: {
          sourcePostId: post.id,
          sourceLink: post.permalinkUrl,
          postText: post.message,
          authorName: post.authorName || null,
          postedAt: post.postedAt,
          groupId: group.groupId,
          groupName: group.name,
          ...(analysis?.fields ? { extractedFields: analysis.fields } : {}),
        },
      });

      draftsCreated.push(draft);
      this.logger.log(`Created draft from post ${post.id} in ${group.name}`);
    }

    return {
      groupsPolled: groups.length,
      postsFetched,
      spamSkipped,
      aiFiltered,
      duplicatesSkipped,
      draftsCreated,
    };
  }

  private isSpam(text: string): boolean {
    if (text.length < MIN_TEXT_LENGTH) return true;
    for (const pattern of SPAM_PATTERNS) {
      if (pattern.test(text)) return true;
    }
    return false;
  }
}