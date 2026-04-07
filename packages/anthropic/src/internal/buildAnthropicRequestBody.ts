import { type LlmRequest } from "@judgy-ts/core";

export interface AnthropicRequestDefaults {
  readonly model: string;
  readonly temperature: number;
  readonly maxTokens: number;
}

export function buildAnthropicRequestBody(
  request: LlmRequest,
  defaults: AnthropicRequestDefaults
): Record<string, unknown> {
  const requestBody: Record<string, unknown> = {
    model: defaults.model,
    max_tokens: request.maxTokens ?? defaults.maxTokens,
    messages: [
      {
        role: "user",
        content: request.prompt
      }
    ],
    temperature: request.temperature ?? defaults.temperature
  };

  if (request.systemPrompt !== undefined) {
    requestBody.system = request.systemPrompt;
  }

  return requestBody;
}
