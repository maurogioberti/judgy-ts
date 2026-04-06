import { type LlmRequest } from "@judgy/core";

interface ChatMessage {
  readonly role: "system" | "user";
  readonly content: string;
}

export function buildChatRequestBody(
  request: LlmRequest,
  model: string
): Record<string, unknown> {
  return {
    model,
    stream: false,
    messages: buildMessages(request)
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
