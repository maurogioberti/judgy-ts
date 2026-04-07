import {
  LlmRequest,
  LlmResponse,
  type LlmProvider,
  type LlmProviderCallOptions
} from "@judgy-ts/core";

import { fetchWithTimeout, type FetchLike } from "./internal/fetch.js";
import { buildRequestBody } from "./internal/buildRequestBody.js";
import { extractResponseText } from "./internal/extractResponseText.js";

const PROVIDER_NAME = "Http";

export interface HttpProviderOptions {
  readonly endpoint: string;
  readonly headers?: Record<string, string>;
  readonly requestTemplate?: string;
  readonly responseJsonPath?: string;
  readonly regexPattern?: string;
  readonly timeoutMs?: number;
  readonly fetch?: FetchLike;
}

interface ResolvedHttpProviderOptions {
  readonly endpoint: string;
  readonly headers: Record<string, string>;
  readonly requestTemplate: string;
  readonly responseJsonPath: string;
  readonly regexPattern: string | undefined;
  readonly timeoutMs: number;
  readonly fetch: FetchLike;
}

export class HttpProvider implements LlmProvider {
  private readonly options: ResolvedHttpProviderOptions;

  public constructor(options: HttpProviderOptions) {
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
        ...this.options.headers,
        "Content-Type": "application/json"
      },
      body: buildRequestBody(request.prompt, this.options.requestTemplate)
    };

    if (callOptions?.signal !== undefined) {
      requestInit.signal = callOptions.signal;
    }

    const response = await fetchWithTimeout(
      this.options.fetch,
      this.options.endpoint,
      requestInit,
      this.options.timeoutMs
    );

    if (!response.ok) {
      throw new Error(`Http provider request failed with status ${response.status}.`);
    }

    const responseBody = await response.text();
    const text = extractResponseText(
      responseBody,
      this.options.responseJsonPath,
      this.options.regexPattern
    );

    return new LlmResponse({
      text,
      providerName: PROVIDER_NAME
    });
  }
}

function normalizeOptions(options: HttpProviderOptions): ResolvedHttpProviderOptions {
  if (options === null || options === undefined || typeof options !== "object") {
    throw new TypeError("Options are required.");
  }

  if (typeof options.endpoint !== "string" || options.endpoint.trim().length === 0) {
    throw new TypeError("Endpoint cannot be null or whitespace.");
  }

  return {
    endpoint: options.endpoint,
    headers: options.headers ?? {},
    requestTemplate: options.requestTemplate ?? '{"prompt": "{{prompt}}"}',
    responseJsonPath: options.responseJsonPath ?? "$.response",
    regexPattern: options.regexPattern,
    timeoutMs: options.timeoutMs ?? 60_000,
    fetch: options.fetch ?? fetch
  };
}
