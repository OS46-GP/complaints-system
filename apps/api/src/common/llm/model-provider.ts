import { ModelRouterEmbeddingModel } from "@mastra/core/llm";
import type { MastraModelConfig } from "@mastra/core/llm";
import { createSbgLanguageModel } from "./sbg-provider";

const SBG_PREFIX = "sbg/";

/**
 * Resolve an LLM_MODEL value (e.g. "google/gemini-2.0-flash" or
 * "sbg/amazon.nova-lite-v1:0") into a Mastra-compatible model config.
 * "sbg/..." IDs route to the ITI SBG gateway via createSbgLanguageModel
 * (SBG is not one of Mastra's bundled providers). Everything else is passed
 * through Mastra's model router.
 */
export function resolveChatModel(modelId: string | undefined): MastraModelConfig {
  if (!modelId) return "";
  if (modelId.startsWith(SBG_PREFIX)) {
    return createSbgLanguageModel(modelId.slice(SBG_PREFIX.length)) as MastraModelConfig;
  }
  return modelId;
}

/**
 * Resolve an EMBEDDING_MODEL (e.g. "openai/text-embedding-3-small") into a
 * model usable by `ai`'s embed(). All IDs go through Mastra's model router.
 */
export function resolveEmbeddingModel(modelId: string | undefined): unknown {
  if (!modelId) return new ModelRouterEmbeddingModel("openai/text-embedding-3-small");
  return new ModelRouterEmbeddingModel(modelId);
}