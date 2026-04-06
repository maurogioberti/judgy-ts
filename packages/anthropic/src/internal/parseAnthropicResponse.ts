import { LlmResponse } from "@judgy/core";

const PROVIDER_NAME = "Anthropic";

export function parseAnthropicResponse(payload: unknown): LlmResponse {
  if (!isRecord(payload)) {
    throw new Error("Anthropic returned an empty response payload.");
  }

  const content = payload.content;

  if (!Array.isArray(content)) {
    throw new Error("Anthropic response did not contain text content.");
  }

  const textBlock = content.find((block) =>
    isRecord(block)
    && typeof block.type === "string"
    && block.type.toLowerCase() === "text"
    && typeof block.text === "string"
    && block.text.trim().length > 0
  );

  if (!isRecord(textBlock) || typeof textBlock.text !== "string") {
    throw new Error("Anthropic response did not contain text content.");
  }

  const usage = isRecord(payload.usage) ? payload.usage : undefined;
  const responseArgs: {
    text: string;
    providerName: string;
    promptTokens?: number;
    completionTokens?: number;
  } = {
    text: textBlock.text,
    providerName: PROVIDER_NAME
  };

  if (typeof usage?.input_tokens === "number") {
    responseArgs.promptTokens = usage.input_tokens;
  }

  if (typeof usage?.output_tokens === "number") {
    responseArgs.completionTokens = usage.output_tokens;
  }

  return new LlmResponse(responseArgs);
}

function isRecord(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
