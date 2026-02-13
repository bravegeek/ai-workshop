/**
 * Engine Module — TypeScript Interface Contracts
 *
 * These interfaces define the public API surface of the Engine module.
 * The Engine consumes FrequencyEntry[] from Telemetry and produces
 * ranked Suggestion[] for the UI/Integration layers.
 *
 * Generated from spec.md and data-model.md on 2026-02-13.
 * Branch: 003-engine
 */

// ─── Re-exported Upstream Types ─────────────────────────────────────────────

/** Stable CSS selector string (branded type from Mapper module) */
export type NormalizedSelector = string & { readonly __brand: "NormalizedSelector" };

/** User's workflow position (branded type from Mapper module) */
export type StateKey = string & { readonly __brand: "StateKey" };

/** Aggregated frequency data (from Telemetry module) */
export interface FrequencyEntry {
  readonly selector: NormalizedSelector;
  readonly count: number;
  readonly avgDwellTime: number;
  readonly lastSeenTimestamp: number;
}

/** Telemetry read interface (from Telemetry module) */
export interface TelemetryProvider {
  query(stateKey: StateKey): FrequencyEntry[];
}

// ─── Enums ───────────────────────────────────────────────────────────────────

/**
 * Origin of a suggestion.
 */
export const enum SuggestionSource {
  CURATED = "curated",
  PREDICTED = "predicted",
}

// ─── Data Structures ─────────────────────────────────────────────────────────

/**
 * The engine's output unit — a single recommended next action.
 *
 * Every suggestion includes a human-readable `label` explaining
 * the "Why" (Constitution §III). Curated suggestions use the label
 * from the path definition; predicted suggestions use a tiered
 * template with the confidence percentage.
 */
export interface Suggestion {
  /** Stable CSS selector for the suggested target element */
  readonly selector: NormalizedSelector;

  /**
   * Human-readable "Why" explanation.
   * - Curated: verbatim from CuratedStep.label
   * - Predicted: tiered template — "Most common next action (N%)",
   *   "Frequently used (N%)", or "Sometimes used (N%)"
   */
  readonly label: string;

  /**
   * Confidence score (0–1).
   * - Predicted: count / totalTransitionsFromState
   * - Curated: always 1.0
   */
  readonly confidence: number;

  /** Origin of this suggestion */
  readonly source: SuggestionSource;

  /**
   * Average milliseconds users spent before taking this action.
   * - Predicted: from FrequencyEntry.avgDwellTime
   * - Curated: always 0
   */
  readonly avgDwellTime: number;

  /**
   * Present only when source is CURATED.
   * The id of the parent CuratedPath.
   */
  readonly curatedPathId?: string;
}

/**
 * A single step in a curated Golden Path.
 *
 * When the current StateKey matches this step's stateKey (exact ===),
 * the engine suggests the NEXT step's targetSelector.
 */
export interface CuratedStep {
  /** Workflow position where this step is relevant */
  readonly stateKey: StateKey;
  /** Element the user should interact with next */
  readonly targetSelector: NormalizedSelector;
  /** Human-readable label (e.g. "Step 3: Review billing details") */
  readonly label: string;
  /** Position in the path sequence (1-based) */
  readonly stepNumber: number;
}

/**
 * An expert-defined workflow sequence.
 *
 * Steps must be ordered by stepNumber ascending.
 * Paths are immutable for the engine's lifetime.
 */
export interface CuratedPath {
  /** Unique identifier for this path */
  readonly id: string;
  /** Human-readable name for this workflow */
  readonly name: string;
  /** Ordered sequence of steps */
  readonly steps: readonly CuratedStep[];
}

// ─── Configuration ──────────────────────────────────────────────────────────

/**
 * Configuration for the Engine instance.
 */
export interface EngineConfig {
  /**
   * The read interface for historical transition data.
   * Required — the engine cannot function without a data source.
   */
  readonly telemetryProvider: TelemetryProvider;

  /**
   * Maximum suggestions returned per query.
   * @default 3
   */
  readonly maxSuggestions?: number;

  /**
   * Expert-defined workflow paths.
   * Order matters: lower index = higher priority for dedup tie-breaking.
   * @default []
   */
  readonly curatedPaths?: readonly CuratedPath[];

  /**
   * Optional error callback for observability.
   * Called when the engine catches an error during query().
   * The callback itself is wrapped in a try-catch — a throwing
   * callback does not propagate.
   *
   * The integration layer uses this to populate window.LobGPS.errors[].
   */
  readonly onError?: (error: Error) => void;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * The Engine's public interface.
 *
 * Pure computation: accepts a StateKey, reads from TelemetryProvider,
 * matches curated paths, ranks suggestions, generates labels, and
 * returns a merged Suggestion[]. Zero DOM access, zero side effects,
 * stateless per call.
 */
export interface IEngine {
  /**
   * Query for ranked suggestions at the given workflow position.
   *
   * Returns suggestions ranked by: Curated > Highest Frequency >
   * Most Recent (lastSeenTimestamp). Each suggestion includes a
   * human-readable label.
   *
   * On any error, returns [] and invokes onError callback if configured.
   * Never throws (Constitution §X, FR-015).
   *
   * @param stateKey - The user's current workflow position
   * @returns Ranked suggestions, max length = EngineConfig.maxSuggestions
   */
  query(stateKey: StateKey): Suggestion[];
}
