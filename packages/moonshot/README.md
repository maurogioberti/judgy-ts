# @judgy-ts/moonshot

Moonshot provider for Judgy TypeScript.

`@judgy-ts/moonshot` implements the `LlmProvider` contract from `@judgy-ts/core` using Moonshot chat completions, so you can use Kimi models as the semantic judge in Judgy evaluations.

## Installation

```bash
npm install @judgy-ts/core @judgy-ts/moonshot
```

## What This Package Contains

- `MoonshotProvider`
- `MoonshotProviderOptions`

## Usage

```ts
import { SemanticEvaluator } from "@judgy-ts/core";
import { MoonshotProvider } from "@judgy-ts/moonshot";

const provider = new MoonshotProvider({
  apiKey: process.env.MOONSHOT_API_KEY!,
  model: "kimi-k2.5"
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
