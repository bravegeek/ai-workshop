/**
 * UI Module — TypeScript Interface Contracts
 *
 * These interfaces define the public API surface of the UI module.
 * The UI consumes Suggestion[] from the Engine and renders pulse
 * highlights, auto-scroll, micro-labels, and a mini-map panel
 * inside a Shadow DOM.
 *
 * Generated from spec.md and data-model.md on 2026-02-17.
 * Branch: 004-ui
 */

// ─── Re-exported Upstream Types ─────────────────────────────────────────────

/** Stable CSS selector string (branded type from Mapper module) */
export type NormalizedSelector = string & { readonly __brand: "NormalizedSelector" };

/**
 * The Engine's output unit — a single recommended next action.
 * Re-declared here for contract clarity; canonical definition is in Engine contracts.
 */
export interface Suggestion {
  readonly selector: NormalizedSelector;
  readonly label: string;
  readonly confidence: number;
  readonly source: "curated" | "predicted";
  readonly avgDwellTime: number;
  readonly curatedPathId?: string;
}

// ─── Enums / Unions ─────────────────────────────────────────────────────────

/**
 * Viewport corner anchor for the mini-map panel.
 */
export type MiniMapAnchor =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

// ─── Configuration ──────────────────────────────────────────────────────────

/**
 * Configuration for the OverlayUI instance.
 */
export interface UIConfig {
  /**
   * Base z-index for the shadow host element.
   * Legacy apps may abuse z-index; this allows configuration to avoid conflicts.
   * @default 2147483646 (MAX_SAFE_INTEGER - 1)
   */
  readonly zIndex?: number;

  /**
   * Which viewport corner the mini-map panel anchors to.
   * @default "bottom-right"
   */
  readonly miniMapAnchor?: MiniMapAnchor;

  /**
   * Optional error callback for observability.
   * Called when the UI catches an error during rendering.
   * The callback itself is wrapped in a try-catch — a throwing
   * callback does not propagate.
   *
   * The integration layer uses this to populate window.LobGPS.errors[].
   */
  readonly onError?: (error: Error) => void;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * The UI module's public interface.
 *
 * Receives Suggestion[] from the Engine (via the Integration layer)
 * and renders pulse highlights, auto-scroll, micro-labels, and a
 * mini-map panel inside an isolated Shadow DOM.
 *
 * All rendering is inside the shadow root — the host DOM is never
 * mutated. Host elements are accessed read-only for bounding rect
 * calculations and visibility checks.
 *
 * All errors are caught and silenced (Constitution §X). Individual
 * rendering operations (pulse, scroll, label) fail independently
 * (FR-023).
 */
export interface IOverlayUI {
  /**
   * Render suggestions in the overlay.
   *
   * - Validates target elements exist and are visible (FR-022)
   * - Dismisses any active pulse/label before rendering new ones (FR-019)
   * - For the top suggestion: auto-scrolls if off-screen, then pulses + labels
   * - Updates the mini-map with all valid suggestions
   * - Empty array or all-invalid suggestions → clears overlay, hides mini-map
   *
   * Must complete within 50ms of invocation (FR-014).
   * Never throws (FR-023).
   *
   * @param suggestions - Ranked suggestions from the Engine
   */
  render(suggestions: Suggestion[]): void;

  /**
   * Tear down the overlay completely.
   *
   * - Removes the shadow host from document.body
   * - Cancels any active pulse animation and scroll
   * - Removes all event listeners (scroll, resize, click, touch, keyboard)
   * - Cleans up all internal state
   *
   * Idempotent — safe to call multiple times.
   * After teardown, render() calls are no-ops.
   * Never throws (FR-023).
   */
  teardown(): void;
}
