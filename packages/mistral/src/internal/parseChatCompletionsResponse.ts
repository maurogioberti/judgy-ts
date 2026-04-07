import { LlmResponse } from "@judgy-ts/core";

const PROVIDER_NAME = "Mistral";

export function parseChatCompletionsResponse(payload: unknown): LlmResponse {
  if (!isRecord(payload)) {
    throw new Error("Mistral returned an empty response payload.");
  }

  const choices = payload.choices;

  if (!Array.isArray(choices) || choices.length === 0) {
    throw new Error("Mistral response did not contain message content.");
  }

  const firstChoice = choices[0];

  if (!isRecord(firstChoice) || !isRecord(firstChoice.message) || typeof firstChoice.message.content !== "string") {
    throw new Error("Mistral response did not contain message content.");
  }

  const usage = isRecord(payload.usage) ? payload.usage : undefined;
  const responseArgs: {
    text: string;
    providerName: string;
    promptTokens?: number;
    completionTokens?: number;
  } = {
    text: firstChoice.message.content,
    providerName: PROVIDER_NAME
  };

  if (typeof usage?.prompt_tokens === "number") {
    responseArgs.promptTokens = usage.prompt_tokens;
  }

  if (typeof usage?.completion_tokens === "number") {
    responseArgs.completionTokens = usage.completion_tokens;
  }

  return new LlmResponse(responseArgs);
}

function isRecord(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
