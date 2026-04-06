import {
  assertNonEmptyString,
  assertNumberInRange,
  assertRecord,
  freezeValue
} from "../internal/validation.js";

export interface EvaluationEvidenceArgs {
  readonly confidence: number;
  readonly reasoning: string;
  readonly evaluatorName: string;
}

export class EvaluationEvidence {
  public static readonly minimumConfidence = 0.0;
  public static readonly maximumConfidence = 1.0;

  public readonly confidence: number;
  public readonly reasoning: string;
  public readonly evaluatorName: string;

  public constructor(args: EvaluationEvidenceArgs) {
    const values = assertRecord(args, "EvaluationEvidence arguments are required.");

    this.confidence = assertNumberInRange(
      values.confidence,
      EvaluationEvidence.minimumConfidence,
      EvaluationEvidence.maximumConfidence,
      "Confidence must be within the supported inclusive range."
    );
    this.reasoning = assertNonEmptyString(
      values.reasoning,
      "Reasoning cannot be null or whitespace."
    );
    this.evaluatorName = assertNonEmptyString(
      values.evaluatorName,
      "EvaluatorName cannot be null or whitespace."
    );

    freezeValue(this);
  }
}
