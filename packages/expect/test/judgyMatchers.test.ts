import { describe, expect, it } from "@jest/globals";

import {
  EvaluationEvidence,
  EvaluationResult
} from "@judgy-ts/core";

import {
  judgyMatchers,
  type SemanticEvaluatorLike
} from "../src/index.js";

expect.extend(judgyMatchers);

const ANY_VALID_ACTUAL_OUTPUT = "The capital of France is Paris.";
const ANY_VALID_EXPECTATION = "The answer identifies Paris as the capital of France";

class FakeEvaluator implements SemanticEvaluatorLike {
  public calls: Array<{
    actualOutput: string;
    expectation: string;
    signal?: AbortSignal;
  }> = [];

  private readonly result: EvaluationResult;

  public constructor(confidence: number, reasoning = "The answer clearly identifies Paris.") {
    this.result = new EvaluationResult({
      evidence: new EvaluationEvidence({
        confidence,
        reasoning,
        evaluatorName: "SemanticEvaluator"
      }),
      actualOutput: ANY_VALID_ACTUAL_OUTPUT,
      expectation: ANY_VALID_EXPECTATION,
      evaluationDurationMs: 120
    });
  }

  public async evaluate(
    actualOutput: string,
    expectation: string,
    options?: { signal?: AbortSignal }
  ): Promise<EvaluationResult> {
    this.calls.push({
      actualOutput,
      expectation,
      signal: options?.signal
    });

    return this.result;
  }
}

describe("@judgy-ts/expect", () => {
  it("passes a semantic match when the evaluation satisfies the minimum score", async () => {
    const evaluator = new FakeEvaluator(0.92);

    await expect({
      evaluator,
      actualOutput: ANY_VALID_ACTUAL_OUTPUT,
      expectation: ANY_VALID_EXPECTATION
    }).toJudgy({ minimumScore: 0.70 });
  });

  it("fails a semantic match with the formatted failure message", async () => {
    const evaluator = new FakeEvaluator(0.42, "The answer does not mention Paris.");

    await expect(expect({
      evaluator,
      actualOutput: ANY_VALID_ACTUAL_OUTPUT,
      expectation: ANY_VALID_EXPECTATION
    }).toJudgy({ minimumScore: 0.70 })).rejects.toThrow(
      "Judgy semantic assertion failed."
    );
  });

  it("supports .not for semantic matches", async () => {
    const evaluator = new FakeEvaluator(0.25, "The answer is incorrect.");

    await expect({
      evaluator,
      actualOutput: ANY_VALID_ACTUAL_OUTPUT,
      expectation: ANY_VALID_EXPECTATION
    }).not.toJudgy({ minimumScore: 0.70 });
  });

  it("forwards AbortSignal to the evaluator", async () => {
    const controller = new AbortController();
    const evaluator = new FakeEvaluator(0.92);

    await expect({
      evaluator,
      actualOutput: ANY_VALID_ACTUAL_OUTPUT,
      expectation: ANY_VALID_EXPECTATION
    }).toJudgy({
      minimumScore: 0.70,
      signal: controller.signal
    });

    expect(evaluator.calls).toHaveLength(1);
    expect(evaluator.calls[0]?.signal).toBe(controller.signal);
  });

  it("validates the semantic matcher subject shape", async () => {
    await expect(expect("not-an-object").toJudgy()).rejects.toThrow(
      "Expected an object with evaluator, actualOutput, and expectation."
    );
  });

  it("passes score assertions", () => {
    expect(0.90).toHaveJudgyScore(0.70);
    expect(0.45).not.toHaveJudgyScore(0.70);
  });

  it("fails score assertions with the formatted failure message", () => {
    expect(() => {
      expect(0.45).toHaveJudgyScore(0.70);
    }).toThrow("Judgy score assertion failed.");
  });

  it("passes duration assertions", () => {
    expect(80).toBeWithinJudgyDuration(100);
    expect(120).not.toBeWithinJudgyDuration(100);
  });

  it("fails duration assertions with the formatted failure message", () => {
    expect(() => {
      expect(120).toBeWithinJudgyDuration(100);
    }).toThrow("Judgy duration assertion failed.");
  });
});
