import {
  LlmRequest,
  type LlmResponse,
  type LlmProvider,
  type LlmProviderCallOptions
} from "@judgy-ts/core";

import { fetchWithTimeout, type FetchLike } from "./internal/fetch.js";
import { buildGenerateContentRequestBody } from "./internal/buildGenerateContentRequestBody.js";
import { parseGenerateContentResponse } from "./internal/parseGenerateContentResponse.js";

const GENERATE_CONTENT_BASE_URL = "https://generativelanguage.googleapis.com/";

export interface GoogleProviderOptions {
  readonly apiKey: string;
  readonly model?: string;
  readonly temperature?: number;
  readonly maxOutputTokens?: number;
  readonly timeoutMs?: number;
  readonly fetch?: FetchLike;
}

interface ResolvedGoogleProviderOptions {
  readonly apiKey: string;
  readonly model: string;
  readonly temperature: number;
  readonly maxOutputTokens: number;
  readonly timeoutMs: number;
  readonly fetch: FetchLike;
}

export class GoogleProvider implements LlmProvider {
  private readonly options: ResolvedGoogleProviderOptions;

  public constructor(options: GoogleProviderOptions) {
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
        "x-goog-api-key": this.options.apiKey
      },
      body: JSON.stringify(buildGenerateContentRequestBody(request, this.options))
    };

    if (callOptions?.signal !== undefined) {
      requestInit.signal = callOptions.signal;
    }

    const path = `v1beta/models/${encodeURIComponent(this.options.model)}:generateContent`;
    const response = await fetchWithTimeout(
      this.options.fetch,
      new URL(path, GENERATE_CONTENT_BASE_URL),
      requestInit,
      this.options.timeoutMs
    );

    if (!response.ok) {
      throw new Error(`Google request failed with status ${response.status}.`);
    }

    return parseGenerateContentResponse(await response.json());
  }
}

function normalizeOptions(options: GoogleProviderOptions): ResolvedGoogleProviderOptions {
  if (options === null || options === undefined || typeof options !== "object") {
    throw new TypeError("Options are required.");
  }

  if (typeof options.apiKey !== "string" || options.apiKey.trim().length === 0) {
    throw new TypeError("ApiKey cannot be null or whitespace.");
  }

  if (options.model !== undefined && (typeof options.model !== "string" || options.model.trim().length === 0)) {
    throw new TypeError("Model cannot be null or whitespace.");
  }

  return {
    apiKey: options.apiKey,
    model: options.model ?? "gemini-2.5-flash",
    temperature: options.temperature ?? 0.0,
    maxOutputTokens: options.maxOutputTokens ?? 1024,
    timeoutMs: options.timeoutMs ?? 60_000,
    fetch: options.fetch ?? fetch
  };
}
