/**
 * ScrollController — auto-scrolls a target element into view within its
 * scrollable ancestor, respecting reduced-motion preferences and allowing
 * cancellation via AbortSignal or user-initiated scroll gestures.
 */

import {
  findScrollableAncestor,
  isReducedMotion,
  isElementInView,
} from "./dom-utils.js";

const CANCEL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
]);

/**
 * Scroll the nearest scrollable ancestor so that `target` is centred in its
 * viewport.  The returned promise resolves when the scroll finishes, or
 * rejects if the scroll is aborted (either via `abortSignal` or a user
 * gesture such as wheel / touch / keyboard).
 */
export function scrollToElement(
  target: Element,
  abortSignal: AbortSignal,
): Promise<void> {
  try {
    // Already cancelled — nothing to do.
    if (abortSignal.aborted) {
      return Promise.resolve();
    }

    const container = findScrollableAncestor(target);

    // Already visible — skip the scroll entirely.
    if (isElementInView(target, container)) {
      return Promise.resolve();
    }

    // Calculate target scroll position to centre the element in the container viewport.
    const elRect = target.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const targetTop =
      container.scrollTop +
      (elRect.top - containerRect.top) -
      containerRect.height / 2 +
      elRect.height / 2;

    const behavior: ScrollBehavior = isReducedMotion() ? "instant" : "smooth";

    container.scrollTo({ top: targetTop, behavior });

    // For instant scrolls we can resolve right away.
    if (behavior === "instant") {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      // Internal controller so we can tear everything down in one shot.
      const internal = new AbortController();
      const signal = internal.signal;

      const cleanup = () => {
        internal.abort();
      };

      const done = () => {
        cleanup();
        resolve();
      };

      const abort = () => {
        cleanup();
        reject(new DOMException("Scroll aborted", "AbortError"));
      };

      // ── Caller abort ────────────────────────────────────────────────
      abortSignal.addEventListener("abort", abort, { signal });

      // ── User-gesture cancellation ───────────────────────────────────
      container.addEventListener("wheel", abort, { signal, passive: true });
      container.addEventListener("touchstart", abort, { signal, passive: true });
      container.addEventListener(
        "keydown",
        (e: Event) => {
          if (CANCEL_KEYS.has((e as KeyboardEvent).key)) {
            abort();
          }
        },
        { signal },
      );

      // ── Scroll-end detection ────────────────────────────────────────
      // Prefer the native `scrollend` event when available, with a
      // rAF-polling fallback that resolves once scrollTop is stable for
      // two consecutive animation frames.

      container.addEventListener("scrollend", done, { signal });

      // rAF fallback
      let lastScrollTop = container.scrollTop;
      let stableFrames = 0;

      const poll = () => {
        if (signal.aborted) return;
        const current = container.scrollTop;
        if (current === lastScrollTop) {
          stableFrames++;
          if (stableFrames >= 2) {
            done();
            return;
          }
        } else {
          stableFrames = 0;
        }
        lastScrollTop = current;
        requestAnimationFrame(poll);
      };

      requestAnimationFrame(poll);
    });
  } catch {
    // Graceful degradation — never throw.
    return Promise.resolve();
  }
}
