export * from "./mapper/types.js";
export { Mapper } from "./mapper/index.js";
export { isDynamicId, normalizeString } from "./mapper/dynamic-id-detector.js";
export { resolveSelector } from "./mapper/selector-generator.js";

export { Telemetry } from "./telemetry/index.js";
export { LocalStorageProvider } from "./telemetry/local-storage-provider.js";
export {
  ActionType,
  type TransitionPacket,
  type FrequencyEntry,
  type TelemetryProvider,
  type TelemetryConfig,
} from "./telemetry/types.js";

export { Engine } from "./engine/index.js";
export {
  SuggestionSource,
  type Suggestion,
  type CuratedPath,
  type CuratedStep,
  type EngineConfig,
} from "./engine/types.js";

export { OverlayUI } from "./ui/index.js";
export { type UIConfig, type MiniMapAnchor } from "./ui/types.js";
