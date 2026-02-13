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
