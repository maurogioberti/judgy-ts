import { describe, expect, it } from "@jest/globals";

import { extractJsonPath } from "../src/internal/jsonPathExtractor.js";

describe("extractJsonPath", () => {
  it("extracts simple, nested, and indexed values", () => {
    expect(extractJsonPath('{"response":"hello"}', "$.response")).toBe("hello");
    expect(extractJsonPath('{"data":{"text":"nested"}}', "$.data.text")).toBe("nested");
    expect(extractJsonPath('{"items":["first","second","third"]}', "$.items[1]")).toBe("second");
    expect(extractJsonPath('{"choices":[{"message":{"content":"result"}}]}', "$.choices[0].message.content")).toBe("result");
  });

  it("returns raw json text for numeric values", () => {
    expect(extractJsonPath('{"count":42}', "$.count")).toBe("42");
  });

  it("supports deeply nested paths and multiple array indices", () => {
    expect(extractJsonPath('{"a":{"b":{"c":{"d":"deep"}}}}', "$.a.b.c.d")).toBe("deep");
    expect(extractJsonPath('{"matrix":[[1,2],[3,4]]}', "$.matrix[1][0]")).toBe("3");
  });

  it("throws for missing properties and invalid traversals", () => {
    expect(() => extractJsonPath('{"data":"value"}', "$.missing")).toThrow("Property 'missing' not found");
    expect(() => extractJsonPath('{"items":["only"]}', "$.items[5]")).toThrow("out of range");
    expect(() => extractJsonPath('{"items":[1,2,3]}', "$.items.name")).toThrow("Expected JSON object");
    expect(() => extractJsonPath('{"data":{"name":"test"}}', "$.data[0]")).toThrow("Expected JSON array");
  });

  it("throws for empty json or path", () => {
    expect(() => extractJsonPath("" as never, "$.path")).toThrow("JSON content cannot be null or whitespace.");
    expect(() => extractJsonPath("{}", "" as never)).toThrow("JSON path cannot be null or whitespace.");
  });
});
