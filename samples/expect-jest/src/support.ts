import { SemanticEvaluator } from "@judgy-ts/core";
import { OllamaProvider } from "@judgy-ts/ollama";

import { loadSampleSettings } from "./settings.js";

export function createJudgeEvaluator(): SemanticEvaluator {
  const settings = loadSampleSettings();
  const judgeProvider = new OllamaProvider({
    baseUrl: settings.judgeOllama.baseUrl,
    model: settings.judgeOllama.model,
    timeoutMs: settings.judgeOllama.timeoutMs
  });

  return new SemanticEvaluator(judgeProvider);
}

export function getMaximumDurationMs(): number {
  return loadSampleSettings().judgeOllama.timeoutMs;
}
