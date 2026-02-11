import { type StateKey, type NormalizedSelector, type MapperConfig, type StateKeyOptions } from "./types.js";
import { generatePageFingerprint } from "./page-fingerprint.js";

/**
 * Generate a StateKey representing the user's current workflow position.
 * Format: {locationComponent}::{actionComponent}
 */
export function generateStateKey(
  selector: NormalizedSelector | "",
  config?: Pick<MapperConfig, "useFingerprinting">,
  _options?: StateKeyOptions, // Reserved for future use
): StateKey {
  let locationComponent: string;

  if (config?.useFingerprinting) {
    locationComponent = generatePageFingerprint();
  } else {
    // Default to URL mode
    try {
      locationComponent = window.location.origin + window.location.pathname;
    } catch (e) {
      // Fallback if window.location is not available (e.g. some node environments)
      locationComponent = "unknown-origin/unknown-path";
    }
  }

  return `${locationComponent}::${selector}` as StateKey;
}
