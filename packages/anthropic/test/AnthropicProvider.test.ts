import { describe, expect, it } from "@jest/globals";

import { LlmRequest } from "@judgy-ts/core";

import { AnthropicProvider } from "../src/index.js";

function makeResponseJson(
  content = "4",
  inputTokens = 10,
  outputTokens = 5
): string {
  return JSON.stringify({
    content: [
      {
        type: "text",
        text: content
      }
    ],
    usage: {
      input_tokens: inputTokens,
      output_tokens: outputTokens
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

describe("AnthropicProvider", () => {
  it("sends the correct request", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new AnthropicProvider({
      apiKey: "anthropic-test-key-12345",
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    expect(fakeFetch.lastInput?.toString()).toBe("https://api.anthropic.com/v1/messages");
    expect(fakeFetch.lastInit?.method).toBe("POST");

    const headers = new Headers(fakeFetch.lastInit?.headers);
    expect(headers.get("x-api-key")).toBe("anthropic-test-key-12345");
    expect(headers.get("anthropic-version")).toBe("2023-06-01");
  });

  it("sends the correct request body", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new AnthropicProvider({
      apiKey: "anthropic-test-key-12345",
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    const body = JSON.parse(String(fakeFetch.lastInit?.body));
    expect(body.model).toBe("claude-sonnet-4-20250514");
    expect(body.temperature).toBe(0.0);
    expect(body.max_tokens).toBe(1024);
    expect(body.system).toBeUndefined();
    expect(body.messages).toEqual([
      { role: "user", content: "What is 2+2?" }
    ]);
  });

  it("includes the system prompt when provided", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new AnthropicProvider({
      apiKey: "anthropic-test-key-12345",
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({
      prompt: "What is 2+2?",
      systemPrompt: "You are a math tutor."
    }));

    const body = JSON.parse(String(fakeFetch.lastInit?.body));
    expect(body.system).toBe("You are a math tutor.");
    expect(body.messages).toEqual([
      { role: "user", content: "What is 2+2?" }
    ]);
  });

  it("parses the response correctly", async () => {
    const provider = new AnthropicProvider({
      apiKey: "anthropic-test-key-12345",
      fetch: async () => new Response(makeResponseJson("Hello world", 15, 8), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    });

    const response = await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    expect(response.text).toBe("Hello world");
    expect(response.providerName).toBe("Anthropic");
    expect(response.promptTokens).toBe(15);
    expect(response.completionTokens).toBe(8);
  });

  it("uses request temperature and max tokens over option defaults", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new AnthropicProvider({
      apiKey: "anthropic-test-key-12345",
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
    const provider = new AnthropicProvider({
      apiKey: "anthropic-test-key-12345",
      fetch: async () => new Response(makeResponseJson(), { status: 200 })
    });

    await expect(provider.complete(undefined as never)).rejects.toThrow("Request is required.");
  });

  it("throws on HTTP errors", async () => {
    const provider = new AnthropicProvider({
      apiKey: "anthropic-test-key-12345",
      fetch: async () => new Response("{}", { status: 500 })
    });

    await expect(provider.complete(new LlmRequest({ prompt: "What is 2+2?" }))).rejects.toThrow(
      "Anthropic request failed with status 500."
    );
  });

  it("throws when the response payload is empty", async () => {
    const provider = new AnthropicProvider({
      apiKey: "anthropic-test-key-12345",
      fetch: async () => new Response("null", { status: 200 })
    });

    await expect(provider.complete(new LlmRequest({ prompt: "What is 2+2?" }))).rejects.toThrow(
      "Anthropic returned an empty response payload."
    );
  });

  it("throws when the response does not contain text content", async () => {
    const provider = new AnthropicProvider({
      apiKey: "anthropic-test-key-12345",
      fetch: async () => new Response(JSON.stringify({
        content: [
          {
            type: "tool_use"
          }
        ]
      }), { status: 200 })
    });

    await expect(provider.complete(new LlmRequest({ prompt: "What is 2+2?" }))).rejects.toThrow(
      "Anthropic response did not contain text content."
    );
  });

  it("validates constructor options", () => {
    expect(() => new AnthropicProvider(undefined as never)).toThrow("Options are required.");
    expect(() => new AnthropicProvider({ apiKey: "" })).toThrow("ApiKey cannot be null or whitespace.");
    expect(() => new AnthropicProvider({
      apiKey: "anthropic-test-key-12345",
      apiVersion: ""
    })).toThrow("ApiVersion cannot be null or whitespace.");
  });

  it("uses a custom model when provided", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new AnthropicProvider({
      apiKey: "anthropic-test-key-12345",
      model: "claude-opus-4-1-20250805",
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    const body = JSON.parse(String(fakeFetch.lastInit?.body));
    expect(body.model).toBe("claude-opus-4-1-20250805");
  });

  it("forwards cancellation", async () => {
    const controller = new AbortController();
    controller.abort();

    const provider = new AnthropicProvider({
      apiKey: "anthropic-test-key-12345",
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
