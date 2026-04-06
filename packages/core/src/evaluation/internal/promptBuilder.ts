import {
  ACTUAL_OUTPUT_PLACEHOLDER,
  EXPECTATION_PLACEHOLDER,
  semanticEvaluationUserPrompt
} from "../../prompts/semanticEvaluationUserPrompt.js";
import { semanticEvaluationSystemPrompt } from "../../prompts/semanticEvaluationSystemPrompt.js";

export function buildSystemPrompt(): string {
  return semanticEvaluationSystemPrompt;
}

export function buildUserPrompt(actualOutput: string, expectation: string): string {
  return semanticEvaluationUserPrompt
    .replace(EXPECTATION_PLACEHOLDER, expectation)
    .replace(ACTUAL_OUTPUT_PLACEHOLDER, actualOutput);
}
