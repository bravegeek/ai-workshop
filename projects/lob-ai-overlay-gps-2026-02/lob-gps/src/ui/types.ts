import type { NormalizedSelector } from "../mapper/types.js";
import { SuggestionSource } from "../engine/types.js";
import type { Suggestion } from "../engine/types.js";

export { SuggestionSource };
export type { NormalizedSelector, Suggestion };

// ─── Enums / Unions ─────────────────────────────────────────────────────────

export type MiniMapAnchor =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

// ─── Configuration ──────────────────────────────────────────────────────────

export interface UIConfig {
  readonly zIndex?: number;
  readonly miniMapAnchor?: MiniMapAnchor;
  readonly onError?: (error: Error) => void;
}

// ─── Internal Types ─────────────────────────────────────────────────────────

export interface PulseHandle {
  dismiss(): void;
}
