# Judgy

Judgy is a family of TypeScript packages for semantic testing of AI and LLM output.

Instead of asserting on exact strings, Judgy lets you evaluate whether generated output satisfies an expectation and then fail with useful semantic evidence.

## Providers Are Optional

`@judgy/core` defines the provider contract used by `SemanticEvaluator`:

- `LlmProvider`
- `LlmRequest`
- `LlmResponse`

That means the `@judgy/*` provider packages are optional implementations. You can use the built-in providers for common model runtimes, or implement `LlmProvider` yourself if you want to connect Judgy to your own gateway, SDK, wrapper, or in-house service.

## Install The Packages You Need

Install the core package, add `@judgy/expect` if you want high-level `expect(...)` matchers, and then choose the provider package that matches your model runtime:

```bash
npm install @judgy/core @judgy/expect

npm install @judgy/http
npm install @judgy/ollama
npm install @judgy/openai
npm install @judgy/anthropic
npm install @judgy/google
npm install @judgy/azure-openai
npm install @judgy/mistral
npm install @judgy/moonshot
npm install @judgy/deepseek
```

If you already have your own LLM integration, you can skip the optional provider packages and implement `LlmProvider` directly.

## Packages

| Package | Purpose |
| --- | --- |
| `@judgy/core` | Core evaluation models, provider contracts, and assertion policy primitives |
| `@judgy/expect` | High-level `expect(...)` matchers for semantic testing |
| `@judgy/http` | Optional generic HTTP provider for text-producing endpoints |
| `@judgy/ollama` | Optional Ollama provider |
| `@judgy/openai` | Optional OpenAI provider |
| `@judgy/anthropic` | Optional Anthropic provider |
| `@judgy/google` | Optional Google provider |
| `@judgy/azure-openai` | Optional Azure OpenAI provider |
| `@judgy/mistral` | Optional Mistral provider |
| `@judgy/moonshot` | Optional Moonshot provider |
| `@judgy/deepseek` | Optional DeepSeek provider |

## Quick Start With `expect(...)`

The example below uses `@judgy/openai`, but the same evaluator flow works with any supported provider package.

```ts
import { SemanticEvaluator } from "@judgy/core";
import { judgyMatchers } from "@judgy/expect";
import { OpenAiProvider } from "@judgy/openai";
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

## Quick Start With `@judgy/core`

If you want lower-level control, use the evaluator and assertion policy directly:

```ts
import {
  SemanticEvaluator,
  evaluateSemanticAssertion
} from "@judgy/core";
import { OpenAiProvider } from "@judgy/openai";

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
} from "@judgy/core";

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

The repository includes runnable samples under `samples/`:

- `semantic-evaluation` shows the lower-level evaluator and assertion policy flow
- `expect-jest` shows `@judgy/expect` with Jest
- `expect-vitest` shows `@judgy/expect` with Vitest

## Status

Judgy is usable today and still evolving. Expect API and package refinements before a stable `1.0` release.

## License

MIT
