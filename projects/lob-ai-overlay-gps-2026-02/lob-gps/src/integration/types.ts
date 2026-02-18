import type { CuratedPath } from "../engine/types.js";
import type { TelemetryProvider } from "../telemetry/types.js";
import type { MiniMapAnchor } from "../ui/types.js";

// ─── Lifecycle State ───────────────────────────────────────────────────────

export const enum LobGPSState {
  ACTIVE = "active",
  DISABLED = "disabled",
  TORN_DOWN = "torn_down",
}

// ─── Configuration ─────────────────────────────────────────────────────────

export interface LobGPSConfig {
  // Engine
  readonly maxSuggestions?: number;
  readonly curatedPaths?: readonly CuratedPath[];

  // Telemetry
  readonly telemetryProvider?: TelemetryProvider;
  readonly storageCap?: number;
  readonly namespace?: string;

  // Mapper
  readonly useFingerprinting?: boolean;
  readonly dynamicIdDenylist?: readonly string[];
  readonly dynamicIdAllowlist?: readonly string[];
  readonly maxAncestorDepth?: number;

  // UI
  readonly miniMapAnchor?: MiniMapAnchor;
  readonly zIndex?: number;

  // Integration
  readonly killSwitch?: string;
  readonly debug?: boolean;
  readonly onError?: (error: Error) => void;
  readonly errorThreshold?: number;
  readonly errorWindowMs?: number;
}

// ─── Resolved Config ───────────────────────────────────────────────────────

export interface ResolvedConfig {
  readonly maxSuggestions: number;
  readonly curatedPaths: readonly CuratedPath[];

  readonly telemetryProvider: TelemetryProvider | null;
  readonly storageCap: number;
  readonly namespace: string;

  readonly useFingerprinting: boolean;
  readonly dynamicIdDenylist: readonly string[];
  readonly dynamicIdAllowlist: readonly string[];
  readonly maxAncestorDepth: number;

  readonly miniMapAnchor: MiniMapAnchor;
  readonly zIndex: number | undefined;

  readonly killSwitch: string;
  readonly debug: boolean;
  readonly onError: ((error: Error) => void) | undefined;
  readonly errorThreshold: number;
  readonly errorWindowMs: number;
}

// ─── Kill Switch ───────────────────────────────────────────────────────────

export interface KillSwitchDescriptor {
  readonly ctrl: boolean;
  readonly shift: boolean;
  readonly alt: boolean;
  readonly meta: boolean;
  readonly key: string;
}

// ─── Error Buffer ──────────────────────────────────────────────────────────

export interface IErrorBuffer {
  push(error: Error): void;
  toArray(): Error[];
  clear(): void;
  readonly size: number;
}
