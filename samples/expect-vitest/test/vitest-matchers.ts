import type { JudgySemanticMatcherOptions } from "@judgy/expect";

declare module "vitest" {
  interface Assertion<T = any> {
    toJudgy(options?: JudgySemanticMatcherOptions): Promise<T>;
    toHaveJudgyScore(minimumScore: number): T;
    toBeWithinJudgyDuration(maximumDurationMs: number): T;
  }
}

export {};
