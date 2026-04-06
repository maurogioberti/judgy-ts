export const EXPECTATION_PLACEHOLDER = "{{EXPECTATION}}";
export const ACTUAL_OUTPUT_PLACEHOLDER = "{{ACTUAL_OUTPUT}}";

export const semanticEvaluationUserPrompt = [
  "Evaluate whether the actual output meets the expectation.",
  "",
  "[Expectation]",
  EXPECTATION_PLACEHOLDER,
  "",
  "[Actual Output]",
  ACTUAL_OUTPUT_PLACEHOLDER
].join("\n");
