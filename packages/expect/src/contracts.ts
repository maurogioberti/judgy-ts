import type {
  EvaluationResult,
  SemanticAssertionOptions,
  SemanticEvaluationOptions
} from "@judgy/core";

export interface JudgySemanticMatcherOptions extends SemanticAssertionOptions {
  readonly signal?: AbortSignal;
}

export interface SemanticEvaluatorLike {
  evaluate(
    actualOutput: string,
    expectation: string,
    options?: SemanticEvaluationOptions
  ): Promise<EvaluationResult>;
}

export interface JudgySemanticExpectation {
  readonly evaluator: SemanticEvaluatorLike;
  readonly actualOutput: string;
  readonly expectation: string;
}
