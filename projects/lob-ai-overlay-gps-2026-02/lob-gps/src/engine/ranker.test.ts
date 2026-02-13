import { describe, it, expect } from "vitest";
import { rankPredicted } from "./ranker.js";
import { frequencyEntry } from "./test-helpers.js";
import { SuggestionSource } from "./types.js";

describe("rankPredicted", () => {
  it("returns suggestions in descending frequency order", () => {
    const entries = [
      frequencyEntry("#low", 2, 100, 1000),
      frequencyEntry("#high", 10, 200, 2000),
      frequencyEntry("#mid", 5, 150, 1500),
    ];

    const result = rankPredicted(entries);

    expect(result.map((s) => s.selector)).toEqual([
      "#high",
      "#mid",
      "#low",
    ]);
  });

  it("returns all entries without truncation (7 entries → 7 returned)", () => {
    const entries = Array.from({ length: 7 }, (_, i) =>
      frequencyEntry(`#el-${i}`, 7 - i, 100, 1000 + i),
    );

    const result = rankPredicted(entries);

    expect(result).toHaveLength(7);
    expect(result[0].selector).toBe("#el-0");
    expect(result[6].selector).toBe("#el-6");
  });

  it("breaks ties by lastSeenTimestamp descending", () => {
    const entries = [
      frequencyEntry("#older", 5, 100, 1000),
      frequencyEntry("#newer", 5, 100, 2000),
    ];

    const result = rankPredicted(entries);

    expect(result[0].selector).toBe("#newer");
    expect(result[1].selector).toBe("#older");
  });

  it("returns empty array for empty input", () => {
    const result = rankPredicted([]);
    expect(result).toEqual([]);
  });

  it("computes confidence as count / totalTransitions", () => {
    const entries = [
      frequencyEntry("#a", 3, 0, 1000),
      frequencyEntry("#b", 7, 0, 2000),
    ];

    const result = rankPredicted(entries);

    // #b has count 7, total = 10 → confidence = 0.7
    expect(result[0].selector).toBe("#b");
    expect(result[0].confidence).toBeCloseTo(0.7);

    // #a has count 3, total = 10 → confidence = 0.3
    expect(result[1].selector).toBe("#a");
    expect(result[1].confidence).toBeCloseTo(0.3);
  });

  it("returns confidence 1.0 for a single entry", () => {
    const entries = [frequencyEntry("#only", 42, 200, 5000)];

    const result = rankPredicted(entries);

    expect(result).toHaveLength(1);
    expect(result[0].confidence).toBe(1.0);
    expect(result[0].source).toBe(SuggestionSource.PREDICTED);
    expect(result[0].avgDwellTime).toBe(200);
  });
});
