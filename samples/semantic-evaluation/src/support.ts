import { LlmRequest, SemanticEvaluator } from "@judgy/core";
import { HttpProvider } from "@judgy/http";
import { OllamaProvider } from "@judgy/ollama";

import { loadSampleSettings } from "./settings.js";

export function createSourceProvider(): HttpProvider {
  const settings = loadSampleSettings();

  return new HttpProvider({
    endpoint: settings.sourceApi.endpoint,
    requestTemplate: settings.sourceApi.requestTemplate,
    responseJsonPath: settings.sourceApi.responseJsonPath,
    timeoutMs: settings.sourceApi.timeoutMs
  });
}

export function createJudgeEvaluator(): SemanticEvaluator {
  const settings = loadSampleSettings();
  const judgeProvider = new OllamaProvider({
    baseUrl: settings.judgeOllama.baseUrl,
    model: settings.judgeOllama.model,
    timeoutMs: settings.judgeOllama.timeoutMs
  });

  return new SemanticEvaluator(judgeProvider);
}

export function buildQuestionRequest(prompt: string): LlmRequest {
  return new LlmRequest({ prompt });
}
