import type { NormalizedSelector, StateKey } from "../mapper/types.js";

export type { NormalizedSelector, StateKey };

// ─── Enums ───────────────────────────────────────────────────────────────────

export const enum ActionType {
  CLICK = "click",
  FOCUS = "focus",
  INPUT = "input",
  NAVIGATION = "navigation",
}

// ─── Data Structures ─────────────────────────────────────────────────────────

/** The atomic unit of telemetry — a single interaction event. */
export interface TransitionPacket {
  readonly stateKey: StateKey;
  readonly normalizedSelector: NormalizedSelector;
  readonly actionType: ActionType;
  /** Milliseconds since last action (performance.now() delta) */
  readonly dwellTime: number;
  /** Monotonic timestamp at packet creation (performance.now()) */
  readonly timestamp: number;
  /** Random per-page-load identifier, not tied to user identity */
  readonly sessionId: string;
}

/** A query result entry — aggregated interaction data for a single selector. */
export interface FrequencyEntry {
  readonly selector: NormalizedSelector;
  readonly count: number;
  readonly avgDwellTime: number;
  /** Date.now() of most recent interaction (cross-session comparable) */
  readonly lastSeenTimestamp: number;
}

// ─── Provider Interface ─────────────────────────────────────────────────────

export interface TelemetryProvider {
  record(packet: TransitionPacket): void;
  query(stateKey: StateKey): FrequencyEntry[];
  flush(): void;
}

// ─── Configuration ──────────────────────────────────────────────────────────

export interface TelemetryConfig {
  readonly provider?: TelemetryProvider;
  /** Maximum bytes for localStorage data. @default 1_048_576 (1MB) */
  readonly storageCap?: number;
  /** localStorage key for telemetry data. @default "lob-gps:telemetry" */
  readonly namespace?: string;
}

// ─── Internal Types ─────────────────────────────────────────────────────────

/** Internal aggregate entry stored per stateKey→selector pair. */
export interface AggregateEntry {
  /** Interaction count */
  c: number;
  /** Running average dwell time (ms) */
  d: number;
  /** Date.now() of most recent interaction */
  t: number;
}

/** Serialized JSON structure persisted in localStorage. */
export interface StorageEnvelope {
  /** Schema version (currently 1) */
  v: number;
  /** The aggregate frequency map */
  data: Record<string, Record<string, AggregateEntry>>;
}
