import { describe, expect, it } from "@jest/globals";

import { LlmRequest } from "@judgy/core";

import { GoogleProvider } from "../src/index.js";

function makeResponseJson(
  content = "4",
  promptTokens = 10,
  candidatesTokens = 5
): string {
  return JSON.stringify({
    candidates: [
      {
        content: {
          parts: [
            {
              text: content
            }
          ]
        }
      }
    ],
    usageMetadata: {
      promptTokenCount: promptTokens,
      candidatesTokenCount: candidatesTokens
    }
  });
}

class FakeFetch {
  public lastInput?: string | URL;
  public lastInit?: RequestInit;

  public readonly handler: typeof fetch = async (input, init) => {
    this.lastInput = input;
    this.lastInit = init;

    if (init?.signal?.aborted) {
      throw new DOMException("This operation was aborted", "AbortError");
    }

    return new Response(makeResponseJson(), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  };
}

describe("GoogleProvider", () => {
  it("sends the correct request", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new GoogleProvider({
      apiKey: "google-test-key-12345",
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    expect(fakeFetch.lastInput?.toString()).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
    );
    expect(fakeFetch.lastInit?.method).toBe("POST");

    const headers = new Headers(fakeFetch.lastInit?.headers);
    expect(headers.get("x-goog-api-key")).toBe("google-test-key-12345");
  });

  it("sends the correct request body", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new GoogleProvider({
      apiKey: "google-test-key-12345",
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    const body = JSON.parse(String(fakeFetch.lastInit?.body));
    expect(body.systemInstruction).toBeUndefined();
    expect(body.contents).toEqual([
      {
        role: "user",
        parts: [
          {
            text: "What is 2+2?"
          }
        ]
      }
    ]);
    expect(body.generationConfig).toEqual({
      temperature: 0.0,
      maxOutputTokens: 1024
    });
  });

  it("includes the system prompt when provided", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new GoogleProvider({
      apiKey: "google-test-key-12345",
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({
      prompt: "What is 2+2?",
      systemPrompt: "You are a math tutor."
    }));

    const body = JSON.parse(String(fakeFetch.lastInit?.body));
    expect(body.systemInstruction).toEqual({
      parts: [
        {
          text: "You are a math tutor."
        }
      ]
    });
  });

  it("parses the response correctly", async () => {
    const provider = new GoogleProvider({
      apiKey: "google-test-key-12345",
      fetch: async () => new Response(makeResponseJson("Hello world", 15, 8), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    });

    const response = await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    expect(response.text).toBe("Hello world");
    expect(response.providerName).toBe("Google");
    expect(response.promptTokens).toBe(15);
    expect(response.completionTokens).toBe(8);
  });

  it("uses request temperature and max tokens over option defaults", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new GoogleProvider({
      apiKey: "google-test-key-12345",
      temperature: 0.2,
      maxOutputTokens: 256,
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({
      prompt: "What is 2+2?",
      temperature: 0.7,
      maxTokens: 512
    }));

    const body = JSON.parse(String(fakeFetch.lastInit?.body));
    expect(body.generationConfig.temperature).toBe(0.7);
    expect(body.generationConfig.maxOutputTokens).toBe(512);
  });

  it("throws when the request is missing", async () => {
    const provider = new GoogleProvider({
      apiKey: "google-test-key-12345",
      fetch: async () => new Response(makeResponseJson(), { status: 200 })
    });

    await expect(provider.complete(undefined as never)).rejects.toThrow("Request is required.");
  });

  it("throws on HTTP errors", async () => {
    const provider = new GoogleProvider({
      apiKey: "google-test-key-12345",
      fetch: async () => new Response("{}", { status: 500 })
    });

    await expect(provider.complete(new LlmRequest({ prompt: "What is 2+2?" }))).rejects.toThrow(
      "Google request failed with status 500."
    );
  });

  it("throws when the response payload is empty", async () => {
    const provider = new GoogleProvider({
      apiKey: "google-test-key-12345",
      fetch: async () => new Response("null", { status: 200 })
    });

    await expect(provider.complete(new LlmRequest({ prompt: "What is 2+2?" }))).rejects.toThrow(
      "Google returned an empty response payload."
    );
  });

  it("throws when the response does not contain text content", async () => {
    const provider = new GoogleProvider({
      apiKey: "google-test-key-12345",
      fetch: async () => new Response(JSON.stringify({ candidates: [] }), { status: 200 })
    });

    await expect(provider.complete(new LlmRequest({ prompt: "What is 2+2?" }))).rejects.toThrow(
      "Google response did not contain text content."
    );
  });

  it("validates constructor options", () => {
    expect(() => new GoogleProvider(undefined as never)).toThrow("Options are required.");
    expect(() => new GoogleProvider({ apiKey: "" })).toThrow("ApiKey cannot be null or whitespace.");
    expect(() => new GoogleProvider({
      apiKey: "google-test-key-12345",
      model: ""
    })).toThrow("Model cannot be null or whitespace.");
  });

  it("uses a custom model when provided", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new GoogleProvider({
      apiKey: "google-test-key-12345",
      model: "gemini-2.5-pro",
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    expect(fakeFetch.lastInput?.toString()).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent"
    );
  });

  it("forwards cancellation", async () => {
    const controller = new AbortController();
    controller.abort();

    const provider = new GoogleProvider({
      apiKey: "google-test-key-12345",
      fetch: async (_input, init) => {
        if (init?.signal?.aborted) {
          throw new DOMException("This operation was aborted", "AbortError");
        }

        return new Response(makeResponseJson(), { status: 200 });
      }
    });

    await expect(
      provider.complete(new LlmRequest({ prompt: "What is 2+2?" }), { signal: controller.signal })
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});
