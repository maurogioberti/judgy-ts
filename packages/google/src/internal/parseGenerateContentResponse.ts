import { LlmResponse } from "@judgy-ts/core";

const PROVIDER_NAME = "Google";

export function parseGenerateContentResponse(payload: unknown): LlmResponse {
  if (!isRecord(payload)) {
    throw new Error("Google returned an empty response payload.");
  }

  const candidates = payload.candidates;

  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new Error("Google response did not contain text content.");
  }

  const firstCandidate = candidates[0];

  if (!isRecord(firstCandidate) || !isRecord(firstCandidate.content) || !Array.isArray(firstCandidate.content.parts)) {
    throw new Error("Google response did not contain text content.");
  }

  const firstPart = firstCandidate.content.parts[0];

  if (!isRecord(firstPart) || typeof firstPart.text !== "string" || firstPart.text.trim().length === 0) {
    throw new Error("Google response did not contain text content.");
  }

  const usage = isRecord(payload.usageMetadata) ? payload.usageMetadata : undefined;
  const responseArgs: {
    text: string;
    providerName: string;
    promptTokens?: number;
    completionTokens?: number;
  } = {
    text: firstPart.text,
    providerName: PROVIDER_NAME
  };

  if (typeof usage?.promptTokenCount === "number") {
    responseArgs.promptTokens = usage.promptTokenCount;
  }

  if (typeof usage?.candidatesTokenCount === "number") {
    responseArgs.completionTokens = usage.candidatesTokenCount;
  }

  return new LlmResponse(responseArgs);
}

function isRecord(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
