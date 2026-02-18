import type { PulseHandle } from "./types.js";

/**
 * Creates a pulsing overlay element that tracks a target element's position.
 * Returns null if the target is invisible (zero-size rect) or on any error.
 */
export function pulse(
  target: Element,
  shadowRoot: ShadowRoot,
  abortSignal: AbortSignal,
): PulseHandle | null {
  try {
    // 1. Check target visibility — return null for zero-size (FR-022)
    const initialRect = target.getBoundingClientRect();
    if (initialRect.width === 0 && initialRect.height === 0) {
      return null;
    }

    // 2. Create pulse element inside shadow root
    const el = document.createElement("div");
    el.className = "lob-pulse";

    // 3. Set positioning styles from target rect
    el.style.position = "fixed";
    applyRect(el, initialRect);

    // 4. Ensure pulse doesn't intercept interactions
    el.style.pointerEvents = "none";

    shadowRoot.appendChild(el);

    // State
    let rafId = 0;
    let dismissed = false;

    // 5–6. rAF loop: reposition each frame, auto-dismiss on zero-size or disconnect
    function tick() {
      if (dismissed) return;

      const rect = target.getBoundingClientRect();
      if ((rect.width === 0 && rect.height === 0) || !target.isConnected) {
        dismiss();
        return;
      }

      applyRect(el, rect);
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    // 9. Dismiss function: cancel rAF, remove element
    function dismiss(): void {
      if (dismissed) return;
      dismissed = true;
      cancelAnimationFrame(rafId);
      el.remove();
    }

    // 7. Click / touch listeners that dismiss (use abort signal for cleanup)
    document.addEventListener("click", dismiss, { signal: abortSignal });
    document.addEventListener("touchstart", dismiss, { signal: abortSignal });

    // 8. Abort signal handler
    abortSignal.addEventListener("abort", dismiss);

    // 9. Return handle
    return { dismiss };
  } catch {
    // 10. Return null on any error
    return null;
  }
}

function applyRect(el: HTMLElement, rect: DOMRect): void {
  el.style.top = `${rect.top}px`;
  el.style.left = `${rect.left}px`;
  el.style.width = `${rect.width}px`;
  el.style.height = `${rect.height}px`;
}
