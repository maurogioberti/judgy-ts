# @judgy-ts/azure-openai

Azure OpenAI provider for Judgy TypeScript.

`@judgy-ts/azure-openai` implements the `LlmProvider` contract from `@judgy-ts/core` using Azure OpenAI chat completions, so you can evaluate outputs with a deployment you already manage in Azure.

## Installation

```bash
npm install @judgy-ts/core @judgy-ts/azure-openai
```

## What This Package Contains

- `AzureOpenAiProvider`
- `AzureOpenAiProviderOptions`

## Usage

```ts
import { SemanticEvaluator } from "@judgy-ts/core";
import { AzureOpenAiProvider } from "@judgy-ts/azure-openai";

const provider = new AzureOpenAiProvider({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  deploymentName: "gpt-4o"
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
