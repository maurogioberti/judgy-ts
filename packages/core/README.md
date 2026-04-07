# @judgy-ts/core

Core evaluation models, provider contracts, and assertion helpers for Judgy TypeScript.

`@judgy-ts/core` gives you the low-level building blocks for semantic testing of AI and LLM output. It includes the `LlmProvider` contract, the `SemanticEvaluator`, evaluation result models, and assertion policy helpers that higher-level packages build on top of.

## Installation

```bash
npm install @judgy-ts/core
```

## What This Package Contains

- `LlmProvider`, `LlmRequest`, and `LlmResponse` for integrating a judge model
- `SemanticEvaluator` for turning an output and expectation into an evaluation result
- `EvaluationEvidence` and `EvaluationResult` models
- `evaluateSemanticAssertion`, `evaluateScoreAssertion`, and `evaluateDurationAssertion` for pass/fail decisions
- `formatAssertionFailureMessage` for readable failure output

## Usage

```ts
import {
  LlmRequest,
  LlmResponse,
  SemanticEvaluator,
  evaluateSemanticAssertion,
  type LlmProvider
} from "@judgy-ts/core";

class InlineProvider implements LlmProvider {
  async complete(_request: LlmRequest): Promise<LlmResponse> {
    return new LlmResponse({
      text: JSON.stringify({
        confidence: 0.96,
        reasoning: "The answer clearly mentions the refund deadline."
      })
    });
  }
}

const evaluator = new SemanticEvaluator(new InlineProvider());
const result = await evaluator.evaluate(
  "You can request a refund within 30 days of purchase.",
  "The answer should mention the refund deadline."
);

const decision = evaluateSemanticAssertion(result, { minimumScore: 0.8 });

if (!decision.succeeded) {
  throw new Error("Semantic assertion failed.");
}
```

## Related Packages

- `@judgy-ts/expect` adds higher-level `expect(...)` matchers for Jest and Vitest
- provider packages such as `@judgy-ts/openai`, `@judgy-ts/ollama`, and `@judgy-ts/http` implement `LlmProvider` for common runtimes

## Repository

- https://github.com/maurogioberti/judgy-ts
