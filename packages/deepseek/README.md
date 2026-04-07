# @judgy-ts/deepseek

DeepSeek provider for Judgy TypeScript.

`@judgy-ts/deepseek` implements the `LlmProvider` contract from `@judgy-ts/core` using DeepSeek chat completions, so you can use DeepSeek models as the semantic judge in Judgy evaluations.

## Installation

```bash
npm install @judgy-ts/core @judgy-ts/deepseek
```

## What This Package Contains

- `DeepSeekProvider`
- `DeepSeekProviderOptions`

## Usage

```ts
import { SemanticEvaluator } from "@judgy-ts/core";
import { DeepSeekProvider } from "@judgy-ts/deepseek";

const provider = new DeepSeekProvider({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  model: "deepseek-chat"
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
