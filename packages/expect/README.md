# @judgy-ts/expect

High-level `expect(...)` matchers for semantic testing with Judgy TypeScript.

`@judgy-ts/expect` builds on `@judgy-ts/core` and adds matchers for semantic assertions, minimum score checks, and duration checks in Jest-compatible test runners.

## Installation

```bash
npm install @judgy-ts/core @judgy-ts/expect expect
```

Install Jest or Vitest in your test project as usual.

## What This Package Contains

- `judgyMatchers`
- matcher contracts used by the Judgy `expect(...)` integration
- support for `toJudgy`, `toHaveJudgyScore`, and `toBeWithinJudgyDuration`

## Usage

```ts
import { expect } from "@jest/globals";
import { judgyMatchers } from "@judgy-ts/expect";

expect.extend(judgyMatchers);

const evaluator = {
  async evaluate() {
    return {
      evidence: {
        confidence: 0.95,
        reasoning: "The answer clearly mentions the refund deadline.",
        evaluatorName: "SemanticEvaluator"
      },
      actualOutput: "You can request a refund within 30 days of purchase.",
      expectation: "The answer should mention the refund deadline.",
      evaluationDurationMs: 120
    };
  }
};

await expect({
  evaluator,
  actualOutput: "You can request a refund within 30 days of purchase.",
  expectation: "The answer should mention the refund deadline."
}).toJudgy({ minimumScore: 0.8 });
```

## Related Packages

- `@judgy-ts/core` provides the evaluator and assertion primitives behind the matchers
- provider packages such as `@judgy-ts/openai`, `@judgy-ts/ollama`, and `@judgy-ts/http` can be used with a real `SemanticEvaluator`

## Repository

- https://github.com/maurogioberti/judgy-ts
