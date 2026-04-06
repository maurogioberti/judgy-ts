import {
  assertNonEmptyString,
  assertOptionalNonNegativeNumber,
  assertRecord,
  freezeValue
} from "../internal/validation.js";

export interface LlmResponseArgs {
  readonly text: string;
  readonly providerName: string;
  readonly promptTokens?: number;
  readonly completionTokens?: number;
}

export class LlmResponse {
  public readonly text: string;
  public readonly providerName: string;
  public readonly promptTokens: number | undefined;
  public readonly completionTokens: number | undefined;

  public constructor(args: LlmResponseArgs) {
    const values = assertRecord(args, "LlmResponse arguments are required.");

    this.text = assertNonEmptyString(values.text, "Text cannot be null or whitespace.");
    this.providerName = assertNonEmptyString(
      values.providerName,
      "ProviderName cannot be null or whitespace."
    );
    this.promptTokens = assertOptionalNonNegativeNumber(
      values.promptTokens,
      "PromptTokens cannot be negative."
    );
    this.completionTokens = assertOptionalNonNegativeNumber(
      values.completionTokens,
      "CompletionTokens cannot be negative."
    );

    freezeValue(this);
  }
}
