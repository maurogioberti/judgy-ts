import { describe, expect, it } from "@jest/globals";

import { EvaluationEvidence } from "../../src/index.js";

describe("EvaluationEvidence", () => {
  it("sets properties when constructed with valid inputs", () => {
    const evidence = new EvaluationEvidence({
      confidence: 0.1,
      reasoning: "No match",
      evaluatorName: "SemanticEvaluator"
    });

    expect(evidence.confidence).toBe(0.1);
    expect(evidence.reasoning).toBe("No match");
    expect(evidence.evaluatorName).toBe("SemanticEvaluator");
  });

  it.each([0.0, 1.0])("accepts confidence at the boundary: %p", (confidence) => {
    const evidence = new EvaluationEvidence({
      confidence,
      reasoning: "Good match",
      evaluatorName: "SemanticEvaluator"
    });

    expect(evidence.confidence).toBe(confidence);
  });

  it.each([-0.1, 1.1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "throws when confidence is invalid: %p",
    (confidence) => {
      expect(() => new EvaluationEvidence({
        confidence,
        reasoning: "Good match",
        evaluatorName: "SemanticEvaluator"
      })).toThrow("Confidence must be within the supported inclusive range.");
    }
  );

  it.each([undefined, null, "", " ", "   ", "\t"])(
    "throws when reasoning is invalid: %o",
    (reasoning) => {
      expect(() => new EvaluationEvidence({
        confidence: 0.5,
        reasoning: reasoning as never,
        evaluatorName: "SemanticEvaluator"
      })).toThrow("Reasoning cannot be null or whitespace.");
    }
  );

  it.each([undefined, null, "", " ", "   ", "\t"])(
    "throws when evaluator name is invalid: %o",
    (evaluatorName) => {
      expect(() => new EvaluationEvidence({
        confidence: 0.5,
        reasoning: "Good match",
        evaluatorName: evaluatorName as never
      })).toThrow("EvaluatorName cannot be null or whitespace.");
    }
  );
});
