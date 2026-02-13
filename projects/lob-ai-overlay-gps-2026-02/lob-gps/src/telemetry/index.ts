import type {
  TransitionPacket,
  FrequencyEntry,
  TelemetryProvider,
  TelemetryConfig,
  NormalizedSelector,
  StateKey,
} from "./types.js";
import { ActionType } from "./types.js";
import { LocalStorageProvider } from "./local-storage-provider.js";

export { ActionType };
export type {
  TransitionPacket,
  FrequencyEntry,
  TelemetryProvider,
  TelemetryConfig,
  NormalizedSelector,
  StateKey,
};

export class Telemetry {
  private provider: TelemetryProvider;
  private readonly sessionId: string;
  private lastRecordTime: number = 0;
  private disposed = false;

  constructor(config?: TelemetryConfig) {
    this.sessionId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

    this.provider = config?.provider ?? new LocalStorageProvider({
      storageCap: config?.storageCap,
      namespace: config?.namespace,
    });
  }

  record(
    stateKey: StateKey,
    normalizedSelector: NormalizedSelector,
    actionType: ActionType,
  ): void {
    if (this.disposed) return;

    const now = performance.now();
    const dwellTime = this.lastRecordTime === 0 ? 0 : now - this.lastRecordTime;
    this.lastRecordTime = now;

    const packet: TransitionPacket = {
      stateKey,
      normalizedSelector,
      actionType,
      dwellTime,
      timestamp: now,
      sessionId: this.sessionId,
    };

    try {
      this.provider.record(packet);
    } catch {
      // FR-009: silenced
    }
  }

  query(stateKey: StateKey): FrequencyEntry[] {
    if (this.disposed) return [];

    try {
      return this.provider.query(stateKey);
    } catch {
      return [];
    }
  }

  flush(): void {
    if (this.disposed) return;

    try {
      this.provider.flush();
    } catch {
      // FR-009: silenced
    }
  }

  swapProvider(provider: TelemetryProvider): void {
    if (this.disposed) return;

    try {
      this.provider.flush();
    } catch {
      // FR-009: silenced
    }

    this.provider = provider;
  }

  teardown(): void {
    this.disposed = true;
  }
}
