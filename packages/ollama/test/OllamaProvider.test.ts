import { describe, expect, it } from "@jest/globals";

import { LlmRequest } from "@judgy-ts/core";

import { OllamaProvider } from "../src/index.js";

function makeResponseJson(
  content = "4",
  promptEvalCount = 10,
  evalCount = 5
): string {
  return JSON.stringify({
    message: {
      role: "assistant",
      content
    },
    prompt_eval_count: promptEvalCount,
    eval_count: evalCount
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

describe("OllamaProvider", () => {
  it("sends the correct request", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new OllamaProvider({
      baseUrl: "http://localhost:11434",
      model: "llama3:8b",
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    expect(fakeFetch.lastInput?.toString()).toBe("http://localhost:11434/api/chat");
    expect(fakeFetch.lastInit?.method).toBe("POST");
  });

  it("sends the correct request body", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new OllamaProvider({
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    const body = JSON.parse(String(fakeFetch.lastInit?.body));
    expect(body.model).toBe("llama3:8b");
    expect(body.stream).toBe(false);
    expect(body.messages).toEqual([
      { role: "user", content: "What is 2+2?" }
    ]);
  });

  it("includes the system prompt when provided", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new OllamaProvider({
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
    const provider = new OllamaProvider({
      fetch: async () => new Response(makeResponseJson("Hello world", 15, 8), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    });

    const response = await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    expect(response.text).toBe("Hello world");
    expect(response.providerName).toBe("Ollama");
    expect(response.promptTokens).toBe(15);
    expect(response.completionTokens).toBe(8);
  });

  it("throws when the request is missing", async () => {
    const provider = new OllamaProvider({
      fetch: async () => new Response(makeResponseJson(), { status: 200 })
    });

    await expect(provider.complete(undefined as never)).rejects.toThrow("Request is required.");
  });

  it("throws on HTTP errors", async () => {
    const provider = new OllamaProvider({
      fetch: async () => new Response("{}", { status: 500 })
    });

    await expect(provider.complete(new LlmRequest({ prompt: "What is 2+2?" }))).rejects.toThrow(
      "Ollama request failed with status 500."
    );
  });

  it("throws when the response payload is empty", async () => {
    const provider = new OllamaProvider({
      fetch: async () => new Response("null", { status: 200 })
    });

    await expect(provider.complete(new LlmRequest({ prompt: "What is 2+2?" }))).rejects.toThrow(
      "Ollama returned an empty response payload."
    );
  });

  it("validates constructor options", () => {
    expect(() => new OllamaProvider(undefined as never)).toThrow("Options are required.");
    expect(() => new OllamaProvider({ baseUrl: "", model: "test" })).toThrow(
      "BaseUrl cannot be null or whitespace."
    );
    expect(() => new OllamaProvider({ baseUrl: "http://localhost:11434", model: "" })).toThrow(
      "Model cannot be null or whitespace."
    );
  });

  it("adds authorization when an api key is provided", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new OllamaProvider({
      apiKey: "secret-token",
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    const headers = new Headers(fakeFetch.lastInit?.headers);
    expect(headers.get("authorization")).toBe("Bearer secret-token");
  });

  it("forwards cancellation", async () => {
    const controller = new AbortController();
    controller.abort();

    const provider = new OllamaProvider({
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
