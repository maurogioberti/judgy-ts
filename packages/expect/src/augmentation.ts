import type { JudgySemanticMatcherOptions } from "./contracts.js";

declare module "expect" {
  interface Matchers<R extends void | Promise<void>, T = unknown> {
    toJudgy(options?: JudgySemanticMatcherOptions): Promise<R>;
    toHaveJudgyScore(minimumScore: number): R;
    toBeWithinJudgyDuration(maximumDurationMs: number): R;
  }
}

export {};
