import {
  assertNonEmptyString,
  freezeValue
} from "../internal/validation.js";
import { LlmRequest } from "../providers/LlmRequest.js";
import type { LlmProvider } from "../providers/LlmProvider.js";
import { EvaluationResult } from "./EvaluationResult.js";
import { buildSystemPrompt, buildUserPrompt } from "./internal/promptBuilder.js";
import { parseEvaluationEvidence } from "./internal/responseParser.js";

export interface SemanticEvaluationOptions {
  readonly signal?: AbortSignal;
}

export class SemanticEvaluator {
  public static readonly evaluatorName = "SemanticEvaluator";

  private readonly provider: LlmProvider;

  public constructor(provider: LlmProvider) {
    if (provider === null || provider === undefined || typeof provider.complete !== "function") {
      throw new TypeError("Provider is required.");
    }

    this.provider = provider;

    freezeValue(this);
  }

  public async evaluate(
    actualOutput: string,
    expectation: string,
    options?: SemanticEvaluationOptions
  ): Promise<EvaluationResult> {
    const validatedActualOutput = assertNonEmptyString(
      actualOutput,
      "ActualOutput cannot be null or whitespace."
    );
    const validatedExpectation = assertNonEmptyString(
      expectation,
      "Expectation cannot be null or whitespace."
    );

    const startedAt = Date.now();
    const request = new LlmRequest({
      prompt: buildUserPrompt(validatedActualOutput, validatedExpectation),
      systemPrompt: buildSystemPrompt(),
      temperature: 0.0
    });
    const callOptions = options?.signal === undefined
      ? undefined
      : { signal: options.signal };
    const response = await this.provider.complete(request, callOptions);
    const evaluationDurationMs = Math.max(0, Date.now() - startedAt);
    const evidence = parseEvaluationEvidence(
      response.text,
      SemanticEvaluator.evaluatorName
    );

    return new EvaluationResult({
      evidence,
      actualOutput: validatedActualOutput,
      expectation: validatedExpectation,
      evaluationDurationMs
    });
  }
}
