export type SocialSourceType = "Group" | "Page";

export type SocialPost = {
  id: string;
  message: string;
  authorName?: string;
  postedAt: Date;
  permalinkUrl: string;
};

export interface SocialDataSourceProvider {
  readonly name: string;
  fetchPosts(
    groupId: string,
    groupName: string,
    type: SocialSourceType,
  ): Promise<SocialPost[]>;
}