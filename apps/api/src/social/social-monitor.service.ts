import { Injectable, Logger, Inject } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SOCIAL_DATA_SOURCE_TOKEN } from "./providers";
import type { SocialDataSourceProvider } from "./providers";

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
        duplicatesSkipped: 0,
        draftsCreated: [],
      };
    }

    const draftsCreated = [];
    let postsFetched = 0;
    let spamSkipped = 0;
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

          const existing = await this.prisma.client.socialDraft.findUnique({
            where: { sourcePostId: post.id },
          });
          if (existing) {
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
            },
          });

          draftsCreated.push(draft);
          this.logger.log(`Created draft from post ${post.id} in ${group.name}`);
        }
      } catch (error) {
        this.logger.error(
          `Failed to poll group ${group.name} (${group.groupId}): ${error instanceof Error ? error.message : error}`,
        );
      }
    }

    return {
      groupsPolled: groups.length,
      postsFetched,
      spamSkipped,
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