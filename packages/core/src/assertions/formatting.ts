import type { AssertionFailureDetails } from "./types.js";

export function formatAssertionFailureMessage(failure: AssertionFailureDetails): string {
  if (failure === null || failure === undefined) {
    throw new TypeError("Failure is required.");
  }

  switch (failure.kind) {
    case "semantic":
      return [
        "Judgy semantic assertion failed.",
        "",
        `  Expectation  : ${failure.expectation ?? ""}`,
        `  Actual       : ${failure.actualOutput ?? ""}`,
        `  Score        : ${failure.actualScore?.toFixed(2) ?? ""}`,
        `  MinimumScore : ${failure.minimumScore?.toFixed(2) ?? ""}`,
        `  Reasoning    : ${failure.reasoning ?? ""}`
      ].join("\n");
    case "score":
      return [
        "Judgy score assertion failed.",
        "",
        `  Score        : ${failure.actualScore?.toFixed(2) ?? ""}`,
        `  MinimumScore : ${failure.minimumScore?.toFixed(2) ?? ""}`
      ].join("\n");
    case "duration":
      return [
        "Judgy duration assertion failed.",
        "",
        `  DurationMs        : ${failure.actualDurationMs ?? ""}`,
        `  MaximumDurationMs : ${failure.maximumDurationMs ?? ""}`
      ].join("\n");
    default:
      throw new RangeError(`Unknown failure kind: ${(failure as { kind: string }).kind}`);
  }
}
