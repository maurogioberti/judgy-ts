import { type LlmRequest } from "@judgy-ts/core";

export interface GoogleRequestDefaults {
  readonly temperature: number;
  readonly maxOutputTokens: number;
}

export function buildGenerateContentRequestBody(
  request: LlmRequest,
  defaults: GoogleRequestDefaults
): Record<string, unknown> {
  const requestBody: Record<string, unknown> = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: request.prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: request.temperature ?? defaults.temperature,
      maxOutputTokens: request.maxTokens ?? defaults.maxOutputTokens
    }
  };

  if (request.systemPrompt !== undefined) {
    requestBody.systemInstruction = {
      parts: [
        {
          text: request.systemPrompt
        }
      ]
    };
  }

  return requestBody;
}
