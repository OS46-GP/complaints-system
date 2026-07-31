export type SocialPost = {
  id: string;
  message: string;
  authorName?: string;
  postedAt: Date;
  permalinkUrl: string;
};

export interface SocialDataSourceProvider {
  readonly name: string;
  fetchPosts(groupId: string, groupName: string): Promise<SocialPost[]>;
}