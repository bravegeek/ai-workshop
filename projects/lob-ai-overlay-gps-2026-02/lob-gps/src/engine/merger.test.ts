import { describe, it, expect } from "vitest";
import { mergeSuggestions } from "./merger.js";
import { selector } from "./test-helpers.js";
import type { Suggestion } from "./types.js";
import { SuggestionSource } from "./types.js";

function curated(sel: string, label = "Curated"): Suggestion {
  return {
    selector: selector(sel),
    label,
    confidence: 1.0,
    source: SuggestionSource.CURATED,
    avgDwellTime: 0,
    curatedPathId: "path-1",
  };
}

function predicted(sel: string, confidence = 0.5): Suggestion {
  return {
    selector: selector(sel),
    label: `Predicted ${sel}`,
    confidence,
    source: SuggestionSource.PREDICTED,
    avgDwellTime: 100,
  };
}

describe("mergeSuggestions", () => {
  it("places curated before predicted in output", () => {
    const result = mergeSuggestions(
      [curated("#a")],
      [predicted("#b")],
      5,
    );

    expect(result[0].source).toBe(SuggestionSource.CURATED);
    expect(result[1].source).toBe(SuggestionSource.PREDICTED);
  });

  it("deduplicates — same selector in curated and predicted keeps only curated", () => {
    const result = mergeSuggestions(
      [curated("#shared")],
      [predicted("#shared"), predicted("#other")],
      5,
    );

    expect(result).toHaveLength(2);
    expect(result[0].selector).toBe("#shared");
    expect(result[0].source).toBe(SuggestionSource.CURATED);
    expect(result[1].selector).toBe("#other");
  });

  it("respects maxSuggestions (2 curated + 3 predicted, max 3 → 2 curated + 1 predicted)", () => {
    const c = [curated("#c1"), curated("#c2")];
    const p = [predicted("#p1"), predicted("#p2"), predicted("#p3")];

    const result = mergeSuggestions(c, p, 3);

    expect(result).toHaveLength(3);
    expect(result[0].selector).toBe("#c1");
    expect(result[1].selector).toBe("#c2");
    expect(result[2].selector).toBe("#p1");
  });

  it("returns only predicted when zero curated", () => {
    const result = mergeSuggestions([], [predicted("#a"), predicted("#b")], 5);

    expect(result).toHaveLength(2);
    expect(result.every((s) => s.source === SuggestionSource.PREDICTED)).toBe(true);
  });

  it("returns only curated when zero predicted", () => {
    const result = mergeSuggestions([curated("#a")], [], 5);

    expect(result).toHaveLength(1);
    expect(result[0].source).toBe(SuggestionSource.CURATED);
  });

  it("returns empty array when both empty", () => {
    const result = mergeSuggestions([], [], 5);
    expect(result).toEqual([]);
  });

  it("returns only curated when more curated than maxSuggestions", () => {
    const c = [curated("#c1"), curated("#c2"), curated("#c3"), curated("#c4")];
    const p = [predicted("#p1")];

    const result = mergeSuggestions(c, p, 3);

    expect(result).toHaveLength(3);
    expect(result.every((s) => s.source === SuggestionSource.CURATED)).toBe(true);
  });
});
