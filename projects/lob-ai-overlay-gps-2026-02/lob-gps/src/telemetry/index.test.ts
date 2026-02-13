import { describe, it, expect, beforeEach, vi } from "vitest";
import { Telemetry } from "./index.js";
import { ActionType } from "./types.js";
import type { NormalizedSelector, StateKey, TransitionPacket } from "./types.js";
import { MockProvider } from "./test-helpers.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

const stateKey = "http://localhost/test::#save-btn" as StateKey;
const selector = "#save-btn" as NormalizedSelector;

function createTelemetryWithMock() {
  const provider = new MockProvider();
  const telemetry = new Telemetry({ provider });
  return { telemetry, provider };
}

// ─── US1: record() ──────────────────────────────────────────────────────────

describe("Telemetry.record() — US1", () => {
  it("creates a packet with correct stateKey, selector, actionType, and dwellTime (US1-AC1)", () => {
    const { telemetry, provider } = createTelemetryWithMock();

    telemetry.record(stateKey, selector, ActionType.CLICK);

    expect(provider.calls).toHaveLength(1);
    const packet = provider.calls[0];
    expect(packet.stateKey).toBe(stateKey);
    expect(packet.normalizedSelector).toBe(selector);
    expect(packet.actionType).toBe("click");
    expect(typeof packet.dwellTime).toBe("number");
    expect(packet.dwellTime).toBeGreaterThanOrEqual(0);
  });

  it("uses normalizedSelector from Mapper, not raw IDs (US1-AC2)", () => {
    const { telemetry, provider } = createTelemetryWithMock();
    const normalizedSel = 'input[name="ref_code"]' as NormalizedSelector;

    telemetry.record(stateKey, normalizedSel, ActionType.FOCUS);

    expect(provider.calls[0].normalizedSelector).toBe('input[name="ref_code"]');
    // Should NOT contain dynamic ID like ember-id-7721-a
    expect(provider.calls[0].normalizedSelector).not.toContain("ember");
  });

  it("does NOT include value/innerText/keystrokes for input actionType (US1-AC3)", () => {
    const { telemetry, provider } = createTelemetryWithMock();

    telemetry.record(stateKey, selector, ActionType.INPUT);

    const packet = provider.calls[0] as unknown as Record<string, unknown>;
    expect(packet).not.toHaveProperty("value");
    expect(packet).not.toHaveProperty("innerText");
    expect(packet).not.toHaveProperty("textContent");
    expect(packet).not.toHaveProperty("keystrokes");
    expect(packet).not.toHaveProperty("clipboard");
    expect(Object.keys(packet).sort()).toEqual([
      "actionType",
      "dwellTime",
      "normalizedSelector",
      "sessionId",
      "stateKey",
      "timestamp",
    ]);
  });

  it("contains monotonic timestamp and random sessionId (US1-AC4)", () => {
    const { telemetry, provider } = createTelemetryWithMock();

    telemetry.record(stateKey, selector, ActionType.CLICK);
    telemetry.record(stateKey, selector, ActionType.CLICK);

    const [p1, p2] = provider.calls;
    // Timestamps are monotonic (non-decreasing)
    expect(p2.timestamp).toBeGreaterThanOrEqual(p1.timestamp);
    // sessionId is non-empty
    expect(p1.sessionId.length).toBeGreaterThan(0);
    // sessionId is stable within session
    expect(p1.sessionId).toBe(p2.sessionId);
  });

  it("records navigation actionType for SPA route changes (US1-AC5)", () => {
    const { telemetry, provider } = createTelemetryWithMock();
    const newStateKey = "http://localhost/new-route::#nav" as StateKey;

    telemetry.record(newStateKey, "#nav" as NormalizedSelector, ActionType.NAVIGATION);

    expect(provider.calls[0].actionType).toBe("navigation");
    expect(provider.calls[0].stateKey).toBe(newStateKey);
  });

  it("catches and silences provider.record() throws (US1-AC6)", () => {
    const provider = new MockProvider();
    vi.spyOn(provider, "record").mockImplementation(() => {
      throw new Error("Storage full");
    });
    const telemetry = new Telemetry({ provider });

    // Should not throw
    expect(() => telemetry.record(stateKey, selector, ActionType.CLICK)).not.toThrow();
  });

  it("computes dwellTime as performance.now() delta between calls", async () => {
    const { telemetry, provider } = createTelemetryWithMock();

    telemetry.record(stateKey, selector, ActionType.CLICK);
    // Wait a measurable amount
    await new Promise((resolve) => setTimeout(resolve, 20));
    telemetry.record(stateKey, selector, ActionType.CLICK);

    // First call has 0 dwellTime (no previous call)
    expect(provider.calls[0].dwellTime).toBe(0);
    // Second call should have positive dwellTime
    expect(provider.calls[1].dwellTime).toBeGreaterThan(0);
  });

  it("sessionId is random per Telemetry instance", () => {
    const { telemetry: t1, provider: p1 } = createTelemetryWithMock();
    const { telemetry: t2, provider: p2 } = createTelemetryWithMock();

    t1.record(stateKey, selector, ActionType.CLICK);
    t2.record(stateKey, selector, ActionType.CLICK);

    // Different instances should have different sessionIds
    expect(p1.calls[0].sessionId).not.toBe(p2.calls[0].sessionId);
  });

  it("records a 3-step workflow correctly (SC-001)", () => {
    const { telemetry, provider } = createTelemetryWithMock();

    telemetry.record(stateKey, 'input[name="account_id"]' as NormalizedSelector, ActionType.FOCUS);
    telemetry.record(stateKey, "#save-btn" as NormalizedSelector, ActionType.CLICK);
    telemetry.record(stateKey, "#finalize-btn" as NormalizedSelector, ActionType.CLICK);

    expect(provider.calls).toHaveLength(3);
    expect(provider.calls[0].actionType).toBe("focus");
    expect(provider.calls[1].actionType).toBe("click");
    expect(provider.calls[2].actionType).toBe("click");
    expect(provider.calls[0].normalizedSelector).toBe('input[name="account_id"]');
    expect(provider.calls[1].normalizedSelector).toBe("#save-btn");
    expect(provider.calls[2].normalizedSelector).toBe("#finalize-btn");
  });
});

// ─── US2: query() ───────────────────────────────────────────────────────────

describe("Telemetry.query() — US2", () => {
  it("returns frequency-sorted results for a stateKey (US2-AC1)", () => {
    const { telemetry, provider } = createTelemetryWithMock();
    const sk = "http://test.com/page::state-a" as StateKey;

    // Record 6 to X, 3 to Y, 1 to Z
    for (let i = 0; i < 6; i++) telemetry.record(sk, "#x" as NormalizedSelector, ActionType.CLICK);
    for (let i = 0; i < 3; i++) telemetry.record(sk, "#y" as NormalizedSelector, ActionType.CLICK);
    telemetry.record(sk, "#z" as NormalizedSelector, ActionType.CLICK);

    const results = telemetry.query(sk);
    expect(results).toHaveLength(3);
    expect(results[0].selector).toBe("#x");
    expect(results[0].count).toBe(6);
    expect(results[1].selector).toBe("#y");
    expect(results[1].count).toBe(3);
    expect(results[2].selector).toBe("#z");
    expect(results[2].count).toBe(1);
  });

  it("returns empty array for unknown stateKey (US2-AC2)", () => {
    const { telemetry } = createTelemetryWithMock();

    const results = telemetry.query("unknown::key" as StateKey);
    expect(results).toEqual([]);
    expect(Array.isArray(results)).toBe(true);
  });

  it("includes avgDwellTime in results (US2-AC3)", () => {
    const { telemetry } = createTelemetryWithMock();
    const sk = "http://test.com/page::state-a" as StateKey;

    telemetry.record(sk, "#btn" as NormalizedSelector, ActionType.CLICK);
    telemetry.record(sk, "#btn" as NormalizedSelector, ActionType.CLICK);

    const results = telemetry.query(sk);
    expect(results).toHaveLength(1);
    expect(typeof results[0].avgDwellTime).toBe("number");
    expect(results[0].avgDwellTime).toBeGreaterThanOrEqual(0);
  });

  it("includes lastSeenTimestamp in results", () => {
    const { telemetry } = createTelemetryWithMock();
    const sk = "http://test.com/page::state-a" as StateKey;

    telemetry.record(sk, "#btn" as NormalizedSelector, ActionType.CLICK);

    const results = telemetry.query(sk);
    expect(typeof results[0].lastSeenTimestamp).toBe("number");
    expect(results[0].lastSeenTimestamp).toBeGreaterThan(0);
  });

  it("returns empty array when provider throws (US2-AC4)", () => {
    const provider = new MockProvider();
    vi.spyOn(provider, "query").mockImplementation(() => {
      throw new Error("Corrupt data");
    });
    const telemetry = new Telemetry({ provider });

    const results = telemetry.query(stateKey);
    expect(results).toEqual([]);
  });
});

// ─── flush() ────────────────────────────────────────────────────────────────

describe("Telemetry.flush()", () => {
  it("delegates to provider.flush()", () => {
    const provider = new MockProvider();
    const flushSpy = vi.spyOn(provider, "flush");
    const telemetry = new Telemetry({ provider });

    telemetry.flush();

    expect(flushSpy).toHaveBeenCalledOnce();
  });

  it("catches and silences provider.flush() throws", () => {
    const provider = new MockProvider();
    vi.spyOn(provider, "flush").mockImplementation(() => {
      throw new Error("Flush failed");
    });
    const telemetry = new Telemetry({ provider });

    expect(() => telemetry.flush()).not.toThrow();
  });
});

// ─── teardown() ─────────────────────────────────────────────────────────────

describe("Telemetry.teardown()", () => {
  it("makes all methods no-op after teardown", () => {
    const { telemetry, provider } = createTelemetryWithMock();

    telemetry.teardown();

    // record should no-op
    telemetry.record(stateKey, selector, ActionType.CLICK);
    expect(provider.calls).toHaveLength(0);

    // query should return empty
    expect(telemetry.query(stateKey)).toEqual([]);

    // flush should not throw
    expect(() => telemetry.flush()).not.toThrow();
  });
});
