import {
  LlmRequest,
  type LlmResponse,
  type LlmProvider,
  type LlmProviderCallOptions
} from "@judgy/core";

import { fetchWithTimeout, type FetchLike } from "./internal/fetch.js";
import { buildAnthropicRequestBody } from "./internal/buildAnthropicRequestBody.js";
import { parseAnthropicResponse } from "./internal/parseAnthropicResponse.js";

const MESSAGES_URL = "https://api.anthropic.com/v1/messages";

export interface AnthropicProviderOptions {
  readonly apiKey: string;
  readonly model?: string;
  readonly apiVersion?: string;
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly timeoutMs?: number;
  readonly fetch?: FetchLike;
}

interface ResolvedAnthropicProviderOptions {
  readonly apiKey: string;
  readonly model: string;
  readonly apiVersion: string;
  readonly temperature: number;
  readonly maxTokens: number;
  readonly timeoutMs: number;
  readonly fetch: FetchLike;
}

export class AnthropicProvider implements LlmProvider {
  private readonly options: ResolvedAnthropicProviderOptions;

  public constructor(options: AnthropicProviderOptions) {
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
        "Content-Type": "application/json",
        "x-api-key": this.options.apiKey,
        "anthropic-version": this.options.apiVersion
      },
      body: JSON.stringify(buildAnthropicRequestBody(request, this.options))
    };

    if (callOptions?.signal !== undefined) {
      requestInit.signal = callOptions.signal;
    }

    const response = await fetchWithTimeout(
      this.options.fetch,
      MESSAGES_URL,
      requestInit,
      this.options.timeoutMs
    );

    if (!response.ok) {
      throw new Error(`Anthropic request failed with status ${response.status}.`);
    }

    return parseAnthropicResponse(await response.json());
  }
}

function normalizeOptions(options: AnthropicProviderOptions): ResolvedAnthropicProviderOptions {
  if (options === null || options === undefined || typeof options !== "object") {
    throw new TypeError("Options are required.");
  }

  if (typeof options.apiKey !== "string" || options.apiKey.trim().length === 0) {
    throw new TypeError("ApiKey cannot be null or whitespace.");
  }

  if (options.apiVersion !== undefined && (typeof options.apiVersion !== "string" || options.apiVersion.trim().length === 0)) {
    throw new TypeError("ApiVersion cannot be null or whitespace.");
  }

  return {
    apiKey: options.apiKey,
    model: typeof options.model === "string" && options.model.trim().length > 0 ? options.model : "claude-sonnet-4-20250514",
    apiVersion: options.apiVersion ?? "2023-06-01",
    temperature: options.temperature ?? 0.0,
    maxTokens: options.maxTokens ?? 1024,
    timeoutMs: options.timeoutMs ?? 60_000,
    fetch: options.fetch ?? fetch
  };
}
