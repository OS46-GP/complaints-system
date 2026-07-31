import { Injectable, Logger, Inject } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SOCIAL_DATA_SOURCE_TOKEN } from "./providers";
import type { SocialDataSourceProvider } from "./providers";

const SPAM_PATTERNS = [
  /(?:buy|sell|shop|order|discount|price|offer|limited)\s*(?:now|today|online)/i,
  /(?:click|tap|follow)\s*(?:here|link|the\s*link)/i,
  /(?:free|win|earn|cash|prize|lottery|winner)/i,
  /https?:\/\/[^\s]+\s*https?:\/\/[^\s]+/,
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
      return;
    }

    for (const group of groups) {
      try {
        const posts = await this.provider.fetchPosts(group.groupId, group.name);

        for (const post of posts) {
          if (this.isSpam(post.message)) continue;

          const existing = await this.prisma.client.socialDraft.findUnique({
            where: { sourcePostId: post.id },
          });
          if (existing) continue;

          await this.prisma.client.socialDraft.create({
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

          this.logger.log(`Created draft from post ${post.id} in ${group.name}`);
        }
      } catch (error) {
        this.logger.error(
          `Failed to poll group ${group.name} (${group.groupId}): ${error instanceof Error ? error.message : error}`,
        );
      }
    }
  }

  private isSpam(text: string): boolean {
    if (text.length < MIN_TEXT_LENGTH) return true;
    for (const pattern of SPAM_PATTERNS) {
      if (pattern.test(text)) return true;
    }
    return false;
  }
}