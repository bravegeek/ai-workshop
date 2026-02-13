import type {
  TransitionPacket,
  FrequencyEntry,
  TelemetryProvider,
  NormalizedSelector,
  StateKey,
} from "./types.js";
import { ActionType } from "./types.js";

/**
 * Create a TransitionPacket with sensible defaults.
 * Override any field via the partial parameter.
 */
export function createMockPacket(
  overrides: Partial<TransitionPacket> = {},
): TransitionPacket {
  return {
    stateKey: "http://localhost/test::#save-btn" as StateKey,
    normalizedSelector: "#save-btn" as NormalizedSelector,
    actionType: ActionType.CLICK,
    dwellTime: 150,
    timestamp: performance.now(),
    sessionId: "test-session-abc123",
    ...overrides,
  };
}

/**
 * In-memory TelemetryProvider for testing.
 * Uses aggregate-on-write matching the real provider's behavior.
 */
export class MockProvider implements TelemetryProvider {
  /** Exposed for test assertions */
  readonly calls: TransitionPacket[] = [];

  private data = new Map<string, Map<string, { c: number; d: number; t: number }>>();

  record(packet: TransitionPacket): void {
    this.calls.push(packet);

    let selectorMap = this.data.get(packet.stateKey);
    if (!selectorMap) {
      selectorMap = new Map();
      this.data.set(packet.stateKey, selectorMap);
    }

    const existing = selectorMap.get(packet.normalizedSelector);
    if (existing) {
      existing.d = (existing.d * existing.c + packet.dwellTime) / (existing.c + 1);
      existing.c += 1;
      existing.t = Date.now();
    } else {
      selectorMap.set(packet.normalizedSelector, {
        c: 1,
        d: packet.dwellTime,
        t: Date.now(),
      });
    }
  }

  query(stateKey: StateKey): FrequencyEntry[] {
    const selectorMap = this.data.get(stateKey);
    if (!selectorMap) return [];

    const entries: FrequencyEntry[] = [];
    for (const [selector, agg] of selectorMap) {
      entries.push({
        selector: selector as NormalizedSelector,
        count: agg.c,
        avgDwellTime: agg.d,
        lastSeenTimestamp: agg.t,
      });
    }

    return entries.sort((a, b) => b.count - a.count);
  }

  flush(): void {
    this.data.clear();
    this.calls.length = 0;
  }
}
