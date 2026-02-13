import { describe, it, expect } from "vitest";
import type {
  TransitionPacket,
  FrequencyEntry,
  TelemetryProvider,
  AggregateEntry,
  StorageEnvelope,
  NormalizedSelector,
  StateKey,
} from "./types.js";
import { ActionType } from "./types.js";
import { createMockPacket, MockProvider } from "./test-helpers.js";

// ─── TransitionPacket Schema Validation ──────────────────────────────────────

describe("TransitionPacket schema", () => {
  it("contains all required fields with correct types", () => {
    const packet = createMockPacket();

    expect(typeof packet.stateKey).toBe("string");
    expect(typeof packet.normalizedSelector).toBe("string");
    expect(typeof packet.actionType).toBe("string");
    expect(typeof packet.dwellTime).toBe("number");
    expect(typeof packet.timestamp).toBe("number");
    expect(typeof packet.sessionId).toBe("string");
  });

  it("stateKey is a branded StateKey string", () => {
    const packet = createMockPacket();
    expect(packet.stateKey).toContain("::");
  });

  it("actionType is one of the valid ActionType values", () => {
    const validTypes = ["click", "focus", "input", "navigation"];
    for (const type of validTypes) {
      const packet = createMockPacket({ actionType: type as ActionType });
      expect(validTypes).toContain(packet.actionType);
    }
  });

  it("dwellTime is non-negative", () => {
    const packet = createMockPacket({ dwellTime: 0 });
    expect(packet.dwellTime).toBeGreaterThanOrEqual(0);
  });

  it("timestamp is positive", () => {
    const packet = createMockPacket();
    expect(packet.timestamp).toBeGreaterThan(0);
  });

  it("sessionId is non-empty", () => {
    const packet = createMockPacket();
    expect(packet.sessionId.length).toBeGreaterThan(0);
  });

  it("does NOT contain input values (FR-002)", () => {
    const packet = createMockPacket() as unknown as Record<string, unknown>;
    expect(packet).not.toHaveProperty("value");
    expect(packet).not.toHaveProperty("inputValue");
    expect(packet).not.toHaveProperty("text");
  });

  it("does NOT contain clipboard data (FR-002)", () => {
    const packet = createMockPacket() as unknown as Record<string, unknown>;
    expect(packet).not.toHaveProperty("clipboard");
    expect(packet).not.toHaveProperty("clipboardData");
  });

  it("does NOT contain innerText (FR-002)", () => {
    const packet = createMockPacket() as unknown as Record<string, unknown>;
    expect(packet).not.toHaveProperty("innerText");
    expect(packet).not.toHaveProperty("textContent");
    expect(packet).not.toHaveProperty("innerHTML");
  });

  it("has exactly 6 fields — no extra properties", () => {
    const packet = createMockPacket();
    const keys = Object.keys(packet);
    expect(keys).toHaveLength(6);
    expect(keys.sort()).toEqual([
      "actionType",
      "dwellTime",
      "normalizedSelector",
      "sessionId",
      "stateKey",
      "timestamp",
    ]);
  });
});

// ─── FrequencyEntry Schema ──────────────────────────────────────────────────

describe("FrequencyEntry schema", () => {
  it("contains all required fields", () => {
    const entry: FrequencyEntry = {
      selector: "#btn" as NormalizedSelector,
      count: 5,
      avgDwellTime: 1200,
      lastSeenTimestamp: Date.now(),
    };
    expect(typeof entry.selector).toBe("string");
    expect(typeof entry.count).toBe("number");
    expect(typeof entry.avgDwellTime).toBe("number");
    expect(typeof entry.lastSeenTimestamp).toBe("number");
  });
});

// ─── AggregateEntry Schema ──────────────────────────────────────────────────

describe("AggregateEntry schema", () => {
  it("uses shortened storage keys (c, d, t)", () => {
    const entry: AggregateEntry = { c: 1, d: 100, t: Date.now() };
    expect(entry).toHaveProperty("c");
    expect(entry).toHaveProperty("d");
    expect(entry).toHaveProperty("t");
  });
});

// ─── StorageEnvelope Schema ─────────────────────────────────────────────────

describe("StorageEnvelope schema", () => {
  it("has version field and data map", () => {
    const envelope: StorageEnvelope = { v: 1, data: {} };
    expect(envelope.v).toBe(1);
    expect(typeof envelope.data).toBe("object");
  });
});

// ─── MockProvider Contract ──────────────────────────────────────────────────

describe("MockProvider", () => {
  it("implements TelemetryProvider interface", () => {
    const provider = new MockProvider();
    const p: TelemetryProvider = provider;
    expect(typeof p.record).toBe("function");
    expect(typeof p.query).toBe("function");
    expect(typeof p.flush).toBe("function");
  });

  it("stores packets via record() and retrieves via query()", () => {
    const provider = new MockProvider();
    const stateKey = "http://test.com::#btn" as StateKey;

    provider.record(createMockPacket({ stateKey }));
    provider.record(createMockPacket({ stateKey }));

    const results = provider.query(stateKey);
    expect(results).toHaveLength(1);
    expect(results[0].count).toBe(2);
  });

  it("query() returns empty array for unknown stateKey", () => {
    const provider = new MockProvider();
    const results = provider.query("unknown::key" as StateKey);
    expect(results).toEqual([]);
  });

  it("query() returns results sorted by count descending", () => {
    const provider = new MockProvider();
    const stateKey = "http://test.com::#btn" as StateKey;

    // 3 clicks on #btn-a
    for (let i = 0; i < 3; i++) {
      provider.record(
        createMockPacket({ stateKey, normalizedSelector: "#btn-a" as NormalizedSelector }),
      );
    }
    // 1 click on #btn-b
    provider.record(
      createMockPacket({ stateKey, normalizedSelector: "#btn-b" as NormalizedSelector }),
    );

    const results = provider.query(stateKey);
    expect(results[0].selector).toBe("#btn-a");
    expect(results[0].count).toBe(3);
    expect(results[1].selector).toBe("#btn-b");
    expect(results[1].count).toBe(1);
  });

  it("flush() clears all data", () => {
    const provider = new MockProvider();
    const stateKey = "http://test.com::#btn" as StateKey;
    provider.record(createMockPacket({ stateKey }));
    provider.flush();
    expect(provider.query(stateKey)).toEqual([]);
  });
});
