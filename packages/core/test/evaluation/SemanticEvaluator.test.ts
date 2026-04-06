import { describe, expect, it } from "@jest/globals";

import {
  LlmRequest,
  LlmResponse,
  SemanticEvaluator,
  type LlmProvider,
  type LlmProviderCallOptions
} from "../../src/index.js";

const ANY_ACTUAL_OUTPUT = "Hello, how can I help you?";
const ANY_EXPECTATION = "A polite greeting";
const EXPECTED_SYSTEM_PROMPT = [
  "You are an evaluation judge. Your job is to assess whether an actual output meets a given expectation.",
  "",
  "You must respond with JSON only. Do not include any other text, explanation, or markdown formatting.",
  "",
  "Use this exact JSON format:",
  '{ "confidence": <number between 0.0 and 1.0>, "reasoning": "<your explanation>" }',
  "",
  "Confidence scale:",
  "- 1.0 = the actual output fully meets the expectation",
  "- 0.0 = the actual output does not meet the expectation at all",
  "- Values in between represent partial matches",
  "",
  "Respond with the JSON object only."
].join("\n");

class FakeLlmProvider implements LlmProvider {
  public lastRequest?: LlmRequest;
  public lastOptions?: LlmProviderCallOptions;

  public constructor(private readonly responseText: string) {}

  public async complete(
    request: LlmRequest,
    options?: LlmProviderCallOptions
  ): Promise<LlmResponse> {
    this.lastRequest = request;
    this.lastOptions = options;

    return new LlmResponse({
      text: this.responseText,
      providerName: "FakeProvider"
    });
  }
}

describe("SemanticEvaluator", () => {
  it("throws when provider is missing", () => {
    expect(() => new SemanticEvaluator(undefined as never)).toThrow("Provider is required.");
  });

  it.each([undefined, null, "", " ", "   "])(
    "throws when actual output is invalid: %o",
    async (actualOutput) => {
      const evaluator = new SemanticEvaluator(
        new FakeLlmProvider('{"confidence": 0.5, "reasoning": "test"}')
      );

      await expect(
        evaluator.evaluate(actualOutput as never, ANY_EXPECTATION)
      ).rejects.toThrow("ActualOutput cannot be null or whitespace.");
    }
  );

  it.each([undefined, null, "", " ", "   "])(
    "throws when expectation is invalid: %o",
    async (expectation) => {
      const evaluator = new SemanticEvaluator(
        new FakeLlmProvider('{"confidence": 0.5, "reasoning": "test"}')
      );

      await expect(
        evaluator.evaluate(ANY_ACTUAL_OUTPUT, expectation as never)
      ).rejects.toThrow("Expectation cannot be null or whitespace.");
    }
  );

  it("returns valid evidence when the provider returns valid JSON", async () => {
    const evaluator = new SemanticEvaluator(
      new FakeLlmProvider('{"confidence": 0.85, "reasoning": "Good match"}')
    );

    const result = await evaluator.evaluate(ANY_ACTUAL_OUTPUT, ANY_EXPECTATION);

    expect(result.evidence.confidence).toBe(0.85);
    expect(result.evidence.reasoning).toBe("Good match");
    expect(result.evidence.evaluatorName).toBe(SemanticEvaluator.evaluatorName);
    expect(result.actualOutput).toBe(ANY_ACTUAL_OUTPUT);
    expect(result.expectation).toBe(ANY_EXPECTATION);
    expect(result.evaluationDurationMs).toBeGreaterThanOrEqual(0);
  });

  it("clamps confidence to the upper bound", async () => {
    const evaluator = new SemanticEvaluator(
      new FakeLlmProvider('{"confidence": 1.5, "reasoning": "Very confident"}')
    );

    const result = await evaluator.evaluate(ANY_ACTUAL_OUTPUT, ANY_EXPECTATION);

    expect(result.evidence.confidence).toBe(1.0);
  });

  it("clamps confidence to the lower bound", async () => {
    const evaluator = new SemanticEvaluator(
      new FakeLlmProvider('{"confidence": -0.3, "reasoning": "Negative"}')
    );

    const result = await evaluator.evaluate(ANY_ACTUAL_OUTPUT, ANY_EXPECTATION);

    expect(result.evidence.confidence).toBe(0.0);
  });

  it("returns degraded evidence when the provider returns plain text", async () => {
    const evaluator = new SemanticEvaluator(
      new FakeLlmProvider("This is not JSON at all")
    );

    const result = await evaluator.evaluate(ANY_ACTUAL_OUTPUT, ANY_EXPECTATION);

    expect(result.evidence.confidence).toBe(0.0);
    expect(result.evidence.reasoning).toBe("Failed to parse evaluator response as JSON.");
    expect(result.evidence.evaluatorName).toBe(SemanticEvaluator.evaluatorName);
  });

  it("returns degraded evidence when the provider response is missing confidence", async () => {
    const evaluator = new SemanticEvaluator(
      new FakeLlmProvider('{"reasoning": "some reasoning"}')
    );

    const result = await evaluator.evaluate(ANY_ACTUAL_OUTPUT, ANY_EXPECTATION);

    expect(result.evidence.confidence).toBe(0.0);
    expect(result.evidence.reasoning).toBe("Response did not contain a valid confidence value.");
  });

  it("uses fallback reasoning when the provider returns empty reasoning", async () => {
    const evaluator = new SemanticEvaluator(
      new FakeLlmProvider('{"confidence": 0.7, "reasoning": ""}')
    );

    const result = await evaluator.evaluate(ANY_ACTUAL_OUTPUT, ANY_EXPECTATION);

    expect(result.evidence.confidence).toBe(0.7);
    expect(result.evidence.reasoning).toBe("No reasoning provided by the evaluator.");
  });

  it("parses JSON wrapped in markdown fences", async () => {
    const evaluator = new SemanticEvaluator(
      new FakeLlmProvider('```json\n{"confidence": 0.9, "reasoning": "Great match"}\n```')
    );

    const result = await evaluator.evaluate(ANY_ACTUAL_OUTPUT, ANY_EXPECTATION);

    expect(result.evidence.confidence).toBe(0.9);
    expect(result.evidence.reasoning).toBe("Great match");
  });

  it("parses JSON without a markdown language tag", async () => {
    const evaluator = new SemanticEvaluator(
      new FakeLlmProvider('```\n{"confidence": 0.75, "reasoning": "Decent match"}\n```')
    );

    const result = await evaluator.evaluate(ANY_ACTUAL_OUTPUT, ANY_EXPECTATION);

    expect(result.evidence.confidence).toBe(0.75);
    expect(result.evidence.reasoning).toBe("Decent match");
  });

  it("forwards the abort signal when calling the provider", async () => {
    const provider = new FakeLlmProvider('{"confidence": 0.5, "reasoning": "test"}');
    const evaluator = new SemanticEvaluator(provider);
    const controller = new AbortController();

    await evaluator.evaluate(ANY_ACTUAL_OUTPUT, ANY_EXPECTATION, {
      signal: controller.signal
    });

    expect(provider.lastOptions?.signal).toBe(controller.signal);
  });

  it("sets temperature to zero and creates the expected prompts", async () => {
    const provider = new FakeLlmProvider('{"confidence": 0.5, "reasoning": "test"}');
    const evaluator = new SemanticEvaluator(provider);
    const expectedUserPrompt = [
      "Evaluate whether the actual output meets the expectation.",
      "",
      "[Expectation]",
      ANY_EXPECTATION,
      "",
      "[Actual Output]",
      ANY_ACTUAL_OUTPUT
    ].join("\n");

    await evaluator.evaluate(ANY_ACTUAL_OUTPUT, ANY_EXPECTATION);

    expect(provider.lastRequest).toBeDefined();
    expect(provider.lastRequest?.temperature).toBe(0.0);
    expect(provider.lastRequest?.systemPrompt).toBe(EXPECTED_SYSTEM_PROMPT);
    expect(provider.lastRequest?.prompt).toBe(expectedUserPrompt);
  });
});
