import { describe, it, expect, vi } from "vitest";
import { Engine } from "./index.js";
import {
  createMockProvider,
  stateKey,
  selector,
  frequencyEntry,
} from "./test-helpers.js";
import type { CuratedPath, EngineConfig } from "./types.js";
import { SuggestionSource } from "./types.js";

function makeConfig(overrides: Partial<EngineConfig> = {}): EngineConfig {
  return {
    telemetryProvider: createMockProvider({}),
    ...overrides,
  };
}

describe("Engine", () => {
  it("full pipeline: mock provider → query → correctly ranked Suggestion[]", () => {
    const provider = createMockProvider({
      "url::#btn": [
        frequencyEntry("#next", 10, 200, 3000),
        frequencyEntry("#alt", 3, 100, 1000),
        frequencyEntry("#rare", 1, 50, 500),
      ],
    });

    const engine = new Engine({ telemetryProvider: provider });
    const result = engine.query(stateKey("url::#btn"));

    expect(result).toHaveLength(3);
    expect(result[0].selector).toBe("#next");
    expect(result[1].selector).toBe("#alt");
    expect(result[2].selector).toBe("#rare");
    expect(result[0].source).toBe(SuggestionSource.PREDICTED);
  });

  it("cold start (empty provider, no paths) → []", () => {
    const engine = new Engine(makeConfig());
    const result = engine.query(stateKey("url::anything"));

    expect(result).toEqual([]);
  });

  it("curated + predicted mixed scenario → correct order, dedup, labels", () => {
    const path: CuratedPath = {
      id: "onboarding",
      name: "Onboarding",
      steps: [
        { stateKey: stateKey("url::s1"), targetSelector: selector("#s1-target"), label: "Step 1", stepNumber: 1 },
        { stateKey: stateKey("url::s2"), targetSelector: selector("#s2-target"), label: "Go to step 2 target", stepNumber: 2 },
      ],
    };

    // Curated at url::s1 suggests next step's targetSelector = #s2-target
    // Predicted has #s2-target (same → deduped) and #other (unique → kept)
    const provider = createMockProvider({
      "url::s1": [
        frequencyEntry("#s2-target", 8, 100, 2000),
        frequencyEntry("#other", 5, 50, 1000),
      ],
    });

    const engine = new Engine({
      telemetryProvider: provider,
      curatedPaths: [path],
      maxSuggestions: 5,
    });

    const result = engine.query(stateKey("url::s1"));

    // Curated #s2-target should appear first, predicted #s2-target should be deduped
    expect(result[0].selector).toBe("#s2-target");
    expect(result[0].source).toBe(SuggestionSource.CURATED);
    expect(result[0].label).toBe("Go to step 2 target");

    // Predicted #other should follow
    expect(result[1].selector).toBe("#other");
    expect(result[1].source).toBe(SuggestionSource.PREDICTED);

    // No duplicate #s2-target
    expect(result).toHaveLength(2);
  });

  it("maxSuggestions config respected", () => {
    const provider = createMockProvider({
      "url::k": [
        frequencyEntry("#a", 10, 0, 1000),
        frequencyEntry("#b", 8, 0, 1000),
        frequencyEntry("#c", 6, 0, 1000),
        frequencyEntry("#d", 4, 0, 1000),
        frequencyEntry("#e", 2, 0, 1000),
      ],
    });

    const engine = new Engine({
      telemetryProvider: provider,
      maxSuggestions: 2,
    });

    const result = engine.query(stateKey("url::k"));
    expect(result).toHaveLength(2);
  });

  it("error in provider.query() → returns [] and calls onError", () => {
    const onError = vi.fn();
    const provider = createMockProvider({});
    provider.query = () => {
      throw new Error("provider broke");
    };

    const engine = new Engine({
      telemetryProvider: provider,
      onError,
    });

    const result = engine.query(stateKey("url::fail"));

    expect(result).toEqual([]);
    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toBe("provider broke");
  });

  it("error in onError callback → silenced, still returns []", () => {
    const provider = createMockProvider({});
    provider.query = () => {
      throw new Error("provider broke");
    };

    const engine = new Engine({
      telemetryProvider: provider,
      onError: () => {
        throw new Error("callback broke too");
      },
    });

    const result = engine.query(stateKey("url::double-fail"));
    expect(result).toEqual([]);
  });

  it("onError not configured → errors silently return []", () => {
    const provider = createMockProvider({});
    provider.query = () => {
      throw new Error("no handler");
    };

    const engine = new Engine({ telemetryProvider: provider });
    const result = engine.query(stateKey("url::silent"));

    expect(result).toEqual([]);
  });

  it("query is stateless — two calls with different StateKeys return independent results", () => {
    const provider = createMockProvider({
      "url::a": [frequencyEntry("#x", 5, 0, 1000)],
      "url::b": [frequencyEntry("#y", 3, 0, 2000)],
    });

    const engine = new Engine({ telemetryProvider: provider });

    const resultA = engine.query(stateKey("url::a"));
    const resultB = engine.query(stateKey("url::b"));

    expect(resultA).toHaveLength(1);
    expect(resultA[0].selector).toBe("#x");

    expect(resultB).toHaveLength(1);
    expect(resultB[0].selector).toBe("#y");
  });

  it("default maxSuggestions is 3 when not configured", () => {
    const provider = createMockProvider({
      "url::k": [
        frequencyEntry("#a", 10, 0, 1000),
        frequencyEntry("#b", 8, 0, 1000),
        frequencyEntry("#c", 6, 0, 1000),
        frequencyEntry("#d", 4, 0, 1000),
      ],
    });

    const engine = new Engine({ telemetryProvider: provider });
    const result = engine.query(stateKey("url::k"));

    expect(result).toHaveLength(3);
  });

  it("curatedPaths defaults to [] when not configured", () => {
    const provider = createMockProvider({
      "url::k": [frequencyEntry("#a", 5, 0, 1000)],
    });

    const engine = new Engine({ telemetryProvider: provider });
    const result = engine.query(stateKey("url::k"));

    expect(result).toHaveLength(1);
    expect(result[0].source).toBe(SuggestionSource.PREDICTED);
  });

  it("performance: average query < 50ms with 100 entries + 3 curated paths", () => {
    // Build 100 frequency entries for a single StateKey
    const entries: Record<string, ReturnType<typeof frequencyEntry>[]> = {
      "url::perf": Array.from({ length: 100 }, (_, i) =>
        frequencyEntry(`#el-${i}`, 100 - i, i * 10, Date.now() - i * 1000),
      ),
    };
    const provider = createMockProvider(entries);

    // Build 3 curated paths with 10 steps each
    const curatedPaths = Array.from({ length: 3 }, (_, p) => ({
      id: `path-${p}`,
      name: `Path ${p}`,
      steps: Array.from({ length: 10 }, (_, s) => ({
        stateKey: stateKey(`url::p${p}-s${s}`),
        targetSelector: selector(`#p${p}-s${s + 1}`),
        label: `Step ${s + 1}`,
        stepNumber: s + 1,
      })),
    }));

    const engine = new Engine({
      telemetryProvider: provider,
      curatedPaths,
      maxSuggestions: 5,
    });

    const iterations = 1000;
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      engine.query(stateKey("url::perf"));
    }
    const elapsed = performance.now() - start;
    const avgMs = elapsed / iterations;

    expect(avgMs).toBeLessThan(50);
  });
});
