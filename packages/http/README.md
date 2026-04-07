# @judgy-ts/http

Generic HTTP provider for Judgy TypeScript.

`@judgy-ts/http` implements the `LlmProvider` contract from `@judgy-ts/core` for text-producing HTTP endpoints. It is useful when you want Judgy to call a custom gateway, wrapper, or service without writing a provider from scratch.

## Installation

```bash
npm install @judgy-ts/core @judgy-ts/http
```

## What This Package Contains

- `HttpProvider`
- `HttpProviderOptions`

## Usage

```ts
import { SemanticEvaluator } from "@judgy-ts/core";
import { HttpProvider } from "@judgy-ts/http";

const provider = new HttpProvider({
  endpoint: "http://localhost:3000/judge",
  requestTemplate: "{\"prompt\":\"{{prompt}}\"}",
  responseJsonPath: "$.response"
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
