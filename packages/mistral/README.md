# @judgy-ts/mistral

Mistral provider for Judgy TypeScript.

`@judgy-ts/mistral` implements the `LlmProvider` contract from `@judgy-ts/core` using Mistral chat completions, so you can use Mistral models as the semantic judge in Judgy evaluations.

## Installation

```bash
npm install @judgy-ts/core @judgy-ts/mistral
```

## What This Package Contains

- `MistralProvider`
- `MistralProviderOptions`

## Usage

```ts
import { SemanticEvaluator } from "@judgy-ts/core";
import { MistralProvider } from "@judgy-ts/mistral";

const provider = new MistralProvider({
  apiKey: process.env.MISTRAL_API_KEY!,
  model: "mistral-medium-latest"
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
