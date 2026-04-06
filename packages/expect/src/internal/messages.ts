import type { EvaluationResult } from "@judgy/core";

import type { JudgySemanticExpectation } from "../contracts.js";

export function createSemanticNegatedMessage(
  subject: JudgySemanticExpectation,
  result: EvaluationResult,
  minimumScore: number
): string {
  return [
    "Expected semantic evaluation not to satisfy the Judgy assertion.",
    "",
    `  Expectation  : ${subject.expectation}`,
    `  Actual       : ${subject.actualOutput}`,
    `  Score        : ${result.evidence.confidence.toFixed(2)}`,
    `  MinimumScore : ${minimumScore.toFixed(2)}`,
    `  Reasoning    : ${result.evidence.reasoning}`
  ].join("\n");
}

export function createScoreNegatedMessage(
  score: number,
  minimumScore: number
): string {
  return [
    "Expected score not to satisfy the Judgy minimum.",
    "",
    `  Score        : ${score.toFixed(2)}`,
    `  MinimumScore : ${minimumScore.toFixed(2)}`
  ].join("\n");
}

export function createDurationNegatedMessage(
  durationMs: number,
  maximumDurationMs: number
): string {
  return [
    "Expected duration not to be within the Judgy maximum.",
    "",
    `  DurationMs        : ${durationMs}`,
    `  MaximumDurationMs : ${maximumDurationMs}`
  ].join("\n");
}
