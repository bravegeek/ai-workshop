/**
 * Integration Layer — TypeScript Interface Contracts
 *
 * These interfaces define the public and internal API surface of the
 * integration module. The public API (ILobGPS, LobGPSConfig) is exposed
 * to host applications via `window.LobGPS`. Internal types (Pipeline,
 * ErrorBuffer, KillSwitchDescriptor) are implementation contracts.
 *
 * Generated from spec.md, data-model.md, and clarifications on 2026-02-17.
 * Branch: 005-integration
 */

import type { MapperConfig } from "../../src/mapper/types.js";
import type {
  TelemetryProvider,
  TelemetryConfig,
} from "../../src/telemetry/types.js";
import type {
  CuratedPath,
  EngineConfig,
  Suggestion,
} from "../../src/engine/types.js";
import type { UIConfig, MiniMapAnchor } from "../../src/ui/types.js";

// ─── Lifecycle State ───────────────────────────────────────────────────────

/**
 * LobGPS lifecycle states.
 *
 * ACTIVE → disable() → DISABLED → enable() → ACTIVE
 * ACTIVE or DISABLED → teardown() → TORN_DOWN (terminal)
 * Auto-disable (FR-022) transitions ACTIVE → DISABLED.
 */
export const enum LobGPSState {
  ACTIVE = "active",
  DISABLED = "disabled",
  TORN_DOWN = "torn_down",
}

// ─── Configuration ─────────────────────────────────────────────────────────

/**
 * Unified configuration for the LobGPS library.
 * All fields are optional — sensible defaults are applied by config-resolver.
 * Provided at init time via `window.LobGPS = { ... }` before the script loads.
 * Subset of fields can be updated at runtime via `window.LobGPS.configure()`.
 *
 * FR-012: Providable at init, modifiable at runtime.
 * FR-016: Read from pre-existing window.LobGPS, then replaced with API.
 */
export interface LobGPSConfig {
  // ── Engine ──────────────────────────────────────────────────────────────
  /** Maximum suggestions returned per cycle. @default 3 */
  readonly maxSuggestions?: number;
  /** Curated golden paths. @default [] */
  readonly curatedPaths?: readonly CuratedPath[];

  // ── Telemetry ───────────────────────────────────────────────────────────
  /** Custom telemetry storage backend. @default LocalStorageProvider */
  readonly telemetryProvider?: TelemetryProvider;
  /** Max bytes for localStorage. @default 1_048_576 (1MB) */
  readonly storageCap?: number;
  /** localStorage key namespace. @default "lob-gps:telemetry" */
  readonly namespace?: string;

  // ── Mapper ──────────────────────────────────────────────────────────────
  /** Use semantic fingerprinting for StateKey. @default false */
  readonly useFingerprinting?: boolean;
  /** Additional regex patterns for dynamic ID detection. @default [] */
  readonly dynamicIdDenylist?: readonly string[];
  /** Regex patterns for IDs to force-classify as stable. @default [] */
  readonly dynamicIdAllowlist?: readonly string[];
  /** Max DOM ancestor levels for path selectors. @default 5 */
  readonly maxAncestorDepth?: number;

  // ── UI ──────────────────────────────────────────────────────────────────
  /** Mini-map panel position. @default "bottom-right" */
  readonly miniMapAnchor?: MiniMapAnchor;
  /** CSS z-index for overlay host element. @default auto */
  readonly zIndex?: number;

  // ── Integration ─────────────────────────────────────────────────────────
  /** Kill switch key combo. @default "Ctrl+Shift+K" */
  readonly killSwitch?: string;
  /** Enable console.warn for caught errors. @default false */
  readonly debug?: boolean;
  /** External error callback. Additive with error buffer (FR-009). */
  readonly onError?: (error: Error) => void;
  /** Consecutive errors before auto-disable. @default 5 */
  readonly errorThreshold?: number;
  /** Time window (ms) for error threshold. @default 10_000 */
  readonly errorWindowMs?: number;
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * The public LobGPS API, exposed as `window.LobGPS` after initialization.
 *
 * FR-003: Single global entry point.
 * FR-023: All calls in invalid states are silent no-ops.
 */
export interface ILobGPS {
  /** Library semantic version (read-only). FR-017. */
  readonly version: string;

  /** Whether the overlay is currently running (read-only). FR-018. */
  readonly isActive: boolean;

  /**
   * Copy of the error ring buffer, oldest first (read-only).
   * Capped at 100 entries. FR-009.
   */
  readonly errors: readonly Error[];

  /**
   * Reinitialize the overlay after disable().
   * Preserves existing telemetry data. FR-007.
   * No-op if already active or torn down. FR-023.
   */
  enable(): void;

  /**
   * Tear down all overlay components without page refresh.
   * Telemetry data is preserved. FR-005, FR-014.
   * No-op if already disabled or torn down. FR-023.
   */
  disable(): void;

  /**
   * Merge options into active config. Takes effect on next pipeline cycle.
   * Does not trigger immediate re-render. FR-021.
   * No-op if disabled or torn down. FR-023.
   */
  configure(options: Partial<LobGPSConfig>): void;

  /**
   * Permanently destroy the instance. enable() becomes a no-op. FR-019.
   * No-op if already torn down. FR-023.
   */
  teardown(): void;
}

// ─── Config Resolution ─────────────────────────────────────────────────────

/**
 * Resolved (non-optional) configuration after merging with defaults.
 * Internal use only — not exposed to consumers.
 */
export interface ResolvedConfig {
  // Engine
  readonly maxSuggestions: number;
  readonly curatedPaths: readonly CuratedPath[];

  // Telemetry
  readonly telemetryProvider: TelemetryProvider | null; // null = use default
  readonly storageCap: number;
  readonly namespace: string;

  // Mapper
  readonly useFingerprinting: boolean;
  readonly dynamicIdDenylist: readonly string[];
  readonly dynamicIdAllowlist: readonly string[];
  readonly maxAncestorDepth: number;

  // UI
  readonly miniMapAnchor: MiniMapAnchor;
  readonly zIndex: number | undefined;

  // Integration
  readonly killSwitch: string;
  readonly debug: boolean;
  readonly onError: ((error: Error) => void) | undefined;
  readonly errorThreshold: number;
  readonly errorWindowMs: number;
}

/**
 * Extract module-specific configs from the resolved config.
 */
export type MapperConfigFromResolved = Pick<
  ResolvedConfig,
  "useFingerprinting" | "dynamicIdDenylist" | "dynamicIdAllowlist" | "maxAncestorDepth"
>;

export type TelemetryConfigFromResolved = Pick<
  ResolvedConfig,
  "telemetryProvider" | "storageCap" | "namespace"
>;

export type EngineConfigFromResolved = Pick<
  ResolvedConfig,
  "maxSuggestions" | "curatedPaths"
>;

export type UIConfigFromResolved = Pick<
  ResolvedConfig,
  "miniMapAnchor" | "zIndex"
>;

// ─── Internal: Error Buffer ────────────────────────────────────────────────

/**
 * Capped ring buffer for caught errors.
 * Max 100 entries, oldest dropped first (FIFO eviction).
 * FR-009.
 */
export interface IErrorBuffer {
  /** Add an error to the buffer. Overwrites oldest if full. */
  push(error: Error): void;

  /** Return chronologically ordered copy (oldest first). */
  toArray(): Error[];

  /** Reset buffer contents. */
  clear(): void;

  /** Current number of errors stored (max 100). */
  readonly size: number;
}

// ─── Internal: Kill Switch ─────────────────────────────────────────────────

/**
 * Parsed key combo descriptor.
 * Generated by parsing a string like "Ctrl+Shift+K".
 */
export interface KillSwitchDescriptor {
  readonly ctrl: boolean;
  readonly shift: boolean;
  readonly alt: boolean;
  readonly meta: boolean;
  /** The key character, uppercased (e.g., "K"). */
  readonly key: string;
}

// ─── Internal: Pipeline ────────────────────────────────────────────────────

/**
 * Pipeline cycle result (for testing/debugging).
 */
export interface PipelineCycleResult {
  /** Whether the cycle executed (false if debounced). */
  readonly executed: boolean;
  /** Suggestions returned by the engine (empty array if skipped or error). */
  readonly suggestions: readonly Suggestion[];
  /** Error caught during the cycle, if any. */
  readonly error?: Error;
}
