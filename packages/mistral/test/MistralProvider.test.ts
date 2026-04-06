import { describe, expect, it } from "@jest/globals";

import { LlmRequest } from "@judgy/core";

import { MistralProvider } from "../src/index.js";

function makeResponseJson(
  content = "4",
  promptTokens = 10,
  completionTokens = 5
): string {
  return JSON.stringify({
    choices: [
      {
        message: {
          content
        }
      }
    ],
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens
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

describe("MistralProvider", () => {
  it("sends the correct request", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new MistralProvider({
      apiKey: "mistral-test-key-12345",
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    expect(fakeFetch.lastInput?.toString()).toBe("https://api.mistral.ai/v1/chat/completions");
    expect(fakeFetch.lastInit?.method).toBe("POST");

    const headers = new Headers(fakeFetch.lastInit?.headers);
    expect(headers.get("authorization")).toBe("Bearer mistral-test-key-12345");
  });

  it("sends the correct request body", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new MistralProvider({
      apiKey: "mistral-test-key-12345",
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    const body = JSON.parse(String(fakeFetch.lastInit?.body));
    expect(body.model).toBe("mistral-medium-latest");
    expect(body.temperature).toBe(0.0);
    expect(body.max_tokens).toBe(1024);
    expect(body.stream).toBe(false);
    expect(body.messages).toEqual([
      { role: "user", content: "What is 2+2?" }
    ]);
  });

  it("includes the system prompt when provided", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new MistralProvider({
      apiKey: "mistral-test-key-12345",
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({
      prompt: "What is 2+2?",
      systemPrompt: "You are a math tutor."
    }));

    const body = JSON.parse(String(fakeFetch.lastInit?.body));
    expect(body.messages).toEqual([
      { role: "system", content: "You are a math tutor." },
      { role: "user", content: "What is 2+2?" }
    ]);
  });

  it("parses the response correctly", async () => {
    const provider = new MistralProvider({
      apiKey: "mistral-test-key-12345",
      fetch: async () => new Response(makeResponseJson("Hello world", 15, 8), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    });

    const response = await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    expect(response.text).toBe("Hello world");
    expect(response.providerName).toBe("Mistral");
    expect(response.promptTokens).toBe(15);
    expect(response.completionTokens).toBe(8);
  });

  it("uses request temperature and max tokens over option defaults", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new MistralProvider({
      apiKey: "mistral-test-key-12345",
      temperature: 0.2,
      maxTokens: 256,
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({
      prompt: "What is 2+2?",
      temperature: 0.7,
      maxTokens: 512
    }));

    const body = JSON.parse(String(fakeFetch.lastInit?.body));
    expect(body.temperature).toBe(0.7);
    expect(body.max_tokens).toBe(512);
  });

  it("throws when the request is missing", async () => {
    const provider = new MistralProvider({
      apiKey: "mistral-test-key-12345",
      fetch: async () => new Response(makeResponseJson(), { status: 200 })
    });

    await expect(provider.complete(undefined as never)).rejects.toThrow("Request is required.");
  });

  it("throws on HTTP errors", async () => {
    const provider = new MistralProvider({
      apiKey: "mistral-test-key-12345",
      fetch: async () => new Response("{}", { status: 500 })
    });

    await expect(provider.complete(new LlmRequest({ prompt: "What is 2+2?" }))).rejects.toThrow(
      "Mistral request failed with status 500."
    );
  });

  it("throws when the response payload is empty", async () => {
    const provider = new MistralProvider({
      apiKey: "mistral-test-key-12345",
      fetch: async () => new Response("null", { status: 200 })
    });

    await expect(provider.complete(new LlmRequest({ prompt: "What is 2+2?" }))).rejects.toThrow(
      "Mistral returned an empty response payload."
    );
  });

  it("validates constructor options", () => {
    expect(() => new MistralProvider(undefined as never)).toThrow("Options are required.");
    expect(() => new MistralProvider({ apiKey: "" })).toThrow("ApiKey cannot be null or whitespace.");
  });

  it("uses a custom model when provided", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new MistralProvider({
      apiKey: "mistral-test-key-12345",
      model: "mistral-large-latest",
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    const body = JSON.parse(String(fakeFetch.lastInit?.body));
    expect(body.model).toBe("mistral-large-latest");
  });

  it("forwards cancellation", async () => {
    const controller = new AbortController();
    controller.abort();

    const provider = new MistralProvider({
      apiKey: "mistral-test-key-12345",
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
