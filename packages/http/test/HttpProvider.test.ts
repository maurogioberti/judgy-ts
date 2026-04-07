import { describe, expect, it } from "@jest/globals";

import { LlmRequest } from "@judgy-ts/core";

import { HttpProvider } from "../src/index.js";

class FakeFetch {
  public lastInput?: string | URL;
  public lastInit?: RequestInit;

  public constructor(private readonly responseBody: string, private readonly status = 200) {}

  public readonly handler: typeof fetch = async (input, init) => {
    this.lastInput = input;
    this.lastInit = init;

    if (init?.signal?.aborted) {
      throw new DOMException("This operation was aborted", "AbortError");
    }

    return new Response(this.responseBody, {
      status: this.status,
      headers: {
        "Content-Type": "application/json"
      }
    });
  };
}

describe("HttpProvider", () => {
  it("sends the templated request", async () => {
    const fakeFetch = new FakeFetch('{"response":"4"}');
    const provider = new HttpProvider({
      endpoint: "https://api.example.com/generate",
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    expect(fakeFetch.lastInput?.toString()).toBe("https://api.example.com/generate");
    expect(fakeFetch.lastInit?.method).toBe("POST");

    const body = JSON.parse(String(fakeFetch.lastInit?.body));
    expect(body.prompt).toBe("What is 2+2?");
  });

  it("extracts the response via json path", async () => {
    const provider = new HttpProvider({
      endpoint: "https://api.example.com/generate",
      fetch: async () => new Response('{"response":"The answer is 4"}', { status: 200 })
    });

    const response = await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    expect(response.text).toBe("The answer is 4");
    expect(response.providerName).toBe("Http");
  });

  it("extracts nested and indexed values via json path", async () => {
    const nestedProvider = new HttpProvider({
      endpoint: "https://api.example.com/generate",
      responseJsonPath: "$.data.text",
      fetch: async () => new Response('{"data":{"text":"nested result"}}', { status: 200 })
    });
    const arrayProvider = new HttpProvider({
      endpoint: "https://api.example.com/generate",
      responseJsonPath: "$.choices[0].message.content",
      fetch: async () => new Response('{"choices":[{"message":{"content":"array result"}}]}', { status: 200 })
    });

    await expect(nestedProvider.complete(new LlmRequest({ prompt: "What is 2+2?" }))).resolves.toMatchObject({
      text: "nested result"
    });
    await expect(arrayProvider.complete(new LlmRequest({ prompt: "What is 2+2?" }))).resolves.toMatchObject({
      text: "array result"
    });
  });

  it("extracts the response via regex and returns the full match when there is no capture group", async () => {
    const regexProvider = new HttpProvider({
      endpoint: "https://api.example.com/generate",
      regexPattern: 'extracted: (.+?)"',
      fetch: async () => new Response('{"result": "extracted: hello world"}', { status: 200 })
    });
    const fullMatchProvider = new HttpProvider({
      endpoint: "https://api.example.com/generate",
      regexPattern: "hello world",
      fetch: async () => new Response('{"result": "hello world"}', { status: 200 })
    });

    await expect(regexProvider.complete(new LlmRequest({ prompt: "What is 2+2?" }))).resolves.toMatchObject({
      text: "hello world"
    });
    await expect(fullMatchProvider.complete(new LlmRequest({ prompt: "What is 2+2?" }))).resolves.toMatchObject({
      text: "hello world"
    });
  });

  it("json-escapes the prompt in the request template", async () => {
    const fakeFetch = new FakeFetch('{"response":"ok"}');
    const provider = new HttpProvider({
      endpoint: "https://api.example.com/generate",
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({ prompt: 'Say "hello"\nnewline' }));

    const requestBody = String(fakeFetch.lastInit?.body);
    expect(requestBody).not.toContain('"hello"');
    expect(requestBody).toContain("\\u0022hello\\u0022");
  });

  it("includes custom headers and request templates", async () => {
    const fakeFetch = new FakeFetch('{"output":"result"}');
    const provider = new HttpProvider({
      endpoint: "https://api.example.com/generate",
      headers: {
        Authorization: "Bearer my-token",
        "X-Custom": "custom-value"
      },
      requestTemplate: '{"inputs": "{{prompt}}", "parameters": {"max_new_tokens": 100}}',
      responseJsonPath: "$.output",
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({ prompt: "test input" }));

    const headers = new Headers(fakeFetch.lastInit?.headers);
    expect(headers.get("authorization")).toBe("Bearer my-token");
    expect(headers.get("x-custom")).toBe("custom-value");
    expect(String(fakeFetch.lastInit?.body)).toContain("max_new_tokens");
  });

  it("throws when the request is missing", async () => {
    const provider = new HttpProvider({
      endpoint: "https://api.example.com/generate",
      fetch: async () => new Response('{"response":"ok"}', { status: 200 })
    });

    await expect(provider.complete(undefined as never)).rejects.toThrow("Request is required.");
  });

  it("throws on http errors", async () => {
    const provider = new HttpProvider({
      endpoint: "https://api.example.com/generate",
      fetch: async () => new Response("{}", { status: 500 })
    });

    await expect(provider.complete(new LlmRequest({ prompt: "What is 2+2?" }))).rejects.toThrow(
      "Http provider request failed with status 500."
    );
  });

  it("validates constructor options", () => {
    expect(() => new HttpProvider(undefined as never)).toThrow("Options are required.");
    expect(() => new HttpProvider({ endpoint: "" })).toThrow("Endpoint cannot be null or whitespace.");
  });

  it("throws when the regex pattern does not match", async () => {
    const provider = new HttpProvider({
      endpoint: "https://api.example.com/generate",
      regexPattern: "nonexistent_pattern_xyz",
      fetch: async () => new Response('{"result":"no match here"}', { status: 200 })
    });

    await expect(provider.complete(new LlmRequest({ prompt: "What is 2+2?" }))).rejects.toThrow(
      "Regex pattern 'nonexistent_pattern_xyz' did not match the response body."
    );
  });

  it("forwards cancellation", async () => {
    const controller = new AbortController();
    controller.abort();

    const provider = new HttpProvider({
      endpoint: "https://api.example.com/generate",
      fetch: async (_input, init) => {
        if (init?.signal?.aborted) {
          throw new DOMException("This operation was aborted", "AbortError");
        }

        return new Response('{"response":"ok"}', { status: 200 });
      }
    });

    await expect(
      provider.complete(new LlmRequest({ prompt: "What is 2+2?" }), { signal: controller.signal })
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});
