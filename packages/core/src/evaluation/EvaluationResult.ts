import {
  assertNonEmptyString,
  assertNonNegativeNumber,
  assertRecord,
  freezeValue
} from "../internal/validation.js";
import { EvaluationEvidence } from "./EvaluationEvidence.js";

export interface EvaluationResultArgs {
  readonly evidence: EvaluationEvidence;
  readonly actualOutput: string;
  readonly expectation: string;
  readonly evaluationDurationMs: number;
}

export class EvaluationResult {
  public readonly evidence: EvaluationEvidence;
  public readonly actualOutput: string;
  public readonly expectation: string;
  public readonly evaluationDurationMs: number;

  public constructor(args: EvaluationResultArgs) {
    const values = assertRecord(args, "EvaluationResult arguments are required.");

    if (!(values.evidence instanceof EvaluationEvidence)) {
      throw new TypeError("Evidence is required.");
    }

    this.evidence = values.evidence;
    this.actualOutput = assertNonEmptyString(
      values.actualOutput,
      "ActualOutput cannot be null or whitespace."
    );
    this.expectation = assertNonEmptyString(
      values.expectation,
      "Expectation cannot be null or whitespace."
    );
    this.evaluationDurationMs = assertNonNegativeNumber(
      values.evaluationDurationMs,
      "EvaluationDurationMs cannot be negative."
    );

    freezeValue(this);
  }
}
