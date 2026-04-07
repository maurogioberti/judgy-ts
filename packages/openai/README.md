# @judgy-ts/openai

OpenAI provider for Judgy TypeScript.

`@judgy-ts/openai` implements the `LlmProvider` contract from `@judgy-ts/core` using OpenAI chat completions, so you can use OpenAI models as the semantic judge in Judgy evaluations.

## Installation

```bash
npm install @judgy-ts/core @judgy-ts/openai
```

## What This Package Contains

- `OpenAiProvider`
- `OpenAiProviderOptions`

## Usage

```ts
import { SemanticEvaluator } from "@judgy-ts/core";
import { OpenAiProvider } from "@judgy-ts/openai";

const provider = new OpenAiProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o"
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
