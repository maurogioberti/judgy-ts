import { LlmResponse } from "@judgy-ts/core";

const PROVIDER_NAME = "Ollama";

export function parseChatResponse(payload: unknown): LlmResponse {
  if (!isRecord(payload)) {
    throw new Error("Ollama returned an empty response payload.");
  }

  if (!isRecord(payload.message) || typeof payload.message.content !== "string") {
    throw new Error("Ollama response did not contain message content.");
  }

  const responseArgs: {
    text: string;
    providerName: string;
    promptTokens?: number;
    completionTokens?: number;
  } = {
    text: payload.message.content,
    providerName: PROVIDER_NAME
  };

  if (typeof payload.prompt_eval_count === "number") {
    responseArgs.promptTokens = payload.prompt_eval_count;
  }

  if (typeof payload.eval_count === "number") {
    responseArgs.completionTokens = payload.eval_count;
  }

  return new LlmResponse(responseArgs);
}

function isRecord(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
