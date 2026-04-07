# TypeScript Samples

These samples show the two intended TypeScript usage styles for Judgy:

1. The standard high-level pattern: `@judgy/expect`
2. The lower-level semantic pattern: `SemanticEvaluator` plus core semantic policy

Judgy itself is not tied to any specific testing library. The high-level package is `@judgy/expect`, not a Jest- or Vitest-specific package. We include two equivalent `expect(...)` samples only to show that the same high-level Judgy API can be used with both runners.

## High-level expect pattern

These two samples use the same Paris scenario, the same `OllamaProvider` judge setup, and the same `@judgy/expect` matchers. The only difference is the test runner wiring:

- `expect-jest/`
  - uses Jest with `expect.extend(judgyMatchers)`
  - run with `pnpm --filter @judgy/sample-expect-jest test`

- `expect-vitest/`
  - uses Vitest with `expect.extend(judgyMatchers)`
  - run with `pnpm --filter @judgy/sample-expect-vitest test`

The matcher flow is the same in both cases:

```text
hardcoded answer -> SemanticEvaluator (OllamaProvider) -> expect.extend(judgyMatchers) -> toJudgy / toHaveJudgyScore / toBeWithinJudgyDuration
```

This is the TypeScript equivalent of the higher-level .NET sample story, but expressed in the idiomatic `expect(...)` style.

## Semantic evaluation pattern

`semantic-evaluation/` is the lower-level alternative if you do not want to use the standard `expect(...)` pattern.

- calls a source system via `HttpProvider`
- evaluates the answer with `OllamaProvider` as judge
- uses `SemanticEvaluator` and `evaluateSemanticAssertion(...)` directly
- run with `pnpm --filter @judgy/sample-semantic-evaluation test`

Flow:

```text
HttpProvider (source) -> answer -> SemanticEvaluator (OllamaProvider judge) -> EvaluationResult -> evaluateSemanticAssertion(...)
```

## Configuration

All samples default to local Ollama:

- base URL: `http://localhost:11434`
- model: `llama3:8b`

The semantic sample also defaults its source endpoint to:

- source endpoint: `http://localhost:11434/api/chat`
- source response path: `$.message.content`

Each sample package keeps its own `sample.config.json` and small `src/` helpers so you can swap in your own judge or source system later.

## Notes

- Ollama is used in the samples because it is free, local, and does not require an API key.
- Any supported provider can replace `OllamaProvider`.
- The sample tests expect Ollama to be available locally.
