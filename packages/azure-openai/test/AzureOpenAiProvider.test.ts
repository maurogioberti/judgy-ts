import { describe, expect, it } from "@jest/globals";

import { LlmRequest } from "@judgy/core";

import { AzureOpenAiProvider } from "../src/index.js";

const ENDPOINT = "https://example-resource.openai.azure.com/";
const DEPLOYMENT_NAME = "judgy-test-deployment";
const API_VERSION = "2024-10-21";

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

describe("AzureOpenAiProvider", () => {
  it("sends the correct request", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new AzureOpenAiProvider({
      endpoint: ENDPOINT,
      apiKey: "azure-test-key-12345",
      deploymentName: DEPLOYMENT_NAME,
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    expect(fakeFetch.lastInput?.toString()).toBe(
      `${ENDPOINT}openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`
    );
    expect(fakeFetch.lastInit?.method).toBe("POST");

    const headers = new Headers(fakeFetch.lastInit?.headers);
    expect(headers.get("api-key")).toBe("azure-test-key-12345");
  });

  it("sends the correct request body", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new AzureOpenAiProvider({
      endpoint: ENDPOINT,
      apiKey: "azure-test-key-12345",
      deploymentName: DEPLOYMENT_NAME,
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    const body = JSON.parse(String(fakeFetch.lastInit?.body));
    expect(body.model).toBeUndefined();
    expect(body.temperature).toBe(0.0);
    expect(body.max_tokens).toBe(1024);
    expect(body.messages).toEqual([
      { role: "user", content: "What is 2+2?" }
    ]);
  });

  it("includes the system prompt when provided", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new AzureOpenAiProvider({
      endpoint: ENDPOINT,
      apiKey: "azure-test-key-12345",
      deploymentName: DEPLOYMENT_NAME,
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
    const provider = new AzureOpenAiProvider({
      endpoint: ENDPOINT,
      apiKey: "azure-test-key-12345",
      deploymentName: DEPLOYMENT_NAME,
      fetch: async () => new Response(makeResponseJson("Hello world", 15, 8), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    });

    const response = await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    expect(response.text).toBe("Hello world");
    expect(response.providerName).toBe("AzureOpenAI");
    expect(response.promptTokens).toBe(15);
    expect(response.completionTokens).toBe(8);
  });

  it("uses request temperature and max tokens over option defaults", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new AzureOpenAiProvider({
      endpoint: ENDPOINT,
      apiKey: "azure-test-key-12345",
      deploymentName: DEPLOYMENT_NAME,
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
    const provider = new AzureOpenAiProvider({
      endpoint: ENDPOINT,
      apiKey: "azure-test-key-12345",
      deploymentName: DEPLOYMENT_NAME,
      fetch: async () => new Response(makeResponseJson(), { status: 200 })
    });

    await expect(provider.complete(undefined as never)).rejects.toThrow("Request is required.");
  });

  it("throws on HTTP errors", async () => {
    const provider = new AzureOpenAiProvider({
      endpoint: ENDPOINT,
      apiKey: "azure-test-key-12345",
      deploymentName: DEPLOYMENT_NAME,
      fetch: async () => new Response("{}", { status: 500 })
    });

    await expect(provider.complete(new LlmRequest({ prompt: "What is 2+2?" }))).rejects.toThrow(
      "Azure OpenAI request failed with status 500."
    );
  });

  it("throws when the response has no choices", async () => {
    const provider = new AzureOpenAiProvider({
      endpoint: ENDPOINT,
      apiKey: "azure-test-key-12345",
      deploymentName: DEPLOYMENT_NAME,
      fetch: async () => new Response('{"choices":[],"usage":null}', { status: 200 })
    });

    await expect(provider.complete(new LlmRequest({ prompt: "What is 2+2?" }))).rejects.toThrow(
      "Azure OpenAI response did not contain message content."
    );
  });

  it("validates constructor options", () => {
    expect(() => new AzureOpenAiProvider(undefined as never)).toThrow("Options are required.");
    expect(() => new AzureOpenAiProvider({
      endpoint: "",
      apiKey: "azure-test-key-12345",
      deploymentName: DEPLOYMENT_NAME
    })).toThrow("Endpoint cannot be null or whitespace.");
    expect(() => new AzureOpenAiProvider({
      endpoint: ENDPOINT,
      apiKey: "",
      deploymentName: DEPLOYMENT_NAME
    })).toThrow("ApiKey cannot be null or whitespace.");
    expect(() => new AzureOpenAiProvider({
      endpoint: ENDPOINT,
      apiKey: "azure-test-key-12345",
      deploymentName: ""
    })).toThrow("DeploymentName cannot be null or whitespace.");
    expect(() => new AzureOpenAiProvider({
      endpoint: ENDPOINT,
      apiKey: "azure-test-key-12345",
      deploymentName: DEPLOYMENT_NAME,
      apiVersion: ""
    })).toThrow("ApiVersion cannot be null or whitespace.");
  });

  it("uses a custom api version when provided", async () => {
    const fakeFetch = new FakeFetch();
    const provider = new AzureOpenAiProvider({
      endpoint: ENDPOINT,
      apiKey: "azure-test-key-12345",
      deploymentName: DEPLOYMENT_NAME,
      apiVersion: "2025-01-01-preview",
      fetch: fakeFetch.handler
    });

    await provider.complete(new LlmRequest({ prompt: "What is 2+2?" }));

    expect(fakeFetch.lastInput?.toString()).toBe(
      `${ENDPOINT}openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=2025-01-01-preview`
    );
  });

  it("forwards cancellation", async () => {
    const controller = new AbortController();
    controller.abort();

    const provider = new AzureOpenAiProvider({
      endpoint: ENDPOINT,
      apiKey: "azure-test-key-12345",
      deploymentName: DEPLOYMENT_NAME,
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
