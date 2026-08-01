import { Injectable, Logger } from "@nestjs/common";
import type { SocialPost, SocialDataSourceProvider } from "./social-data-source.interface";

type FacebookPostRaw = {
  id: string;
  message?: string;
  from?: { name: string };
  created_time?: string;
  permalink_url?: string;
};

@Injectable()
export class GraphApiProvider implements SocialDataSourceProvider {
  readonly name = "graph-api";
  private readonly logger = new Logger(GraphApiProvider.name);

  async fetchPosts(groupId: string, groupName: string): Promise<SocialPost[]> {
    const accessToken = process.env.FB_ACCESS_TOKEN;
    if (!accessToken) {
      this.logger.warn("FB_ACCESS_TOKEN not set");
      return [];
    }

    const url = new URL(`https://graph.facebook.com/v22.0/${groupId}/feed`);
    url.searchParams.set("access_token", accessToken);
    url.searchParams.set("fields", "id,message,from,created_time,permalink_url");
    url.searchParams.set("limit", "10");

    const response = await fetch(url.toString());
    if (!response.ok) {
      this.logger.warn(`Facebook API returned ${response.status} for group ${groupName}`);
      return [];
    }

    const body = (await response.json()) as {
      data?: FacebookPostRaw[];
      error?: { message: string };
    };

    if (body.error) {
      this.logger.error(`Facebook API error for ${groupName}: ${body.error.message}`);
      return [];
    }

    return (body.data ?? [])
      .filter((p) => p.message)
      .map((p) => ({
        id: p.id,
        message: p.message!,
        authorName: p.from?.name,
        postedAt: p.created_time ? new Date(p.created_time) : new Date(),
        permalinkUrl: p.permalink_url || `https://facebook.com/${p.id}`,
      }));
  }
}