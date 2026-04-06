const PROMPT_PLACEHOLDER = "{{prompt}}";

export function buildRequestBody(prompt: string, requestTemplate: string): string {
  const escapedPrompt = escapePromptForTemplate(prompt);

  return requestTemplate.replace(PROMPT_PLACEHOLDER, escapedPrompt);
}

function escapePromptForTemplate(prompt: string): string {
  return JSON.stringify(prompt)
    .slice(1, -1)
    .replace(/\\"/g, "\\u0022");
}
