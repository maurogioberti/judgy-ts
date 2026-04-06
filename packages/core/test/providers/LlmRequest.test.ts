import { describe, expect, it } from "@jest/globals";

import { LlmRequest } from "../../src/index.js";

describe("LlmRequest", () => {
  it("sets defaults when constructed with a prompt only", () => {
    const request = new LlmRequest({ prompt: "What is 2+2?" });

    expect(request.prompt).toBe("What is 2+2?");
    expect(request.systemPrompt).toBeUndefined();
    expect(request.temperature).toBeUndefined();
    expect(request.maxTokens).toBeUndefined();
  });

  it("sets properties when constructed with all inputs", () => {
    const request = new LlmRequest({
      prompt: "Summarize this request.",
      systemPrompt: "You are a judge.",
      temperature: 0.7,
      maxTokens: 100
    });

    expect(request.prompt).toBe("Summarize this request.");
    expect(request.systemPrompt).toBe("You are a judge.");
    expect(request.temperature).toBe(0.7);
    expect(request.maxTokens).toBe(100);
  });

  it.each([undefined, null, "", " ", "   ", "\t"])(
    "throws when prompt is invalid: %o",
    (prompt) => {
      expect(() => new LlmRequest({ prompt: prompt as never })).toThrow(
        "Prompt cannot be null or whitespace."
      );
    }
  );

  it("throws when temperature is negative", () => {
    expect(() => new LlmRequest({
      prompt: "Explain the answer.",
      temperature: -0.1
    })).toThrow("Temperature cannot be negative.");
  });

  it.each([0, -1, 1.5])("throws when max tokens is not a positive integer: %p", (maxTokens) => {
    expect(() => new LlmRequest({
      prompt: "Explain the answer.",
      maxTokens
    })).toThrow("MaxTokens must be greater than zero.");
  });
});
