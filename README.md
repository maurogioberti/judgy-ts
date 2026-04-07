# Judgy

Judgy is a family of TypeScript packages for semantic testing of AI and LLM output.

Instead of asserting on exact strings, Judgy lets you evaluate whether generated output satisfies an expectation and then fail with useful semantic evidence.

## Providers Are Optional

`@judgy-ts/core` defines the provider contract used by `SemanticEvaluator`:

- `LlmProvider`
- `LlmRequest`
- `LlmResponse`

That means the `@judgy-ts/*` provider packages are optional implementations. You can use the built-in providers for common model runtimes, or implement `LlmProvider` yourself if you want to connect Judgy to your own gateway, SDK, wrapper, or in-house service.

## Install The Packages You Need

Install the core package, add `@judgy-ts/expect` if you want high-level `expect(...)` matchers, and then choose the provider package that matches your model runtime:

```bash
npm install @judgy-ts/core @judgy-ts/expect

npm install @judgy-ts/http
npm install @judgy-ts/ollama
npm install @judgy-ts/openai
npm install @judgy-ts/anthropic
npm install @judgy-ts/google
npm install @judgy-ts/azure-openai
npm install @judgy-ts/mistral
npm install @judgy-ts/moonshot
npm install @judgy-ts/deepseek
```

If you already have your own LLM integration, you can skip the optional provider packages and implement `LlmProvider` directly.

## Packages

| Package | Purpose |
| --- | --- |
| `@judgy-ts/core` | Core evaluation models, provider contracts, and assertion policy primitives |
| `@judgy-ts/expect` | High-level `expect(...)` matchers for semantic testing |
| `@judgy-ts/http` | Optional generic HTTP provider for text-producing endpoints |
| `@judgy-ts/ollama` | Optional Ollama provider |
| `@judgy-ts/openai` | Optional OpenAI provider |
| `@judgy-ts/anthropic` | Optional Anthropic provider |
| `@judgy-ts/google` | Optional Google provider |
| `@judgy-ts/azure-openai` | Optional Azure OpenAI provider |
| `@judgy-ts/mistral` | Optional Mistral provider |
| `@judgy-ts/moonshot` | Optional Moonshot provider |
| `@judgy-ts/deepseek` | Optional DeepSeek provider |

## Quick Start With `expect(...)`

The example below uses `@judgy-ts/openai`, but the same evaluator flow works with any supported provider package.

```ts
import { SemanticEvaluator } from "@judgy-ts/core";
import { judgyMatchers } from "@judgy-ts/expect";
import { OpenAiProvider } from "@judgy-ts/openai";
import { expect } from "@jest/globals";

expect.extend(judgyMatchers);

const provider = new OpenAiProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o"
});

const evaluator = new SemanticEvaluator(provider);

await expect({
  evaluator,
  actualOutput,
  expectation: "The answer should mention refund deadlines"
}).toJudgy({ minimumScore: 0.8 });
```

## Quick Start With `@judgy-ts/core`

If you want lower-level control, use the evaluator and assertion policy directly:

```ts
import {
  SemanticEvaluator,
  evaluateSemanticAssertion
} from "@judgy-ts/core";
import { OpenAiProvider } from "@judgy-ts/openai";

const provider = new OpenAiProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o"
});

const evaluator = new SemanticEvaluator(provider);
const result = await evaluator.evaluate(
  actualOutput,
  "The answer should mention refund deadlines"
);

const decision = evaluateSemanticAssertion(result, { minimumScore: 0.8 });
```

## Custom Provider Example

If you do not want to use one of the optional provider packages, implement `LlmProvider` yourself:

```ts
import {
  LlmRequest,
  LlmResponse,
  type LlmProvider
} from "@judgy-ts/core";

class MyProvider implements LlmProvider {
  async complete(request: LlmRequest): Promise<LlmResponse> {
    const text = JSON.stringify({
      confidence: 0.95,
      reasoning: "Looks good."
    });

    return new LlmResponse({
      text,
      providerName: "MyProvider"
    });
  }
}
```

## How It Works

```text
LLM Provider -> SemanticEvaluator -> Evidence -> Assertion Policy -> Test Assertion
```

Judgy keeps provider calls, semantic evaluation, and assertion policy separate so tests stay readable while evaluation logic stays reusable.

## Samples

The repository includes runnable samples under [`samples/`](samples/README.md):

- `semantic-evaluation` shows the lower-level evaluator and assertion policy flow with `HttpProvider` as the source and `OllamaProvider` as the judge
- `expect-jest` shows `@judgy-ts/expect` with Jest
- `expect-vitest` shows `@judgy-ts/expect` with Vitest

All samples use `OllamaProvider` by default because it runs locally without a hosted API key. You can swap in any supported provider package as the judge.

## Status

Judgy is usable today and still evolving. Expect API and package refinements before a stable `1.0` release.

## License

MIT
