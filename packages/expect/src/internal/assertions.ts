import type { JudgySemanticExpectation, SemanticEvaluatorLike } from "../contracts.js";

export function assertSemanticExpectation(value: unknown): JudgySemanticExpectation {
  if (value === null || value === undefined || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("Expected an object with evaluator, actualOutput, and expectation.");
  }

  const record = value as Record<string, unknown>;

  if (
    record.evaluator === null
    || record.evaluator === undefined
    || typeof record.evaluator !== "object"
    || typeof (record.evaluator as { evaluate?: unknown }).evaluate !== "function"
  ) {
    throw new TypeError("Expected subject.evaluator to provide an evaluate function.");
  }

  if (typeof record.actualOutput !== "string") {
    throw new TypeError("Expected subject.actualOutput to be a string.");
  }

  if (typeof record.expectation !== "string") {
    throw new TypeError("Expected subject.expectation to be a string.");
  }

  return {
    evaluator: record.evaluator as SemanticEvaluatorLike,
    actualOutput: record.actualOutput,
    expectation: record.expectation
  };
}

export function assertNumber(value: unknown, message: string): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(message);
  }

  return value;
}
