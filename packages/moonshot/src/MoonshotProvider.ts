import {
  LlmRequest,
  type LlmResponse,
  type LlmProvider,
  type LlmProviderCallOptions
} from "@judgy-ts/core";

import { buildChatCompletionsRequestBody } from "./internal/buildChatCompletionsRequestBody.js";
import { fetchWithTimeout, type FetchLike } from "./internal/fetch.js";
import { parseChatCompletionsResponse } from "./internal/parseChatCompletionsResponse.js";

const CHAT_COMPLETIONS_URL = "https://api.moonshot.ai/v1/chat/completions";

export interface MoonshotProviderOptions {
  readonly apiKey: string;
  readonly model?: string;
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly timeoutMs?: number;
  readonly fetch?: FetchLike;
}

interface ResolvedMoonshotProviderOptions {
  readonly apiKey: string;
  readonly model: string;
  readonly temperature: number;
  readonly maxTokens: number;
  readonly timeoutMs: number;
  readonly fetch: FetchLike;
}

export class MoonshotProvider implements LlmProvider {
  private readonly options: ResolvedMoonshotProviderOptions;

  public constructor(options: MoonshotProviderOptions) {
    this.options = normalizeOptions(options);
  }

  public async complete(
    request: LlmRequest,
    callOptions?: LlmProviderCallOptions
  ): Promise<LlmResponse> {
    if (!(request instanceof LlmRequest)) {
      throw new TypeError("Request is required.");
    }

    const requestInit: RequestInit = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildChatCompletionsRequestBody(request, this.options))
    };

    if (callOptions?.signal !== undefined) {
      requestInit.signal = callOptions.signal;
    }

    const response = await fetchWithTimeout(
      this.options.fetch,
      CHAT_COMPLETIONS_URL,
      requestInit,
      this.options.timeoutMs
    );

    if (!response.ok) {
      throw new Error(`Moonshot request failed with status ${response.status}.`);
    }

    return parseChatCompletionsResponse(await response.json());
  }
}

function normalizeOptions(options: MoonshotProviderOptions): ResolvedMoonshotProviderOptions {
  if (options === null || options === undefined || typeof options !== "object") {
    throw new TypeError("Options are required.");
  }

  if (typeof options.apiKey !== "string" || options.apiKey.trim().length === 0) {
    throw new TypeError("ApiKey cannot be null or whitespace.");
  }

  return {
    apiKey: options.apiKey,
    model: typeof options.model === "string" && options.model.trim().length > 0 ? options.model : "kimi-k2.5",
    temperature: options.temperature ?? 0.0,
    maxTokens: options.maxTokens ?? 1024,
    timeoutMs: options.timeoutMs ?? 60_000,
    fetch: options.fetch ?? fetch
  };
}
