import {
  evaluateDurationAssertion,
  evaluateScoreAssertion,
  evaluateSemanticAssertion,
  formatAssertionFailureMessage
} from "@judgy/core";
import type { MatcherContext } from "expect";

import type { JudgySemanticMatcherOptions } from "./contracts.js";
import { assertNumber, assertSemanticExpectation } from "./internal/assertions.js";
import {
  createDurationNegatedMessage,
  createScoreNegatedMessage,
  createSemanticNegatedMessage
} from "./internal/messages.js";

interface SyncMatcherResult {
  readonly pass: boolean;
  readonly message: () => string;
}

export const judgyMatchers = {
  async toJudgy(
    this: MatcherContext,
    received: unknown,
    options?: JudgySemanticMatcherOptions
  ): Promise<SyncMatcherResult> {
    const subject = assertSemanticExpectation(received);
    const evaluationOptions = options?.signal === undefined
      ? undefined
      : { signal: options.signal };
    const result = await subject.evaluator.evaluate(
      subject.actualOutput,
      subject.expectation,
      evaluationOptions
    );
    const decision = evaluateSemanticAssertion(result, options);

    if (decision.succeeded) {
      return {
        pass: true,
        message: () => createSemanticNegatedMessage(
          subject,
          result,
          options?.minimumScore ?? 0.70
        )
      };
    }

    return {
      pass: false,
      message: () => formatAssertionFailureMessage(decision.failure!)
    };
  },

  toHaveJudgyScore(
    this: MatcherContext,
    received: unknown,
    minimumScore: number
  ): SyncMatcherResult {
    const score = assertNumber(received, "Score is required.");
    const decision = evaluateScoreAssertion(score, minimumScore);

    if (decision.succeeded) {
      return {
        pass: true,
        message: () => createScoreNegatedMessage(score, minimumScore)
      };
    }

    return {
      pass: false,
      message: () => formatAssertionFailureMessage(decision.failure!)
    };
  },

  toBeWithinJudgyDuration(
    this: MatcherContext,
    received: unknown,
    maximumDurationMs: number
  ): SyncMatcherResult {
    const durationMs = assertNumber(received, "Duration is required.");
    const decision = evaluateDurationAssertion(durationMs, maximumDurationMs);

    if (decision.succeeded) {
      return {
        pass: true,
        message: () => createDurationNegatedMessage(durationMs, maximumDurationMs)
      };
    }

    return {
      pass: false,
      message: () => formatAssertionFailureMessage(decision.failure!)
    };
  }
};
