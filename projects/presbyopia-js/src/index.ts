/**
 * presbyopia.js
 *
 * Accessibility-first mobile web library for presbyopic users.
 * Drop-in <script> tag or ES module import.
 *
 * Usage (script tag, auto-init):
 *   <script src="presbyopia.iife.js" data-auto></script>
 *
 * Usage (script tag, manual):
 *   <script src="presbyopia.iife.js"></script>
 *   <script>presbyopia.init()</script>
 *
 * Usage (ES module):
 *   import { Presbyopia } from 'presbyopia-js';
 *   new Presbyopia({ fontFloor: 16, tapTargets: 44 }).init();
 *
 * Standards:
 *   - WCAG 1.4.4 Resize Text (font floor)
 *   - WCAG 2.5.5 Target Size (tap target expansion)
 */

export { FontFloor } from "./font-floor";
export type { FontFloorOptions } from "./font-floor";
export { TapTargets } from "./tap-targets";
export type { TapTargetOptions } from "./tap-targets";

import { FontFloor } from "./font-floor";
import { TapTargets } from "./tap-targets";

export interface PresbyopiaOptions {
  /**
   * Minimum font size in px. Set to false to disable.
   * Default: 16
   */
  fontFloor?: number | false;
  /**
   * Minimum tap target size in px. Set to false to disable.
   * Default: 44 (WCAG 2.5.5)
   */
  tapTargets?: number | false;
}

export class Presbyopia {
  private fontFloor: FontFloor | null;
  private tapTargets: TapTargets | null;

  constructor(options: PresbyopiaOptions = {}) {
    this.fontFloor =
      options.fontFloor !== false
        ? new FontFloor({ floorPx: options.fontFloor || undefined })
        : null;

    this.tapTargets =
      options.tapTargets !== false
        ? new TapTargets({ minPx: options.tapTargets || undefined })
        : null;
  }

  init(root: Document | Element = document): this {
    this.fontFloor?.init(root);
    this.tapTargets?.init(root);
    return this;
  }

  destroy(): void {
    this.fontFloor?.destroy();
    this.tapTargets?.destroy();
  }
}

// Auto-init when <script data-auto> is used.
if (typeof document !== "undefined") {
  const script = document.currentScript as HTMLScriptElement | null;
  if (script?.hasAttribute("data-auto")) {
    const run = () => new Presbyopia().init();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run, { once: true });
    } else {
      run();
    }
  }
}
