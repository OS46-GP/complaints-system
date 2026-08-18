import { Provider } from "@nestjs/common";
import { GraphApiProvider } from "./graph-api.provider";
import { ApifyProvider } from "./apify.provider";
import type { SocialDataSourceProvider } from "./social-data-source.interface";

export const SOCIAL_DATA_SOURCE = "SOCIAL_DATA_SOURCE";

export function createSocialDataSourceProvider(): Provider<SocialDataSourceProvider> {
  return {
    provide: SOCIAL_DATA_SOURCE,
    useFactory: (): SocialDataSourceProvider => {
      const source = process.env.SOCIAL_SOURCE ?? "graph";
      switch (source) {
        case "apify":
          return new ApifyProvider();
        default:
          return new GraphApiProvider();
      }
    },
  };
}

export { SOCIAL_DATA_SOURCE as SOCIAL_DATA_SOURCE_TOKEN };
export type { SocialDataSourceProvider } from "./social-data-source.interface";
export { SocialPost } from "./social-data-source.interface";