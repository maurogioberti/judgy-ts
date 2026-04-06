import { describe, expect, it } from "@jest/globals";

import {
  DEFAULT_MINIMUM_SCORE,
  EvaluationEvidence,
  EvaluationResult,
  evaluateDurationAssertion,
  evaluateScoreAssertion,
  evaluateSemanticAssertion,
  formatAssertionFailureMessage
} from "../../src/index.js";

function makeResult(confidence: number): EvaluationResult {
  return new EvaluationResult({
    evidence: new EvaluationEvidence({
      confidence,
      reasoning: "Some reasoning",
      evaluatorName: "SemanticEvaluator"
    }),
    actualOutput: "actual output",
    expectation: "expected output",
    evaluationDurationMs: 100
  });
}

describe("semantic assertion policy", () => {
  it("passes when confidence exceeds the minimum score", () => {
    const decision = evaluateSemanticAssertion(makeResult(0.9), { minimumScore: 0.7 });

    expect(decision).toEqual({ succeeded: true });
  });

  it("passes when confidence equals the minimum score", () => {
    const decision = evaluateSemanticAssertion(makeResult(0.7), { minimumScore: 0.7 });

    expect(decision).toEqual({ succeeded: true });
  });

  it("fails with semantic details when confidence is below the minimum score", () => {
    const decision = evaluateSemanticAssertion(makeResult(0.5), { minimumScore: 0.7 });

    expect(decision.succeeded).toBe(false);
    expect(decision.failure).toEqual({
      kind: "semantic",
      expectation: "expected output",
      actualOutput: "actual output",
      actualScore: 0.5,
      minimumScore: 0.7,
      reasoning: "Some reasoning"
    });
  });

  it("uses the default minimum score when options are not provided", () => {
    const decision = evaluateSemanticAssertion(makeResult(0.6));

    expect(decision.succeeded).toBe(false);
    expect(decision.failure?.minimumScore).toBe(DEFAULT_MINIMUM_SCORE);
  });

  it("throws when the result is missing", () => {
    expect(() => evaluateSemanticAssertion(undefined as never)).toThrow("Result is required.");
  });
});

describe("metric assertion policy", () => {
  it("passes score assertions when actual score exceeds the minimum", () => {
    expect(evaluateScoreAssertion(0.9, 0.7)).toEqual({ succeeded: true });
  });

  it("fails score assertions with narrow numeric details", () => {
    const decision = evaluateScoreAssertion(0.45, 0.8);

    expect(decision).toEqual({
      succeeded: false,
      failure: {
        kind: "score",
        actualScore: 0.45,
        minimumScore: 0.8
      }
    });
  });

  it("throws when score values are invalid", () => {
    expect(() => evaluateScoreAssertion(-0.1, 0.7)).toThrow(
      "Score must be between 0.0 and 1.0 inclusive."
    );
    expect(() => evaluateScoreAssertion(0.5, 1.1)).toThrow(
      "Score must be between 0.0 and 1.0 inclusive."
    );
  });

  it("passes duration assertions when actual duration is within the maximum", () => {
    expect(evaluateDurationAssertion(1_000, 2_000)).toEqual({ succeeded: true });
  });

  it("fails duration assertions with duration-only details", () => {
    const decision = evaluateDurationAssertion(5_230, 2_000);

    expect(decision).toEqual({
      succeeded: false,
      failure: {
        kind: "duration",
        actualDurationMs: 5_230,
        maximumDurationMs: 2_000
      }
    });
  });

  it("throws when durations are negative", () => {
    expect(() => evaluateDurationAssertion(-1, 2_000)).toThrow("Duration cannot be negative.");
    expect(() => evaluateDurationAssertion(1_000, -1)).toThrow("Duration cannot be negative.");
  });
});

describe("assertion failure message formatting", () => {
  it("formats semantic failures", () => {
    const message = formatAssertionFailureMessage({
      kind: "semantic",
      expectation: "A polite greeting",
      actualOutput: "ERROR: 503 Service Unavailable",
      actualScore: 0.12,
      minimumScore: 0.7,
      reasoning: "The actual output is an HTTP error message, not a greeting."
    });

    expect(message).toContain("Judgy semantic assertion failed.");
    expect(message).toContain("Expectation  : A polite greeting");
    expect(message).toContain("Actual       : ERROR: 503 Service Unavailable");
    expect(message).toContain("Score        : 0.12");
    expect(message).toContain("MinimumScore : 0.70");
    expect(message).toContain("Reasoning    : The actual output is an HTTP error message, not a greeting.");
  });

  it("formats score failures", () => {
    const message = formatAssertionFailureMessage({
      kind: "score",
      actualScore: 0.45,
      minimumScore: 0.8
    });

    expect(message).toContain("Judgy score assertion failed.");
    expect(message).toContain("Score        : 0.45");
    expect(message).toContain("MinimumScore : 0.80");
    expect(message).not.toContain("Expectation");
    expect(message).not.toContain("DurationMs");
  });

  it("formats duration failures", () => {
    const message = formatAssertionFailureMessage({
      kind: "duration",
      actualDurationMs: 5_230,
      maximumDurationMs: 2_000
    });

    expect(message).toContain("Judgy duration assertion failed.");
    expect(message).toContain("DurationMs");
    expect(message).toContain("MaximumDurationMs");
    expect(message).not.toContain("MinimumScore");
  });

  it("throws when the failure is missing", () => {
    expect(() => formatAssertionFailureMessage(undefined as never)).toThrow("Failure is required.");
  });
});
