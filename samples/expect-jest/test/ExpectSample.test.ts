import {
  describe,
  expect,
  it
} from "@jest/globals";
import { judgyMatchers } from "@judgy/expect";

import {
  createJudgeEvaluator,
  getMaximumDurationMs
} from "../src/support.js";

expect.extend(judgyMatchers);

const ANSWER = "The capital of France is Paris.";
const EXPECTATION = "The answer identifies Paris as the capital of France";
const MINIMUM_SCORE = 0.70;

describe("expect-jest sample", () => {
  it("evaluating a valid answer passes the semantic matcher", async () => {
    const evaluator = createJudgeEvaluator();

    await expect({
      evaluator,
      actualOutput: ANSWER,
      expectation: EXPECTATION
    }).toJudgy({ minimumScore: MINIMUM_SCORE });
  });

  it("evaluating a valid answer score exceeds the minimum", async () => {
    const evaluator = createJudgeEvaluator();
    const result = await evaluator.evaluate(ANSWER, EXPECTATION);

    expect(result.evidence.confidence).toHaveJudgyScore(MINIMUM_SCORE);
  });

  it("evaluating a valid answer duration is within the limit", async () => {
    const evaluator = createJudgeEvaluator();
    const result = await evaluator.evaluate(ANSWER, EXPECTATION);

    expect(result.evaluationDurationMs).toBeWithinJudgyDuration(getMaximumDurationMs());
  });
});
