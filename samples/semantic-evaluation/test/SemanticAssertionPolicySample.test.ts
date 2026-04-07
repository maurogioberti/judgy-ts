import {
  evaluateSemanticAssertion,
  formatAssertionFailureMessage
} from "@judgy/core";
import { describe, it } from "@jest/globals";

import {
  buildQuestionRequest,
  createJudgeEvaluator,
  createSourceProvider
} from "../src/support.js";

const PROMPT = "What is the capital of France?";
const EXPECTATION = "The answer identifies Paris as the capital of France";
const MINIMUM_SCORE = 0.70;

describe("semantic-evaluation sample", () => {
  it("evaluating rag answer passes semantic policy", async () => {
    const source = createSourceProvider();
    const evaluator = createJudgeEvaluator();

    const response = await source.complete(buildQuestionRequest(PROMPT));
    const result = await evaluator.evaluate(response.text, EXPECTATION);
    const decision = evaluateSemanticAssertion(result, { minimumScore: MINIMUM_SCORE });

    if (!decision.succeeded) {
      throw new Error(formatAssertionFailureMessage(decision.failure!));
    }
  });
});
