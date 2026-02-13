import { describe, it, expect } from "vitest";
import { CuratedIndex } from "./curated.js";
import { stateKey, selector } from "./test-helpers.js";
import type { CuratedPath } from "./types.js";
import { SuggestionSource } from "./types.js";

function makePath(
  id: string,
  steps: { stateKey: string; targetSelector: string; label: string; stepNumber: number }[],
): CuratedPath {
  return {
    id,
    name: `Path ${id}`,
    steps: steps.map((s) => ({
      stateKey: stateKey(s.stateKey),
      targetSelector: selector(s.targetSelector),
      label: s.label,
      stepNumber: s.stepNumber,
    })),
  };
}

describe("CuratedIndex", () => {
  it("suggests the next step when at step 2 of a 4-step path", () => {
    const path = makePath("onboarding", [
      { stateKey: "url::s1", targetSelector: "#s1", label: "Step 1", stepNumber: 1 },
      { stateKey: "url::s2", targetSelector: "#s2", label: "Step 2", stepNumber: 2 },
      { stateKey: "url::s3", targetSelector: "#s3", label: "Step 3", stepNumber: 3 },
      { stateKey: "url::s4", targetSelector: "#s4", label: "Step 4", stepNumber: 4 },
    ]);

    const index = new CuratedIndex([path]);
    const result = index.resolve(stateKey("url::s2"));

    expect(result).toHaveLength(1);
    expect(result[0].selector).toBe("#s3");
    expect(result[0].label).toBe("Step 3");
    expect(result[0].source).toBe(SuggestionSource.CURATED);
  });

  it("returns no suggestion at the last step", () => {
    const path = makePath("flow", [
      { stateKey: "url::a", targetSelector: "#a", label: "A", stepNumber: 1 },
      { stateKey: "url::b", targetSelector: "#b", label: "B", stepNumber: 2 },
    ]);

    const index = new CuratedIndex([path]);
    const result = index.resolve(stateKey("url::b"));

    expect(result).toEqual([]);
  });

  it("returns empty for empty paths array", () => {
    const index = new CuratedIndex([]);
    const result = index.resolve(stateKey("any"));

    expect(result).toEqual([]);
  });

  it("returns empty for non-matching StateKey", () => {
    const path = makePath("p", [
      { stateKey: "url::x", targetSelector: "#x", label: "X", stepNumber: 1 },
      { stateKey: "url::y", targetSelector: "#y", label: "Y", stepNumber: 2 },
    ]);

    const index = new CuratedIndex([path]);
    const result = index.resolve(stateKey("url::z"));

    expect(result).toEqual([]);
  });

  it("uses exact string match only (no partial matching)", () => {
    const path = makePath("exact", [
      { stateKey: "url::abc", targetSelector: "#abc", label: "ABC", stepNumber: 1 },
      { stateKey: "url::abcdef", targetSelector: "#def", label: "DEF", stepNumber: 2 },
    ]);

    const index = new CuratedIndex([path]);

    // Partial match should not work
    expect(index.resolve(stateKey("url::ab"))).toEqual([]);
    // Exact match should work
    expect(index.resolve(stateKey("url::abc"))).toHaveLength(1);
  });

  it("returns both next steps when multiple paths match same StateKey", () => {
    const path1 = makePath("p1", [
      { stateKey: "url::shared", targetSelector: "#a", label: "A", stepNumber: 1 },
      { stateKey: "url::next1", targetSelector: "#b", label: "B", stepNumber: 2 },
    ]);
    const path2 = makePath("p2", [
      { stateKey: "url::shared", targetSelector: "#c", label: "C", stepNumber: 1 },
      { stateKey: "url::next2", targetSelector: "#d", label: "D", stepNumber: 2 },
    ]);

    const index = new CuratedIndex([path1, path2]);
    const result = index.resolve(stateKey("url::shared"));

    expect(result).toHaveLength(2);
    const selectors = result.map((s) => s.selector);
    expect(selectors).toContain("#b");
    expect(selectors).toContain("#d");
  });

  it("deduplicates by targetSelector — first-registered path wins", () => {
    const path1 = makePath("first", [
      { stateKey: "url::here", targetSelector: "#x", label: "First", stepNumber: 1 },
      { stateKey: "url::there", targetSelector: "#target", label: "First target", stepNumber: 2 },
    ]);
    const path2 = makePath("second", [
      { stateKey: "url::here", targetSelector: "#y", label: "Second", stepNumber: 1 },
      { stateKey: "url::there2", targetSelector: "#target", label: "Second target", stepNumber: 2 },
    ]);

    const index = new CuratedIndex([path1, path2]);
    const result = index.resolve(stateKey("url::here"));

    // Both suggest #target, but first-registered wins
    const targetResults = result.filter((s) => s.selector === "#target");
    expect(targetResults).toHaveLength(1);
    expect(targetResults[0].label).toBe("First target");
    expect(targetResults[0].curatedPathId).toBe("first");
  });

  it("produces suggestions with confidence 1.0, avgDwellTime 0, and correct curatedPathId", () => {
    const path = makePath("golden", [
      { stateKey: "url::start", targetSelector: "#begin", label: "Begin", stepNumber: 1 },
      { stateKey: "url::end", targetSelector: "#finish", label: "Finish", stepNumber: 2 },
    ]);

    const index = new CuratedIndex([path]);
    const result = index.resolve(stateKey("url::start"));

    expect(result).toHaveLength(1);
    expect(result[0].confidence).toBe(1.0);
    expect(result[0].avgDwellTime).toBe(0);
    expect(result[0].curatedPathId).toBe("golden");
  });
});
