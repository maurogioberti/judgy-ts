import {
  LlmRequest,
  type LlmResponse,
  type LlmProvider,
  type LlmProviderCallOptions
} from "@judgy-ts/core";

import { buildChatRequestBody } from "./internal/buildChatRequestBody.js";
import { fetchWithTimeout, type FetchLike } from "./internal/fetch.js";
import { parseChatResponse } from "./internal/parseChatResponse.js";

const CHAT_ENDPOINT_PATH = "/api/chat";

export interface OllamaProviderOptions {
  readonly baseUrl?: string;
  readonly model?: string;
  readonly apiKey?: string;
  readonly timeoutMs?: number;
  readonly fetch?: FetchLike;
}

interface ResolvedOllamaProviderOptions {
  readonly baseUrl: string;
  readonly model: string;
  readonly apiKey: string | undefined;
  readonly timeoutMs: number;
  readonly fetch: FetchLike;
}

export class OllamaProvider implements LlmProvider {
  private readonly options: ResolvedOllamaProviderOptions;

  public constructor(options: OllamaProviderOptions) {
    this.options = normalizeOptions(options);
  }

  public async complete(
    request: LlmRequest,
    callOptions?: LlmProviderCallOptions
  ): Promise<LlmResponse> {
    if (!(request instanceof LlmRequest)) {
      throw new TypeError("Request is required.");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (this.options.apiKey !== undefined) {
      headers.Authorization = `Bearer ${this.options.apiKey}`;
    }

    const requestInit: RequestInit = {
      method: "POST",
      headers,
      body: JSON.stringify(buildChatRequestBody(request, this.options.model))
    };

    if (callOptions?.signal !== undefined) {
      requestInit.signal = callOptions.signal;
    }

    const response = await fetchWithTimeout(
      this.options.fetch,
      new URL(CHAT_ENDPOINT_PATH, this.options.baseUrl),
      requestInit,
      this.options.timeoutMs
    );

    if (!response.ok) {
      throw new Error(`Ollama request failed with status ${response.status}.`);
    }

    return parseChatResponse(await response.json());
  }
}

function normalizeOptions(options: OllamaProviderOptions): ResolvedOllamaProviderOptions {
  if (options === null || options === undefined || typeof options !== "object") {
    throw new TypeError("Options are required.");
  }

  const baseUrl = options.baseUrl ?? "http://localhost:11434";
  const model = options.model ?? "llama3:8b";

  if (typeof baseUrl !== "string" || baseUrl.trim().length === 0) {
    throw new TypeError("BaseUrl cannot be null or whitespace.");
  }

  if (typeof model !== "string" || model.trim().length === 0) {
    throw new TypeError("Model cannot be null or whitespace.");
  }

  return {
    baseUrl,
    model,
    apiKey: typeof options.apiKey === "string" && options.apiKey.trim().length > 0 ? options.apiKey : undefined,
    timeoutMs: options.timeoutMs ?? 120_000,
    fetch: options.fetch ?? fetch
  };
}
