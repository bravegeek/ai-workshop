/**
 * Telemetry Module — TypeScript Interface Contracts
 *
 * These interfaces define the public API surface of the Telemetry module.
 * The Engine module consumes FrequencyEntry[] via the query() interface.
 * The Mapper module feeds TransitionPackets via enriched interaction events.
 *
 * Generated from spec.md and data-model.md on 2026-02-12.
 * Branch: 002-telemetry
 */

// ─── Re-exported Mapper Types (defined in src/mapper/types.ts) ──────────────

/** Stable CSS selector string (branded type from Mapper module) */
export type NormalizedSelector = string & { readonly __brand: "NormalizedSelector" };

/** User's workflow position (branded type from Mapper module) */
export type StateKey = string & { readonly __brand: "StateKey" };

// ─── Enums ───────────────────────────────────────────────────────────────────

/**
 * Type of user interaction detected by the Mapper.
 */
export const enum ActionType {
  CLICK = "click",
  FOCUS = "focus",
  INPUT = "input",
  NAVIGATION = "navigation",
}

// ─── Data Structures ─────────────────────────────────────────────────────────

/**
 * The atomic unit of telemetry — a single interaction event.
 *
 * Created by the Telemetry module from enriched Mapper events.
 * Passed to the active TelemetryProvider via record().
 *
 * MUST NOT contain input field values, clipboard data, or innerText
 * of non-interactive elements (Constitution §XIII.2).
 */
export interface TransitionPacket {
  /** User's workflow position when the interaction occurred */
  readonly stateKey: StateKey;
  /** Stable CSS selector for the acted-upon element */
  readonly normalizedSelector: NormalizedSelector;
  /** Type of interaction */
  readonly actionType: ActionType;
  /** Milliseconds since last action (performance.now() delta) */
  readonly dwellTime: number;
  /** Monotonic timestamp at packet creation (performance.now()) */
  readonly timestamp: number;
  /** Random per-page-load identifier, not tied to user identity */
  readonly sessionId: string;
}

/**
 * A query result entry — aggregated interaction data for a single
 * selector from a given StateKey.
 *
 * Returned by TelemetryProvider.query(), consumed by the Engine
 * for suggestion ranking and tie-breaking.
 */
export interface FrequencyEntry {
  /** The element selector */
  readonly selector: NormalizedSelector;
  /** Number of times this selector was acted upon from the queried StateKey */
  readonly count: number;
  /** Average dwell time (ms) before this action */
  readonly avgDwellTime: number;
  /** Date.now() of most recent interaction (cross-session comparable) */
  readonly lastSeenTimestamp: number;
}

// ─── Provider Interface ─────────────────────────────────────────────────────

/**
 * Abstract interface for telemetry storage providers.
 *
 * All methods are synchronous and MUST NOT throw — errors are caught
 * and silenced internally (Constitution §X, FR-009).
 *
 * Implementations: LocalStorageProvider (default), future Beacon/Proxy providers.
 */
export interface TelemetryProvider {
  /**
   * Store/aggregate a transition. For aggregate-on-write providers,
   * this updates frequency counters rather than appending raw packets.
   *
   * @param packet - The transition to record
   */
  record(packet: TransitionPacket): void;

  /**
   * Retrieve frequency data for a StateKey.
   *
   * @param stateKey - The workflow position to query
   * @returns FrequencyEntry[] sorted by count descending, or [] if no data
   */
  query(stateKey: StateKey): FrequencyEntry[];

  /**
   * Remove all telemetry data from the provider.
   */
  flush(): void;
}

// ─── Configuration ──────────────────────────────────────────────────────────

/**
 * Configuration for the Telemetry module.
 */
export interface TelemetryConfig {
  /**
   * The active storage provider.
   * @default LocalStorageProvider instance
   */
  readonly provider?: TelemetryProvider;

  /**
   * Maximum bytes for localStorage data.
   * @default 1_048_576 (1MB)
   */
  readonly storageCap?: number;

  /**
   * localStorage key for telemetry data.
   * @default "lob-gps:telemetry"
   */
  readonly namespace?: string;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * The Telemetry module's public interface.
 *
 * Pure data pipeline: receives enriched interaction events from the Mapper,
 * computes dwellTime, creates TransitionPackets, and delegates to the
 * active provider. No DOM coupling.
 */
export interface ITelemetry {
  /**
   * Record a user interaction as a TransitionPacket.
   * Computes dwellTime from the time elapsed since the last record() call.
   *
   * @param stateKey - Current workflow position
   * @param normalizedSelector - Stable selector for the acted-upon element
   * @param actionType - Type of interaction
   */
  record(
    stateKey: StateKey,
    normalizedSelector: NormalizedSelector,
    actionType: ActionType,
  ): void;

  /**
   * Query frequency data for a StateKey.
   *
   * @param stateKey - The workflow position to query
   * @returns FrequencyEntry[] sorted by count descending
   */
  query(stateKey: StateKey): FrequencyEntry[];

  /**
   * Remove all telemetry data from the active provider.
   */
  flush(): void;

  /**
   * Replace the active provider. Flushes data to the old provider
   * before activating the new one.
   *
   * @param provider - The new provider to activate
   */
  swapProvider(provider: TelemetryProvider): void;

  /**
   * Tear down the telemetry module. After this call, all methods no-op.
   */
  teardown(): void;
}
