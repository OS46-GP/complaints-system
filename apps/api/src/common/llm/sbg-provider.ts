import type {
  LanguageModelV2,
  LanguageModelV2CallOptions,
  LanguageModelV2FinishReason,
  LanguageModelV2StreamPart,
} from '@ai-sdk/provider';

/**
 * Minimal LanguageModelV2 adapter for the ITI SBG Bedrock gateway
 * (https://apiaccess.iti.net.eg/api/v1/student/chat).
 *
 * The gateway is a plain, non-streaming JSON HTTP API authenticated with a
 * Bearer token, and does not implement the AI SDK streaming protocol — so
 * doStream synthesizes a single-shot stream from one non-streaming response.
 */

const SBG_CHAT_PATH = '/student/chat';

interface SbgUsage {
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  stop_reason?: string;
}

interface SbgResponse {
  output_text?: string;
  usage?: SbgUsage;
  error?: { code?: string; message?: string };
  detail?: string;
}

function sbgBaseUrl(): string {
  return process.env.SBG_BASE_URL?.replace(/\/+$/, '') ?? 'http://apiaccess.iti.net.eg/api/v1';
}

/**
 * The SBG gateway forwards max_tokens to Bedrock, which rejects values above
 * the model limit (10000 for nova-lite). Always send an explicit value so the
 * gateway's own (too-large) default never triggers a validation error.
 */
function effectiveMaxTokens(value: number | undefined): number {
  return value && value > 0 ? Math.min(value, 10000) : 2000;
}

async function chatRequest(modelId: string, options: LanguageModelV2CallOptions): Promise<SbgResponse> {
  const apiKey = process.env.SBG_API_KEY;
  if (!apiKey) {
    throw new Error('SBG_API_KEY is not set');
  }

  const systemParts: string[] = [];
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  for (const message of options.prompt) {
    if (message.role === 'system') {
      systemParts.push(message.content);
      continue;
    }
    if (message.role !== 'user' && message.role !== 'assistant') continue;
    const text = message.content
      .filter((part) => part.type === 'text')
      .map((part) => (part as { text: string }).text)
      .join('\n');
    if (text) messages.push({ role: message.role, content: text });
  }

  const body: Record<string, unknown> = {
    model_id: modelId,
    messages,
  };
  if (systemParts.length) body.system_prompt = systemParts.join('\n\n');
  body.max_tokens = effectiveMaxTokens(options.maxOutputTokens);
  if (options.temperature != null) body.temperature = options.temperature;
  if (options.stopSequences?.length) body.stop_sequences = options.stopSequences;

  const response = await fetch(`${sbgBaseUrl()}${SBG_CHAT_PATH}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: options.abortSignal,
  });

  const raw = (await response.json().catch(() => ({}))) as SbgResponse;
  if (!response.ok) {
    throw new Error(
      `SBG chat ${response.status}: ${raw.error?.message ?? raw.detail ?? 'unknown error'}`,
    );
  }
  if (raw.error) {
    throw new Error(`SBG chat error: ${raw.error.message ?? JSON.stringify(raw.error)}`);
  }
  return raw;
}

function finishReason(stop?: string): LanguageModelV2FinishReason {
  if (!stop) return 'unknown';
  if (['end_turn', 'stop', 'endoftext'].includes(stop)) return 'stop';
  if (['max_tokens', 'length'].includes(stop)) return 'length';
  if (['content_filter', 'guardrail'].includes(stop)) return 'content-filter';
  return 'other';
}

export function createSbgLanguageModel(modelId: string): LanguageModelV2 {
  return {
    specificationVersion: 'v2',
    provider: 'sbg',
    modelId,
    supportedUrls: {},

    async doGenerate(options: LanguageModelV2CallOptions) {
      const raw = await chatRequest(modelId, options);
      return {
        content: [{ type: 'text', text: raw.output_text ?? '' }],
        finishReason: finishReason(raw.usage?.stop_reason),
        usage: {
          inputTokens: raw.usage?.input_tokens,
          outputTokens: raw.usage?.output_tokens,
          totalTokens: raw.usage?.total_tokens,
        },
        warnings: [],
      };
    },

    async doStream(options: LanguageModelV2CallOptions) {
      const raw = await chatRequest(modelId, options);
      const text = raw.output_text ?? '';
      const id = `sbg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const parts: LanguageModelV2StreamPart[] = [
        { type: 'text-start', id },
        { type: 'text-delta', id, delta: text },
        { type: 'text-end', id },
        {
          type: 'finish',
          finishReason: finishReason(raw.usage?.stop_reason),
          usage: {
            inputTokens: raw.usage?.input_tokens,
            outputTokens: raw.usage?.output_tokens,
            totalTokens: raw.usage?.total_tokens,
          },
        },
      ];
      const stream = new ReadableStream<LanguageModelV2StreamPart>({
        start(controller) {
          for (const part of parts) controller.enqueue(part);
          controller.close();
        },
      });
      return { stream };
    },
  };
}