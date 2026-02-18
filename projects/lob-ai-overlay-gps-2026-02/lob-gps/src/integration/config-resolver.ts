import type { MapperConfig } from "../mapper/types.js";
import type { TelemetryConfig } from "../telemetry/types.js";
import type { UIConfig } from "../ui/types.js";
import type { LobGPSConfig, ResolvedConfig } from "./types.js";
import type { CuratedPath } from "../engine/types.js";

const DEFAULTS: ResolvedConfig = {
  maxSuggestions: 3,
  curatedPaths: [],
  telemetryProvider: null,
  storageCap: 1_048_576,
  namespace: "lob-gps:telemetry",
  useFingerprinting: false,
  dynamicIdDenylist: [],
  dynamicIdAllowlist: [],
  maxAncestorDepth: 5,
  miniMapAnchor: "bottom-right",
  zIndex: undefined,
  killSwitch: "Ctrl+Shift+K",
  debug: false,
  onError: undefined,
  errorThreshold: 5,
  errorWindowMs: 10_000,
};

export function resolveConfig(input: LobGPSConfig): ResolvedConfig {
  return {
    maxSuggestions: input.maxSuggestions ?? DEFAULTS.maxSuggestions,
    curatedPaths: input.curatedPaths ?? DEFAULTS.curatedPaths,
    telemetryProvider: input.telemetryProvider ?? DEFAULTS.telemetryProvider,
    storageCap: input.storageCap ?? DEFAULTS.storageCap,
    namespace: input.namespace ?? DEFAULTS.namespace,
    useFingerprinting: input.useFingerprinting ?? DEFAULTS.useFingerprinting,
    dynamicIdDenylist: input.dynamicIdDenylist ?? DEFAULTS.dynamicIdDenylist,
    dynamicIdAllowlist: input.dynamicIdAllowlist ?? DEFAULTS.dynamicIdAllowlist,
    maxAncestorDepth: input.maxAncestorDepth ?? DEFAULTS.maxAncestorDepth,
    miniMapAnchor: input.miniMapAnchor ?? DEFAULTS.miniMapAnchor,
    zIndex: input.zIndex ?? DEFAULTS.zIndex,
    killSwitch: input.killSwitch ?? DEFAULTS.killSwitch,
    debug: input.debug ?? DEFAULTS.debug,
    onError: input.onError ?? DEFAULTS.onError,
    errorThreshold: input.errorThreshold ?? DEFAULTS.errorThreshold,
    errorWindowMs: input.errorWindowMs ?? DEFAULTS.errorWindowMs,
  };
}

export function extractMapperConfig(resolved: ResolvedConfig): MapperConfig {
  return {
    useFingerprinting: resolved.useFingerprinting,
    dynamicIdDenylist: resolved.dynamicIdDenylist,
    dynamicIdAllowlist: resolved.dynamicIdAllowlist,
    maxAncestorDepth: resolved.maxAncestorDepth,
  };
}

export function extractTelemetryConfig(resolved: ResolvedConfig): TelemetryConfig {
  return {
    provider: resolved.telemetryProvider ?? undefined,
    storageCap: resolved.storageCap,
    namespace: resolved.namespace,
  };
}

export function extractEngineConfig(
  resolved: ResolvedConfig,
): { maxSuggestions: number; curatedPaths: readonly CuratedPath[] } {
  return {
    maxSuggestions: resolved.maxSuggestions,
    curatedPaths: resolved.curatedPaths,
  };
}

export function extractUIConfig(resolved: ResolvedConfig): UIConfig {
  return {
    miniMapAnchor: resolved.miniMapAnchor,
    zIndex: resolved.zIndex,
  };
}
