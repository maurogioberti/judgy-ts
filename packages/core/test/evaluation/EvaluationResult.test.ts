import { describe, expect, it } from "@jest/globals";

import { EvaluationEvidence, EvaluationResult } from "../../src/index.js";

describe("EvaluationResult", () => {
  it("sets properties when constructed with valid inputs", () => {
    const evidence = new EvaluationEvidence({
      confidence: 0.5,
      reasoning: "Good match",
      evaluatorName: "SemanticEvaluator"
    });
    const result = new EvaluationResult({
      evidence,
      actualOutput: "actual output",
      expectation: "expected output",
      evaluationDurationMs: 100
    });

    expect(result.evidence).toBe(evidence);
    expect(result.actualOutput).toBe("actual output");
    expect(result.expectation).toBe("expected output");
    expect(result.evaluationDurationMs).toBe(100);
  });

  it("throws when evidence is missing", () => {
    expect(() => new EvaluationResult({
      evidence: undefined as never,
      actualOutput: "actual output",
      expectation: "expected output",
      evaluationDurationMs: 100
    })).toThrow("Evidence is required.");
  });

  it.each([undefined, null, "", " ", "   ", "\t"])(
    "throws when actual output is invalid: %o",
    (actualOutput) => {
      const evidence = new EvaluationEvidence({
        confidence: 0.5,
        reasoning: "Good match",
        evaluatorName: "SemanticEvaluator"
      });

      expect(() => new EvaluationResult({
        evidence,
        actualOutput: actualOutput as never,
        expectation: "expected output",
        evaluationDurationMs: 100
      })).toThrow("ActualOutput cannot be null or whitespace.");
    }
  );

  it.each([undefined, null, "", " ", "   ", "\t"])(
    "throws when expectation is invalid: %o",
    (expectation) => {
      const evidence = new EvaluationEvidence({
        confidence: 0.5,
        reasoning: "Good match",
        evaluatorName: "SemanticEvaluator"
      });

      expect(() => new EvaluationResult({
        evidence,
        actualOutput: "actual output",
        expectation: expectation as never,
        evaluationDurationMs: 100
      })).toThrow("Expectation cannot be null or whitespace.");
    }
  );

  it("throws when evaluation duration is negative", () => {
    const evidence = new EvaluationEvidence({
      confidence: 0.5,
      reasoning: "Good match",
      evaluatorName: "SemanticEvaluator"
    });

    expect(() => new EvaluationResult({
      evidence,
      actualOutput: "actual output",
      expectation: "expected output",
      evaluationDurationMs: -1
    })).toThrow("EvaluationDurationMs cannot be negative.");
  });
});
