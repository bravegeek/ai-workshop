import type {
  TransitionPacket,
  FrequencyEntry,
  TelemetryProvider,
  StateKey,
} from "./types.js";

export interface LocalStorageProviderConfig {
  storageCap?: number;
  namespace?: string;
}

/**
 * LocalStorageProvider — aggregate-on-write telemetry storage.
 * Stub implementation; full logic in T010-T014.
 */
export class LocalStorageProvider implements TelemetryProvider {
  constructor(_config?: LocalStorageProviderConfig) {
    // Full implementation in T010
  }

  record(_packet: TransitionPacket): void {
    // T010
  }

  query(_stateKey: StateKey): FrequencyEntry[] {
    return [];
  }

  flush(): void {
    // T010
  }
}
