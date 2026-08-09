import { Injectable, Logger } from "@nestjs/common";
import type {
  SocialPost,
  SocialDataSourceProvider,
  SocialSourceType,
} from "./social-data-source.interface";

type ApifyInput = Record<string, unknown>;

@Injectable()
export class ApifyProvider implements SocialDataSourceProvider {
  readonly name = "apify";
  private readonly logger = new Logger(ApifyProvider.name);

  async fetchPosts(
    groupId: string,
    groupName: string,
    type: SocialSourceType,
  ): Promise<SocialPost[]> {
    const apiKey = process.env.APIFY_API_KEY;
    if (!apiKey) {
      this.logger.warn("APIFY_API_KEY not set");
      return [];
    }

    if (type === "Page") {
      return this.fetchPageComments(groupId, groupName, apiKey);
    }

    const actorId = this.normalizeActorId(
      process.env.APIFY_FACEBOOK_ACTOR || "apify/facebook-groups-scraper",
    );

    const items = await this.runActor(
      actorId,
      {
        startUrls: [{ url: `https://www.facebook.com/groups/${groupId}` }],
        resultsLimit: this.intEnv("APIFY_GROUP_POSTS_LIMIT", 10),
      },
      apiKey,
    );
    if (!items) return [];

    return items
      .map((p) => this.toSocialPost(p))
      .filter((p): p is SocialPost => Boolean(p && p.message));
  }

  /**
   * Pages are scraped in two stages: the posts scraper collects recent post
   * URLs from the page, then the comments scraper pulls the comments of
   * those posts. Each comment becomes a single SocialPost so it flows
   * through the same draft pipeline as group posts.
   */
  private async fetchPageComments(
    pageId: string,
    pageName: string,
    apiKey: string,
  ): Promise<SocialPost[]> {
    const postsActor = this.normalizeActorId(
      process.env.APIFY_FACEBOOK_POSTS_ACTOR || "apify/facebook-posts-scraper",
    );
    const commentsActor = this.normalizeActorId(
      process.env.APIFY_FACEBOOK_COMMENTS_ACTOR ||
        "apify/facebook-comments-scraper",
    );

    const postItems = await this.runActor(
      postsActor,
      {
        startUrls: [{ url: `https://www.facebook.com/${pageId}` }],
        resultsLimit: this.intEnv("APIFY_PAGE_POSTS_LIMIT", 5),
      },
      apiKey,
    );
    if (!postItems || postItems.length === 0) {
      this.logger.warn(`No posts found for page ${pageName} (${pageId})`);
      return [];
    }

    const postUrls = postItems
      .map((p) => this.firstString(p.url, p.postUrl, p.permalink_url) ?? "")
      .filter(Boolean);
    if (postUrls.length === 0) {
      this.logger.warn(`No post URLs extracted for page ${pageName}`);
      return [];
    }

    const commentItems = await this.runActor(
      commentsActor,
      {
        startUrls: postUrls.map((url) => ({ url })),
        resultsLimit: this.intEnv("APIFY_COMMENTS_LIMIT", 50),
        includeNestedComments: this.boolEnv(
          "APIFY_INCLUDE_NESTED_COMMENTS",
          false,
        ),
      },
      apiKey,
    );
    if (!commentItems) return [];

    return commentItems
      .map((c) => this.toSocialPost(c))
      .filter((p): p is SocialPost => Boolean(p && p.message));
  }

  /**
   * Maps an Apify actor item to SocialPost, tolerating the different field
   * names used across Apify's Facebook actors (posts, groups, comments).
   */
  private toSocialPost(item: Record<string, unknown>): SocialPost | null {
    const message = this.firstString(item.text, item.message, item.body);
    if (!message) return null;

    const id = this.firstString(
      item.commentId,
      item.id,
      item.postId,
      item.legacyId,
    );
    if (!id) return null;

    return {
      id,
      message,
      authorName: this.firstString(
        item.profileName,
        item.authorName,
        item.user,
      ),
      postedAt: this.parseDate(
        item.date,
        item.time,
        item.timestamp,
        item.created_time,
      ),
      permalinkUrl:
        this.firstString(item.commentUrl, item.url, item.permalink_url) ||
        `https://facebook.com/${id}`,
    };
  }

  private async runActor(
    actorId: string,
    input: ApifyInput,
    apiKey: string,
  ): Promise<Record<string, unknown>[] | null> {
    const response = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs?token=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
    );

    if (!response.ok) {
      this.logger.warn(`Apify API returned ${response.status} for actor ${actorId}`);
      return null;
    }

    const run = (await response.json()) as { data?: { id: string } };
    const runId = run.data?.id;
    if (!runId) return null;

    return this.waitForResult(runId, apiKey);
  }

  private async waitForResult(
    runId: string,
    apiKey: string,
    retries = 20,
  ): Promise<Record<string, unknown>[] | null> {
    for (let i = 0; i < retries; i++) {
      await new Promise((r) => setTimeout(r, 3000));

      const statusRes = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${apiKey}`,
      );
      const statusBody = (await statusRes.json()) as {
        data?: { status?: string; defaultDatasetId?: string };
      };

      const status = statusBody.data?.status;
      if (status === "SUCCEEDED") {
        const datasetId = statusBody.data?.defaultDatasetId;
        if (!datasetId) return null;

        const dataRes = await fetch(
          `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apiKey}`,
        );
        return (await dataRes.json()) as Record<string, unknown>[];
      }

      if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
        this.logger.warn(`Apify run ${runId} ended with status ${status}`);
        return null;
      }
    }

    this.logger.warn(`Apify run ${runId} timed out waiting for completion`);
    return null;
  }

  private firstString(...values: unknown[]): string | undefined {
    for (const value of values) {
      if (typeof value === "string" && value.trim()) return value.trim();
      if (value && typeof value === "object" && "name" in value) {
        const name = (value as { name: unknown }).name;
        if (typeof name === "string" && name.trim()) return name.trim();
      }
    }
    return undefined;
  }

  private parseDate(...values: unknown[]): Date {
    for (const value of values) {
      if (typeof value === "number" && Number.isFinite(value)) {
        return new Date(value > 1e12 ? value : value * 1000);
      }
      if (typeof value === "string" && value) {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) return parsed;
      }
    }
    return new Date();
  }

  private intEnv(name: string, fallback: number): number {
    const raw = process.env[name];
    const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private boolEnv(name: string, fallback: boolean): boolean {
    const raw = process.env[name];
    if (!raw) return fallback;
    return raw.toLowerCase() === "true";
  }

  private normalizeActorId(actorId: string): string {
    return actorId.replace(/\/(?=[^/]+$)/, "~");
  }
}
