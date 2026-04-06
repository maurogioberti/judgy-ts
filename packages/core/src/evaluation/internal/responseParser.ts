import { EvaluationEvidence } from "../EvaluationEvidence.js";

const FALLBACK_REASONING = "No reasoning provided by the evaluator.";
const MISSING_CONFIDENCE_REASONING = "Response did not contain a valid confidence value.";
const PARSE_FAILURE_REASONING = "Failed to parse evaluator response as JSON.";

export function parseEvaluationEvidence(
  responseText: string,
  evaluatorName: string
): EvaluationEvidence {
  try {
    const text = stripCodeFences(responseText);
    const parsed = JSON.parse(text);

    if (!isRecord(parsed)) {
      throw new Error("Evaluator response must be a JSON object.");
    }

    const rawConfidence = getCaseInsensitiveValue(parsed, "confidence");

    if (typeof rawConfidence !== "number" || Number.isNaN(rawConfidence) || !Number.isFinite(rawConfidence)) {
      return createDegradedEvidence(MISSING_CONFIDENCE_REASONING, evaluatorName);
    }

    const confidence = Math.min(1.0, Math.max(0.0, rawConfidence));
    const rawReasoning = getCaseInsensitiveValue(parsed, "reasoning");
    const reasoning = typeof rawReasoning === "string" && rawReasoning.trim().length > 0
      ? rawReasoning
      : FALLBACK_REASONING;

    return new EvaluationEvidence({
      confidence,
      reasoning,
      evaluatorName
    });
  }
  catch {
    return createDegradedEvidence(PARSE_FAILURE_REASONING, evaluatorName);
  }
}

function createDegradedEvidence(reasoning: string, evaluatorName: string): EvaluationEvidence {
  return new EvaluationEvidence({
    confidence: 0.0,
    reasoning,
    evaluatorName
  });
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();

  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  const firstNewline = trimmed.indexOf("\n");

  if (firstNewline < 0) {
    return trimmed;
  }

  let content = trimmed.slice(firstNewline + 1);
  const lastFence = content.lastIndexOf("```");

  if (lastFence >= 0) {
    content = content.slice(0, lastFence);
  }

  return content.trim();
}

function getCaseInsensitiveValue(
  values: Record<string, unknown>,
  key: string
): unknown {
  const matchingKey = Object.keys(values).find(
    (existingKey) => existingKey.toLowerCase() === key.toLowerCase()
  );

  return matchingKey === undefined ? undefined : values[matchingKey];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
