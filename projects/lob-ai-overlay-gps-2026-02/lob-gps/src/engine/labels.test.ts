import { describe, it, expect } from "vitest";
import { generatePredictedLabel } from "./labels.js";
import { CuratedIndex } from "./curated.js";
import { rankPredicted } from "./ranker.js";
import { stateKey, selector, frequencyEntry } from "./test-helpers.js";
import type { CuratedPath, Suggestion } from "./types.js";

describe("generatePredictedLabel", () => {
  it("returns 'Most common next action' for confidence >= 0.5", () => {
    expect(generatePredictedLabel(0.84)).toBe(
      "Most common next action (84%)",
    );
  });

  it("returns 'Frequently used' for confidence >= 0.2 and < 0.5", () => {
    expect(generatePredictedLabel(0.35)).toBe("Frequently used (35%)");
  });

  it("returns 'Sometimes used' for confidence < 0.2", () => {
    expect(generatePredictedLabel(0.08)).toBe("Sometimes used (8%)");
  });

  it("rounds percentage to whole number", () => {
    expect(generatePredictedLabel(0.333)).toBe("Frequently used (33%)");
    expect(generatePredictedLabel(0.155)).toBe("Sometimes used (16%)");
  });

  it("handles boundary value exactly 0.5", () => {
    expect(generatePredictedLabel(0.5)).toBe(
      "Most common next action (50%)",
    );
  });

  it("handles boundary value exactly 0.2", () => {
    expect(generatePredictedLabel(0.2)).toBe("Frequently used (20%)");
  });
});

// ─── US3: Cross-cutting label validation ────────────────────────────────────

describe("cross-cutting label validation", () => {
  it("curated label passthrough — output label identical to input", () => {
    const path: CuratedPath = {
      id: "p1",
      name: "Test",
      steps: [
        { stateKey: stateKey("url::s1"), targetSelector: selector("#a"), label: "Step 3: Review billing details", stepNumber: 1 },
        { stateKey: stateKey("url::s2"), targetSelector: selector("#b"), label: "Step 4: Confirm", stepNumber: 2 },
      ],
    };

    const index = new CuratedIndex([path]);
    const result = index.resolve(stateKey("url::s1"));

    expect(result[0].label).toBe("Step 4: Confirm");
  });

  it("label is never null, empty, or undefined across all suggestion types", () => {
    // Curated
    const path: CuratedPath = {
      id: "p1",
      name: "Test",
      steps: [
        { stateKey: stateKey("url::a"), targetSelector: selector("#x"), label: "Step A", stepNumber: 1 },
        { stateKey: stateKey("url::b"), targetSelector: selector("#y"), label: "Step B", stepNumber: 2 },
      ],
    };
    const curatedSuggestions = new CuratedIndex([path]).resolve(stateKey("url::a"));

    // Predicted
    const entries = [
      frequencyEntry("#e1", 10, 100, 1000),
      frequencyEntry("#e2", 5, 200, 2000),
    ];
    const predictedSuggestions = rankPredicted(entries);

    const allSuggestions: Suggestion[] = [...curatedSuggestions, ...predictedSuggestions];

    for (const s of allSuggestions) {
      expect(s.label).toBeDefined();
      expect(s.label).not.toBe("");
      expect(s.label).not.toBeNull();
    }
  });

  it("label never contains a raw CSS selector string", () => {
    const entries = [
      frequencyEntry("#my-button", 10, 100, 1000),
      frequencyEntry("[data-testid=submit]", 5, 200, 2000),
    ];
    const suggestions = rankPredicted(entries);

    for (const s of suggestions) {
      expect(s.label).not.toMatch(/#[a-zA-Z]/);
      expect(s.label).not.toMatch(/\[data-testid=/);
      expect(s.label).not.toMatch(/:nth-of-type/);
    }
  });

  it("predicted label at confidence 0.84", () => {
    expect(generatePredictedLabel(0.84)).toBe("Most common next action (84%)");
  });

  it("predicted label at confidence 0.35", () => {
    expect(generatePredictedLabel(0.35)).toBe("Frequently used (35%)");
  });

  it("predicted label at confidence 0.08", () => {
    expect(generatePredictedLabel(0.08)).toBe("Sometimes used (8%)");
  });

  it("confidence 0.0 → Sometimes used (0%)", () => {
    expect(generatePredictedLabel(0.0)).toBe("Sometimes used (0%)");
  });

  it("confidence 1.0 predicted → Most common next action (100%)", () => {
    expect(generatePredictedLabel(1.0)).toBe("Most common next action (100%)");
  });
});
