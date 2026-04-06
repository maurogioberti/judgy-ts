import { describe, expect, it } from "@jest/globals";

import { LlmResponse } from "../../src/index.js";

describe("LlmResponse", () => {
  it("sets defaults when constructed with required inputs", () => {
    const response = new LlmResponse({
      text: "Hello world",
      providerName: "OpenAI"
    });

    expect(response.text).toBe("Hello world");
    expect(response.providerName).toBe("OpenAI");
    expect(response.promptTokens).toBeUndefined();
    expect(response.completionTokens).toBeUndefined();
  });

  it("sets properties when constructed with all inputs", () => {
    const response = new LlmResponse({
      text: "Hello",
      providerName: "OpenAI",
      promptTokens: 10,
      completionTokens: 20
    });

    expect(response.text).toBe("Hello");
    expect(response.providerName).toBe("OpenAI");
    expect(response.promptTokens).toBe(10);
    expect(response.completionTokens).toBe(20);
  });

  it.each([undefined, null, "", " ", "   ", "\t"])(
    "throws when text is invalid: %o",
    (text) => {
      expect(() => new LlmResponse({
        text: text as never,
        providerName: "OpenAI"
      })).toThrow("Text cannot be null or whitespace.");
    }
  );

  it.each([undefined, null, "", " ", "   ", "\t"])(
    "throws when provider name is invalid: %o",
    (providerName) => {
      expect(() => new LlmResponse({
        text: "Hello world",
        providerName: providerName as never
      })).toThrow("ProviderName cannot be null or whitespace.");
    }
  );

  it("throws when token counts are negative", () => {
    expect(() => new LlmResponse({
      text: "Hello world",
      providerName: "OpenAI",
      promptTokens: -1
    })).toThrow("PromptTokens cannot be negative.");

    expect(() => new LlmResponse({
      text: "Hello world",
      providerName: "OpenAI",
      completionTokens: -1
    })).toThrow("CompletionTokens cannot be negative.");
  });
});
