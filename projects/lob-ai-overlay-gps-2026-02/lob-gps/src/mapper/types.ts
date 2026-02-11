/**
 * Mapper Module — TypeScript Interface Contracts
 *
 * These interfaces define the public API surface of the Mapper module.
 * They are consumed by downstream modules: Telemetry, Engine, and UI.
 *
 * Generated from spec.md and data-model.md on 2026-02-10.
 * Branch: 001-mapper
 */

// ─── Enums ───────────────────────────────────────────────────────────────────

/**
 * Hierarchy level that produced a selector.
 * Ordered by stability (ID is most stable, DOM_PATH is least).
 */
export const enum SelectorTier {
  ID = "ID",
  DATA_TESTID = "DATA_TESTID",
  ARIA_LABEL = "ARIA_LABEL",
  TEXT_CONTENT = "TEXT_CONTENT",
  DOM_PATH = "DOM_PATH",
}

/**
 * What type of DOM mutation triggered a state change.
 */
export const enum StateChangeTrigger {
  /** Elements were added or removed from the DOM */
  CHILD_LIST = "CHILD_LIST",
  /** A container's visibility changed (display/visibility/hidden toggle) */
  VISIBILITY = "VISIBILITY",
}

// ─── Type Aliases ────────────────────────────────────────────────────────────

/**
 * A stable, native querySelector-compatible CSS selector string.
 * Never contains dynamic IDs or GUIDs.
 */
export type NormalizedSelector = string & { readonly __brand: "NormalizedSelector" };

/**
 * User's current position in the application workflow.
 * Format: `{locationComponent}::{actionComponent}`
 */
export type StateKey = string & { readonly __brand: "StateKey" };

// ─── Data Structures ─────────────────────────────────────────────────────────

/**
 * Return type of selector generation.
 */
export interface SelectorResult {
  /** The generated CSS selector string */
  readonly selector: NormalizedSelector;
  /** Which hierarchy level produced this selector */
  readonly tier: SelectorTier;
  /** True if the selector matches more than one element after all refinement */
  readonly ambiguous: boolean;
  /**
   * Visible text of the target element (TEXT_CONTENT tier only).
   * Used as a secondary disambiguation filter when the CSS selector
   * alone may match multiple elements.
   */
  readonly textHint?: string;
}

/**
 * Emitted when the mapper detects a meaningful DOM transition.
 */
export interface StateChangeEvent {
  /** StateKey before the transition */
  readonly previousStateKey: StateKey;
  /** StateKey after the transition */
  readonly newStateKey: StateKey;
  /** What caused the state change */
  readonly trigger: StateChangeTrigger;
  /** performance.now() value at detection time */
  readonly timestamp: number;
}

/**
 * Configuration for the Mapper instance.
 */
export interface MapperConfig {
  /**
   * When true, StateKeys use a semantic fingerprint (FNV-1a hash of
   * headings/nav) instead of the URL.
   * @default false
   */
  readonly useFingerprinting?: boolean;

  /**
   * Additional RegExp pattern strings (ECMAScript dialect) for IDs
   * to classify as dynamic. Compiled via `new RegExp(pattern)`.
   * @default []
   */
  readonly dynamicIdDenylist?: readonly string[];

  /**
   * RegExp pattern strings for IDs to force-classify as stable.
   * Takes precedence over denylist and built-in patterns.
   * Compiled via `new RegExp(pattern)`.
   * @default []
   */
  readonly dynamicIdAllowlist?: readonly string[];

  /**
   * Maximum DOM levels to walk when building path selectors.
   * @default 5
   */
  readonly maxAncestorDepth?: number;
}

// ─── Options ─────────────────────────────────────────────────────────────────

/**
 * Options for StateKey generation. Currently empty but designed to
 * accept future per-call overrides (e.g., fingerprinting toggle)
 * without breaking changes.
 */
export interface StateKeyOptions {
  // Reserved for future per-call overrides (v2+)
}

// ─── Event Types ─────────────────────────────────────────────────────────────

/** Supported event names on the Mapper */
export type MapperEventName = "state-change";

/** Callback type for state-change events */
export type StateChangeCallback = (event: StateChangeEvent) => void;

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * The Mapper's public interface. Consumed by Telemetry, Engine, and UI modules.
 */
export interface IMapper {
  /**
   * Generate a stable, normalized selector for a host DOM element.
   * Must complete within 5ms (FR-013).
   *
   * @param element - The target host DOM element
   * @returns A SelectorResult with the best selector found
   */
  generateSelector(element: Element): SelectorResult;

  /**
   * Generate a StateKey representing the user's current workflow position.
   *
   * @param selector - The NormalizedSelector of the last user action (or empty for initial load)
   * @param options - Reserved for future per-call overrides
   * @returns A deterministic StateKey string
   */
  generateStateKey(
    selector: NormalizedSelector | "",
    options?: StateKeyOptions,
  ): StateKey;

  /**
   * Begin observing the host DOM for meaningful state changes.
   * Emits 'state-change' events when structural or visibility
   * mutations are detected on containers with interactive children.
   *
   * Must be called after construction. Calling observe() while
   * already observing is a no-op.
   */
  observe(): void;

  /**
   * Register a callback for mapper events.
   *
   * @param event - The event name
   * @param callback - The callback function
   */
  on(event: "state-change", callback: StateChangeCallback): void;

  /**
   * Unregister a previously registered callback.
   *
   * @param event - The event name
   * @param callback - The callback to remove
   */
  off(event: "state-change", callback: StateChangeCallback): void;

  /**
   * Disconnect all observers, cancel pending callbacks, and remove
   * all event listeners. Idempotent — safe to call multiple times.
   * After teardown, the Mapper instance should not be reused.
   */
  teardown(): void;
}

// ─── Utility Function Contracts ──────────────────────────────────────────────

/**
 * Classify an element ID as dynamic (auto-generated) or stable (human-authored).
 * Pure function with no side effects.
 *
 * @param id - The element's id attribute value
 * @param config - Allowlist/denylist configuration
 * @returns true if the ID is classified as dynamic
 */
export type IsDynamicId = (
  id: string,
  config?: Pick<MapperConfig, "dynamicIdAllowlist" | "dynamicIdDenylist">,
) => boolean;

/**
 * Resolve a SelectorResult to an Element, using textHint as a
 * secondary filter for TEXT_CONTENT tier selectors.
 *
 * @param result - The SelectorResult to resolve
 * @param root - The root to query from (defaults to document)
 * @returns The matched Element, or null if not found
 */
export type ResolveSelector = (
  result: SelectorResult,
  root?: ParentNode,
) => Element | null;
