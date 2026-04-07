# @judgy-ts/google

Google Gemini provider for Judgy TypeScript.

`@judgy-ts/google` implements the `LlmProvider` contract from `@judgy-ts/core` using the Gemini `generateContent` API, so you can evaluate outputs with Google models in Judgy.

## Installation

```bash
npm install @judgy-ts/core @judgy-ts/google
```

## What This Package Contains

- `GoogleProvider`
- `GoogleProviderOptions`

## Usage

```ts
import { SemanticEvaluator } from "@judgy-ts/core";
import { GoogleProvider } from "@judgy-ts/google";

const provider = new GoogleProvider({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "gemini-2.5-flash"
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
