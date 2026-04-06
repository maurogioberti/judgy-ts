import { assertNonNegativeNumber, assertNumberInRange } from "../internal/validation.js";
import { EvaluationResult } from "../evaluation/EvaluationResult.js";
import type {
  AssertionDecision,
  AssertionFailureDetails,
  SemanticAssertionOptions
} from "./types.js";
import { DEFAULT_MINIMUM_SCORE } from "./types.js";

export function evaluateSemanticAssertion(
  result: EvaluationResult,
  options?: SemanticAssertionOptions
): AssertionDecision {
  if (!(result instanceof EvaluationResult)) {
    throw new TypeError("Result is required.");
  }

  const minimumScore = normalizeMinimumScore(options);

  if (result.evidence.confidence >= minimumScore) {
    return passDecision();
  }

  return failDecision({
    kind: "semantic",
    expectation: result.expectation,
    actualOutput: result.actualOutput,
    actualScore: result.evidence.confidence,
    minimumScore,
    reasoning: result.evidence.reasoning
  });
}

export function evaluateScoreAssertion(
  actualScore: number,
  minimumScore: number
): AssertionDecision {
  const validatedActualScore = assertNumberInRange(
    actualScore,
    0.0,
    1.0,
    "Score must be between 0.0 and 1.0 inclusive."
  );
  const validatedMinimumScore = assertNumberInRange(
    minimumScore,
    0.0,
    1.0,
    "Score must be between 0.0 and 1.0 inclusive."
  );

  if (validatedActualScore >= validatedMinimumScore) {
    return passDecision();
  }

  return failDecision({
    kind: "score",
    actualScore: validatedActualScore,
    minimumScore: validatedMinimumScore
  });
}

export function evaluateDurationAssertion(
  actualDurationMs: number,
  maximumDurationMs: number
): AssertionDecision {
  const validatedActualDurationMs = assertNonNegativeNumber(
    actualDurationMs,
    "Duration cannot be negative."
  );
  const validatedMaximumDurationMs = assertNonNegativeNumber(
    maximumDurationMs,
    "Duration cannot be negative."
  );

  if (validatedActualDurationMs <= validatedMaximumDurationMs) {
    return passDecision();
  }

  return failDecision({
    kind: "duration",
    actualDurationMs: validatedActualDurationMs,
    maximumDurationMs: validatedMaximumDurationMs
  });
}

function normalizeMinimumScore(options?: SemanticAssertionOptions): number {
  return assertNumberInRange(
    options?.minimumScore ?? DEFAULT_MINIMUM_SCORE,
    0.0,
    1.0,
    "MinimumScore must be between 0.0 and 1.0 inclusive."
  );
}

function passDecision(): AssertionDecision {
  return { succeeded: true };
}

function failDecision(failure: AssertionFailureDetails): AssertionDecision {
  return {
    succeeded: false,
    failure
  };
}
