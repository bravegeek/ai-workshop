/**
 * FontFloor — enforces a minimum rendered font size across the DOM.
 *
 * Anchored to WCAG 1.4.4 (Resize Text): text must be resizable without
 * loss of content. Sites that hardcode small px sizes in CSS break this
 * for users who cannot increase zoom without breaking layout.
 *
 * Strategy: scan all elements, check computed font-size, override inline
 * where below the floor. MutationObserver catches dynamically added content.
 */

const ATTR = "data-pres-ff";

// Elements that render no visible text — skip to avoid noise.
const SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "SVG", "CANVAS", "VIDEO", "AUDIO",
  "IMG", "INPUT", "SELECT", "TEXTAREA", "HEAD", "META", "LINK",
]);

export interface FontFloorOptions {
  /** Minimum font size in px. Default: 16 */
  floorPx?: number;
}

export class FontFloor {
  private readonly floorPx: number;
  private observer: MutationObserver | null = null;

  constructor(options: FontFloorOptions = {}) {
    this.floorPx = options.floorPx ?? 16;
  }

  init(root: Document | Element = document): void {
    const body = root instanceof Document ? root.body : root;
    if (!body) return;
    this.scan(body);
    this.observe(body);
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = null;

    for (const el of document.querySelectorAll<HTMLElement>(`[${ATTR}]`)) {
      el.style.removeProperty("font-size");
      el.removeAttribute(ATTR);
    }
  }

  private scan(root: Element): void {
    this.check(root as HTMLElement);
    for (const el of root.querySelectorAll<HTMLElement>("*")) {
      this.check(el);
    }
  }

  private check(el: HTMLElement): void {
    if (SKIP_TAGS.has(el.tagName)) return;
    if (!el.isConnected) return;

    let size = 0;

    // Inline style is the fastest and most reliable path; also works in
    // environments where getComputedStyle has limited CSS cascade support.
    const inline = el.style.fontSize;
    if (inline) {
      size = parseFloat(inline);
    } else {
      // Fall back to computed style to catch sizes applied via stylesheets.
      try {
        size = parseFloat(getComputedStyle(el).fontSize);
      } catch {
        return;
      }
    }

    if (size > 0 && size < this.floorPx) {
      // important priority overrides !important rules in author CSS.
      el.style.setProperty("font-size", `${this.floorPx}px`, "important");
      el.setAttribute(ATTR, "1");
    }
  }

  private observe(root: Element): void {
    this.observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.scan(node as Element);
          }
        }
      }
    });
    this.observer.observe(root, { childList: true, subtree: true });
  }
}
