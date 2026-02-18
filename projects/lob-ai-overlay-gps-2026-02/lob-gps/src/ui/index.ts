import type { UIConfig, Suggestion, PulseHandle } from "./types.js";
import { OverlayHost } from "./overlay-host.js";
import { resolveElement, isElementVisible, isElementInView, findScrollableAncestor } from "./dom-utils.js";
import { pulse } from "./pulse-renderer.js";
import { scrollToElement } from "./scroll-controller.js";
import { show } from "./label-renderer.js";
import { update as updateMiniMap } from "./mini-map.js";

export class OverlayUI {
  private readonly config: UIConfig;
  private readonly host: OverlayHost;
  private moduleController: AbortController;
  private activePulse: PulseHandle | null = null;
  private pulseController: AbortController | null = null;
  private disposed = false;

  constructor(config: UIConfig = {}) {
    this.config = config;
    this.host = new OverlayHost();
    this.moduleController = new AbortController();
    this.host.create(config);
  }

  render(suggestions: Suggestion[]): void {
    if (this.disposed) return;

    const root = this.host.getRoot();
    if (!root) return;

    // Dismiss previous pulse (FR-019)
    this.dismissActive();

    // Validate targets — filter suggestions with non-existent or invisible targets (FR-022)
    interface ValidSuggestion {
      suggestion: Suggestion;
      element: Element;
    }
    const valid: ValidSuggestion[] = [];
    for (const s of suggestions) {
      const el = resolveElement(s.selector);
      if (el && isElementVisible(el)) {
        valid.push({ suggestion: s, element: el });
      }
    }

    // Update mini-map with valid suggestions
    try {
      updateMiniMap(
        valid.map((v) => v.suggestion),
        root,
        (s) => this.handleMiniMapSelect(s),
        this.moduleController.signal,
        this.config.miniMapAnchor,
      );
    } catch (err) {
      this.reportError(err);
    }

    if (valid.length === 0) return;

    // Create a new per-pulse AbortController
    this.pulseController = new AbortController();
    const signal = this.pulseController.signal;

    const top = valid[0];

    // Check if target is in view — scroll if needed
    const container = findScrollableAncestor(top.element);
    if (!isElementInView(top.element, container)) {
      // Scroll is async, but pulse + label render synchronously after initiation.
      // If scroll fails, we still proceed with pulse + label (FR-023).
      try {
        scrollToElement(top.element, signal).catch((err) => {
          this.reportError(err);
        });
      } catch (err) {
        this.reportError(err);
      }
    }

    // Pulse
    try {
      this.activePulse = pulse(top.element, root, signal);
    } catch (err) {
      this.reportError(err);
    }

    // Label
    try {
      show(top.element, top.suggestion.label, root, signal);
    } catch (err) {
      this.reportError(err);
    }
  }

  teardown(): void {
    this.dismissActive();
    this.moduleController.abort();
    this.host.teardown();
    this.disposed = true;
  }

  private dismissActive(): void {
    if (this.activePulse) {
      this.activePulse.dismiss();
      this.activePulse = null;
    }
    if (this.pulseController) {
      this.pulseController.abort();
      this.pulseController = null;
    }
  }

  private handleMiniMapSelect(suggestion: Suggestion): void {
    if (this.disposed) return;

    const root = this.host.getRoot();
    if (!root) return;

    const el = resolveElement(suggestion.selector);
    if (!el || !isElementVisible(el)) return;

    // Dismiss current and render the selected suggestion
    this.dismissActive();

    this.pulseController = new AbortController();
    const signal = this.pulseController.signal;

    const container = findScrollableAncestor(el);
    if (!isElementInView(el, container)) {
      try {
        scrollToElement(el, signal).catch((err) => {
          this.reportError(err);
        });
      } catch (err) {
        this.reportError(err);
      }
    }

    try {
      this.activePulse = pulse(el, root, signal);
    } catch (err) {
      this.reportError(err);
    }

    try {
      show(el, suggestion.label, root, signal);
    } catch (err) {
      this.reportError(err);
    }
  }

  private reportError(err: unknown): void {
    if (!this.config.onError) return;
    try {
      this.config.onError(err instanceof Error ? err : new Error(String(err)));
    } catch {
      // Double try-catch: onError failure is silenced (FR-023, R5)
    }
  }
}
