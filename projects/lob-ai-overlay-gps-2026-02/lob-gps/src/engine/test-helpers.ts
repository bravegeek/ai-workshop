import type { NormalizedSelector, StateKey } from "../mapper/types.js";
import type {
  FrequencyEntry,
  TelemetryProvider,
  TransitionPacket,
} from "../telemetry/types.js";

/**
 * Create a mock TelemetryProvider from a static map of StateKey → FrequencyEntry[].
 */
export function createMockProvider(
  data: Record<string, FrequencyEntry[]>,
): TelemetryProvider {
  return {
    query(stateKey: StateKey): FrequencyEntry[] {
      return data[stateKey] ?? [];
    },
    record(_packet: TransitionPacket): void {
      // no-op for engine tests
    },
    flush(): void {
      // no-op for engine tests
    },
  };
}

/** Create a branded StateKey for tests. */
export function stateKey(value: string): StateKey {
  return value as StateKey;
}

/** Create a branded NormalizedSelector for tests. */
export function selector(value: string): NormalizedSelector {
  return value as NormalizedSelector;
}

/** Create a FrequencyEntry for tests. */
export function frequencyEntry(
  selectorValue: string,
  count: number,
  avgDwellTime = 0,
  lastSeenTimestamp = Date.now(),
): FrequencyEntry {
  return {
    selector: selector(selectorValue),
    count,
    avgDwellTime,
    lastSeenTimestamp,
  };
}
