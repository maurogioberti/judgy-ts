# @judgy-ts/anthropic

Anthropic provider for Judgy TypeScript.

`@judgy-ts/anthropic` implements the `LlmProvider` contract from `@judgy-ts/core` using Anthropic's Messages API, so you can use Claude models as the semantic judge in Judgy evaluations.

## Installation

```bash
npm install @judgy-ts/core @judgy-ts/anthropic
```

## What This Package Contains

- `AnthropicProvider`
- `AnthropicProviderOptions`

## Usage

```ts
import { SemanticEvaluator } from "@judgy-ts/core";
import { AnthropicProvider } from "@judgy-ts/anthropic";

const provider = new AnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: "claude-sonnet-4-20250514"
});

const evaluator = new SemanticEvaluator(provider);
const result = await evaluator.evaluate(
  "You can request a refund within 30 days of purchase.",
  "The answer should mention the refund deadline."
);
```

## Related Packages

- `@judgy-ts/core` provides `SemanticEvaluator`, `LlmRequest`, and `LlmProvider`
- `@judgy-ts/expect` adds higher-level `expect(...)` matchers

## Repository

- https://github.com/maurogioberti/judgy-ts
