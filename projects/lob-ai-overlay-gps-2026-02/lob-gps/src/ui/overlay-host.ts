import type { UIConfig } from "./types.js";
import { createStylesheet } from "./styles.js";

const DEFAULT_Z_INDEX = 2147483646;

export class OverlayHost {
  private hostElement: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private disposed = false;

  create(config: UIConfig): void {
    if (this.disposed || this.shadowRoot) return;
    try {
      const el = document.createElement("div");
      el.style.position = "fixed";
      el.style.top = "0";
      el.style.left = "0";
      el.style.width = "0";
      el.style.height = "0";
      el.style.pointerEvents = "none";
      el.style.zIndex = String(config.zIndex ?? DEFAULT_Z_INDEX);
      el.setAttribute("data-lob-gps", "");

      if (typeof el.attachShadow !== "function") {
        return;
      }

      const root = el.attachShadow({ mode: "open" });
      root.adoptedStyleSheets = [createStylesheet()];

      document.body.appendChild(el);
      this.hostElement = el;
      this.shadowRoot = root;
    } catch {
      // Graceful degradation — no overlay, no errors
    }
  }

  getRoot(): ShadowRoot | null {
    return this.shadowRoot;
  }

  teardown(): void {
    if (this.hostElement) {
      this.hostElement.remove();
      this.hostElement = null;
    }
    this.shadowRoot = null;
    this.disposed = true;
  }
}
