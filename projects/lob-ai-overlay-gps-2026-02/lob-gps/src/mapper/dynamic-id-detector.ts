import { type IsDynamicId } from "./types.js";

/**
 * Built-in patterns for dynamic/auto-generated IDs.
 * Combines framework-specific patterns and generic structural heuristics.
 */
const BUILT_IN_DYNAMIC_PATTERNS = [
  // Ember
  /^ember[\-_]?\d+/i,
  /^ember-id-/i,

  // Angular
  /^_ngcontent-/i,
  /^cdk-overlay-/i,
  /^mat-input-/i,

  // React / generic useId
  /^:r[a-z0-9]+:$/i,

  // jQuery UI, rc-component, Downshift
  /^ui-id-\d+/i,
  /^rc-select-\d+/i,
  /^downshift-\d+-/i,

  // GUID / UUID
  /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i,

  // Numeric suffix (4+ digits)
  /[\-_]\d{4,}$/,

  // Long hex suffix (6+ chars)
  /[\-_][a-f0-9]{6,}$/i,
];

/**
 * Classify an element ID as dynamic (auto-generated) or stable (human-authored).
 */
export const isDynamicId: IsDynamicId = (id, config) => {
  if (!id) return false;

  // 1. Allowlist (precedence)
  if (config?.dynamicIdAllowlist?.length) {
    for (const pattern of config.dynamicIdAllowlist) {
      try {
        if (new RegExp(pattern).test(id)) return false;
      } catch (e) {
        // skip
      }
    }
  }

  // 2. Denylist
  if (config?.dynamicIdDenylist?.length) {
    for (const pattern of config.dynamicIdDenylist) {
      try {
        if (new RegExp(pattern).test(id)) return true;
      } catch (e) {
        // skip
      }
    }
  }

  // 3. Built-in patterns
  return BUILT_IN_DYNAMIC_PATTERNS.some((pattern) => pattern.test(id));
};

/**
 * Strips GUIDs and dynamic components from a string (classes, IDs, attributes).
 * Used for selector normalization.
 *
 * @param input - The string to normalize
 * @returns The normalized string with dynamic parts removed
 */
export function normalizeString(input: string): string {
  if (!input) return "";

  let result = input;
  for (const pattern of BUILT_IN_DYNAMIC_PATTERNS) {
    // For normalization, we remove anchors so we can strip dynamic parts anywhere.
    // However, we should be careful about false positives.
    // We'll strip the pattern if it matches.
    let source = pattern.source;
    
    // Remove start/end anchors for global stripping
    source = source.replace(/^\^/, "").replace(/\$$/, "");
    
    const globalPattern = new RegExp(source, pattern.flags + (pattern.flags.includes("g") ? "" : "g"));
    
    // Special case for numeric/hex suffixes where we might want to keep the separator
    // if the test expects it. T021 says "field_8832" -> "field_".
    // So we should not include the separator in the match if we want to keep it.
    
    result = result.replace(globalPattern, (match) => {
        // If the match starts with - or _, and it's a suffix-like pattern,
        // and we want to keep the separator, we should return the separator.
        if ((match.startsWith("-") || match.startsWith("_")) && (source.includes("\\d{4,}") || source.includes("[a-f0-9]{6,}"))) {
            return match.charAt(0);
        }
        return "";
    });
  }

  return result;
}
