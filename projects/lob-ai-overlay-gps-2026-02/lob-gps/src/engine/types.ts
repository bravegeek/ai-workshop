import type { NormalizedSelector, StateKey } from "../mapper/types.js";
import type { FrequencyEntry, TelemetryProvider } from "../telemetry/types.js";

export type { NormalizedSelector, StateKey, FrequencyEntry, TelemetryProvider };

// ─── Enums ───────────────────────────────────────────────────────────────────

export const enum SuggestionSource {
  CURATED = "curated",
  PREDICTED = "predicted",
}

// ─── Data Structures ─────────────────────────────────────────────────────────

export interface Suggestion {
  readonly selector: NormalizedSelector;
  readonly label: string;
  readonly confidence: number;
  readonly source: SuggestionSource;
  readonly avgDwellTime: number;
  readonly curatedPathId?: string;
}

export interface CuratedStep {
  readonly stateKey: StateKey;
  readonly targetSelector: NormalizedSelector;
  readonly label: string;
  readonly stepNumber: number;
}

export interface CuratedPath {
  readonly id: string;
  readonly name: string;
  readonly steps: readonly CuratedStep[];
}

// ─── Configuration ──────────────────────────────────────────────────────────

export interface EngineConfig {
  readonly telemetryProvider: TelemetryProvider;
  readonly maxSuggestions?: number;
  readonly curatedPaths?: readonly CuratedPath[];
  readonly onError?: (error: Error) => void;
}
