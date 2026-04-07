import {
  LlmRequest,
  type LlmResponse,
  type LlmProvider,
  type LlmProviderCallOptions
} from "@judgy-ts/core";

import { buildChatCompletionsRequestBody } from "./internal/buildChatCompletionsRequestBody.js";
import { fetchWithTimeout, type FetchLike } from "./internal/fetch.js";
import { parseChatCompletionsResponse } from "./internal/parseChatCompletionsResponse.js";

export interface AzureOpenAiProviderOptions {
  readonly endpoint: string;
  readonly apiKey: string;
  readonly deploymentName: string;
  readonly apiVersion?: string;
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly timeoutMs?: number;
  readonly fetch?: FetchLike;
}

interface ResolvedAzureOpenAiProviderOptions {
  readonly endpoint: string;
  readonly apiKey: string;
  readonly deploymentName: string;
  readonly apiVersion: string;
  readonly temperature: number;
  readonly maxTokens: number;
  readonly timeoutMs: number;
  readonly fetch: FetchLike;
}

export class AzureOpenAiProvider implements LlmProvider {
  private readonly options: ResolvedAzureOpenAiProviderOptions;

  public constructor(options: AzureOpenAiProviderOptions) {
    this.options = normalizeOptions(options);
  }

  public async complete(
    request: LlmRequest,
    callOptions?: LlmProviderCallOptions
  ): Promise<LlmResponse> {
    if (!(request instanceof LlmRequest)) {
      throw new TypeError("Request is required.");
    }

    const path = `openai/deployments/${encodeURIComponent(this.options.deploymentName)}/chat/completions?api-version=${encodeURIComponent(this.options.apiVersion)}`;
    const requestInit: RequestInit = {
      method: "POST",
      headers: {
        "api-key": this.options.apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildChatCompletionsRequestBody(request, this.options))
    };

    if (callOptions?.signal !== undefined) {
      requestInit.signal = callOptions.signal;
    }

    const response = await fetchWithTimeout(
      this.options.fetch,
      new URL(path, this.options.endpoint),
      requestInit,
      this.options.timeoutMs
    );

    if (!response.ok) {
      throw new Error(`Azure OpenAI request failed with status ${response.status}.`);
    }

    return parseChatCompletionsResponse(await response.json());
  }
}

function normalizeOptions(options: AzureOpenAiProviderOptions): ResolvedAzureOpenAiProviderOptions {
  if (options === null || options === undefined || typeof options !== "object") {
    throw new TypeError("Options are required.");
  }

  if (typeof options.endpoint !== "string" || options.endpoint.trim().length === 0) {
    throw new TypeError("Endpoint cannot be null or whitespace.");
  }

  if (typeof options.apiKey !== "string" || options.apiKey.trim().length === 0) {
    throw new TypeError("ApiKey cannot be null or whitespace.");
  }

  if (typeof options.deploymentName !== "string" || options.deploymentName.trim().length === 0) {
    throw new TypeError("DeploymentName cannot be null or whitespace.");
  }

  if (options.apiVersion !== undefined && (typeof options.apiVersion !== "string" || options.apiVersion.trim().length === 0)) {
    throw new TypeError("ApiVersion cannot be null or whitespace.");
  }

  return {
    endpoint: options.endpoint,
    apiKey: options.apiKey,
    deploymentName: options.deploymentName,
    apiVersion: options.apiVersion ?? "2024-10-21",
    temperature: options.temperature ?? 0.0,
    maxTokens: options.maxTokens ?? 1024,
    timeoutMs: options.timeoutMs ?? 60_000,
    fetch: options.fetch ?? fetch
  };
}
