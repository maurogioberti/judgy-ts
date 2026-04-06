import type { LlmRequest } from "./LlmRequest.js";
import type { LlmResponse } from "./LlmResponse.js";

export interface LlmProviderCallOptions {
  readonly signal?: AbortSignal;
}

export interface LlmProvider {
  complete(request: LlmRequest, options?: LlmProviderCallOptions): Promise<LlmResponse>;
}
