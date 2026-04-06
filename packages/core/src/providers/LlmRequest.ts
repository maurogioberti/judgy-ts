import {
  assertNonEmptyString,
  assertOptionalNonNegativeNumber,
  assertPositiveInteger,
  assertRecord,
  freezeValue
} from "../internal/validation.js";

export interface LlmRequestArgs {
  readonly prompt: string;
  readonly systemPrompt?: string;
  readonly temperature?: number;
  readonly maxTokens?: number;
}

export class LlmRequest {
  public readonly prompt: string;
  public readonly systemPrompt: string | undefined;
  public readonly temperature: number | undefined;
  public readonly maxTokens: number | undefined;

  public constructor(args: LlmRequestArgs) {
    const values = assertRecord(args, "LlmRequest arguments are required.");
    const prompt = assertNonEmptyString(values.prompt, "Prompt cannot be null or whitespace.");
    const systemPrompt = values.systemPrompt;
    const temperature = assertOptionalNonNegativeNumber(
      values.temperature,
      "Temperature cannot be negative."
    );
    const maxTokensValue = values.maxTokens;
    const maxTokens = maxTokensValue === undefined
      ? undefined
      : assertPositiveInteger(maxTokensValue, "MaxTokens must be greater than zero.");

    this.prompt = prompt;
    this.systemPrompt = typeof systemPrompt === "string" ? systemPrompt : undefined;
    this.temperature = temperature;
    this.maxTokens = maxTokens;

    freezeValue(this);
  }
}
