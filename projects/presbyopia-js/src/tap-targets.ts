/**
 * TapTargets — expands the effective hit area of interactive elements
 * that are too small to reliably tap on mobile.
 *
 * Anchored to WCAG 2.5.5 (Target Size): interactive targets should be
 * at least 44×44 CSS pixels. Many sites use icon buttons, small links,
 * and compact controls that fall well short of this.
 *
 * Strategy: inject a ::after pseudo-element that expands the tap area
 * without altering visual layout. The pseudo-element is transparent and
 * positioned to be centered on the element, meeting the minimum size.
 */

const CLASS = "pres-tt";
const STYLE_ID = "pres-tt-styles";

const INTERACTIVE_SELECTORS = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  '[role="button"]',
  '[role="link"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="menuitem"]',
  '[role="tab"]',
  "[tabindex]",
].join(", ");

function buildCSS(minPx: number): string {
  return `
.${CLASS} {
  position: relative !important;
  overflow: visible !important;
}
.${CLASS}::after {
  content: "";
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: ${minPx}px;
  min-height: ${minPx}px;
  width: 100%;
  height: 100%;
  cursor: inherit;
  pointer-events: auto;
}
`.trim();
}

export interface TapTargetOptions {
  /** Minimum touch target size in px. Default: 44 (WCAG 2.5.5) */
  minPx?: number;
}

export class TapTargets {
  private readonly minPx: number;
  private observer: MutationObserver | null = null;

  constructor(options: TapTargetOptions = {}) {
    this.minPx = options.minPx ?? 44;
  }

  init(root: Document | Element = document): void {
    const body = root instanceof Document ? root.body : root;
    if (!body) return;
    this.injectStyles();
    this.scan(body);
    this.observe(body);
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = null;
    document.getElementById(STYLE_ID)?.remove();
    for (const el of document.querySelectorAll(`.${CLASS}`)) {
      el.classList.remove(CLASS);
    }
  }

  private injectStyles(): void {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = buildCSS(this.minPx);
    document.head.appendChild(style);
  }

  private scan(root: Element): void {
    for (const el of root.querySelectorAll<HTMLElement>(INTERACTIVE_SELECTORS)) {
      this.check(el);
    }
  }

  private check(el: HTMLElement): void {
    const rect = el.getBoundingClientRect();
    if (rect.width < this.minPx || rect.height < this.minPx) {
      el.classList.add(CLASS);
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
