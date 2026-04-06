import { extractJsonPath } from "./jsonPathExtractor.js";

export function extractResponseText(
  responseBody: string,
  responseJsonPath: string,
  regexPattern?: string
): string {
  if (regexPattern === undefined) {
    return extractJsonPath(responseBody, responseJsonPath);
  }

  return extractViaRegex(responseBody, regexPattern);
}

function extractViaRegex(responseBody: string, pattern: string): string {
  const match = new RegExp(pattern).exec(responseBody);

  if (match === null) {
    throw new Error(`Regex pattern '${pattern}' did not match the response body.`);
  }

  return match.length > 1 ? match[1] ?? match[0] : match[0];
}
