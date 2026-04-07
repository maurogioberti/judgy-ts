# @judgy-ts/ollama

Ollama provider for Judgy TypeScript.

`@judgy-ts/ollama` implements the `LlmProvider` contract from `@judgy-ts/core` for local or hosted Ollama instances, so you can run semantic evaluations without depending on a hosted API key.

## Installation

```bash
npm install @judgy-ts/core @judgy-ts/ollama
```

## What This Package Contains

- `OllamaProvider`
- `OllamaProviderOptions`

## Usage

```ts
import { SemanticEvaluator } from "@judgy-ts/core";
import { OllamaProvider } from "@judgy-ts/ollama";

const provider = new OllamaProvider({
  baseUrl: "http://localhost:11434",
  model: "llama3:8b"
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
