import { Injectable, Logger } from "@nestjs/common";
import type { SocialPost, SocialDataSourceProvider } from "./social-data-source.interface";

@Injectable()
export class ApifyProvider implements SocialDataSourceProvider {
  readonly name = "apify";
  private readonly logger = new Logger(ApifyProvider.name);

  async fetchPosts(groupId: string, groupName: string): Promise<SocialPost[]> {
    const apiKey = process.env.APIFY_API_KEY;
    if (!apiKey) {
      this.logger.warn("APIFY_API_KEY not set");
      return [];
    }

    const actorId = process.env.APIFY_FACEBOOK_ACTOR || "danek/facebook-pages-posts-ppr";

    const input = {
      page_id: groupId,
      max_posts: 25,
      start_date: this.daysAgo(1),
    };

    const response = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs?token=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
    );

    if (!response.ok) {
      this.logger.warn(`Apify API returned ${response.status} for ${groupName}`);
      return [];
    }

    const run = (await response.json()) as { data?: { id: string } };
    const runId = run.data?.id;
    if (!runId) return [];

    const result = await this.waitForResult(runId, apiKey);
    if (!result) return [];

    return result.map((p: Record<string, unknown>) => ({
      id: String(p.post_id ?? ""),
      message: String(p.message ?? ""),
      authorName: (p.author as Record<string, unknown>)?.name as string | undefined,
      postedAt: p.timestamp
        ? new Date((p.timestamp as number) * 1000)
        : new Date(),
      permalinkUrl: String(p.url ?? `https://facebook.com/${p.post_id}`),
    })).filter((p: SocialPost) => p.message);
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

  private daysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split("T")[0];
  }
}