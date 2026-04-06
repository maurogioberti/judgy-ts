import { type LlmRequest } from "@judgy/core";

interface ChatMessage {
  readonly role: "system" | "user";
  readonly content: string;
}

export interface OpenAiRequestDefaults {
  readonly model: string;
  readonly temperature: number;
  readonly maxTokens: number;
}

export function buildChatCompletionsRequestBody(
  request: LlmRequest,
  defaults: OpenAiRequestDefaults
): Record<string, unknown> {
  return {
    model: defaults.model,
    messages: buildMessages(request),
    temperature: request.temperature ?? defaults.temperature,
    max_tokens: request.maxTokens ?? defaults.maxTokens
  };
}

function buildMessages(request: LlmRequest): ChatMessage[] {
  if (request.systemPrompt !== undefined) {
    return [
      { role: "system", content: request.systemPrompt },
      { role: "user", content: request.prompt }
    ];
  }

  return [{ role: "user", content: request.prompt }];
}
