export const DEFAULT_MINIMUM_SCORE = 0.70;

export interface SemanticAssertionOptions {
  readonly minimumScore?: number;
}

export type AssertionFailureKind =
  | "semantic"
  | "score"
  | "duration";

export interface AssertionFailureDetails {
  readonly kind: AssertionFailureKind;
  readonly expectation?: string;
  readonly actualOutput?: string;
  readonly actualScore?: number;
  readonly minimumScore?: number;
  readonly actualDurationMs?: number;
  readonly maximumDurationMs?: number;
  readonly reasoning?: string;
}

export interface AssertionDecision {
  readonly succeeded: boolean;
  readonly failure?: AssertionFailureDetails;
}
