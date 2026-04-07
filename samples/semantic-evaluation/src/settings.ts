import { readFileSync } from "node:fs";

export interface SourceApiSettings {
  readonly endpoint: string;
  readonly requestTemplate: string;
  readonly responseJsonPath: string;
  readonly timeoutMs: number;
}

export interface JudgeOllamaSettings {
  readonly baseUrl: string;
  readonly model: string;
  readonly timeoutMs: number;
}

export interface SemanticEvaluationSampleSettings {
  readonly sourceApi: SourceApiSettings;
  readonly judgeOllama: JudgeOllamaSettings;
}

const SETTINGS_URL = new URL("../sample.config.json", import.meta.url);

export function loadSampleSettings(): SemanticEvaluationSampleSettings {
  const payload = JSON.parse(readFileSync(SETTINGS_URL, "utf8")) as unknown;
  const values = assertRecord(payload, "Sample settings are required.");

  return {
    sourceApi: parseSourceApiSettings(values.sourceApi),
    judgeOllama: parseJudgeOllamaSettings(values.judgeOllama)
  };
}

function parseSourceApiSettings(value: unknown): SourceApiSettings {
  const values = assertRecord(value, "sourceApi settings are required.");

  return {
    endpoint: assertNonEmptyString(values.endpoint, "sourceApi.endpoint is required."),
    requestTemplate: assertNonEmptyString(values.requestTemplate, "sourceApi.requestTemplate is required."),
    responseJsonPath: assertNonEmptyString(values.responseJsonPath, "sourceApi.responseJsonPath is required."),
    timeoutMs: assertPositiveInteger(values.timeoutMs, "sourceApi.timeoutMs must be greater than zero.")
  };
}

function parseJudgeOllamaSettings(value: unknown): JudgeOllamaSettings {
  const values = assertRecord(value, "judgeOllama settings are required.");

  return {
    baseUrl: assertNonEmptyString(values.baseUrl, "judgeOllama.baseUrl is required."),
    model: assertNonEmptyString(values.model, "judgeOllama.model is required."),
    timeoutMs: assertPositiveInteger(values.timeoutMs, "judgeOllama.timeoutMs must be greater than zero.")
  };
}

function assertRecord(value: unknown, message: string): Record<string, unknown> {
  if (value === null || value === undefined || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(message);
  }

  return value as Record<string, unknown>;
}

function assertNonEmptyString(value: unknown, message: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(message);
  }

  return value;
}

function assertPositiveInteger(value: unknown, message: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new TypeError(message);
  }

  return value;
}
