/**
 * Shared DOM utility helpers for the UI module.
 * All functions are wrapped in try-catch, returning safe defaults on error.
 */

export function isElementVisible(element: Element): boolean {
  try {
    if (!element || !element.isConnected) return false;
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    const style = getComputedStyle(element);
    if (style.display === "none") return false;
    if (style.visibility === "hidden") return false;
    return true;
  } catch {
    return false;
  }
}

export function findScrollableAncestor(element: Element): Element {
  const fallback = document.scrollingElement ?? document.documentElement;
  try {
    if (!element) return fallback;
    let el = element.parentElement;
    while (el) {
      const style = getComputedStyle(el);
      const overflow = style.overflow;
      const overflowY = style.overflowY || overflow;
      const overflowX = style.overflowX || overflow;
      const isScrollableY =
        (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
        el.scrollHeight > el.clientHeight;
      const isScrollableX =
        (overflowX === "auto" || overflowX === "scroll" || overflowX === "overlay") &&
        el.scrollWidth > el.clientWidth;
      if (isScrollableY || isScrollableX) return el;
      el = el.parentElement;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function resolveElement(selector: string): Element | null {
  try {
    if (!selector) return null;
    return document.querySelector(selector);
  } catch {
    return null;
  }
}

export function isReducedMotion(): boolean {
  try {
    if (typeof matchMedia !== "function") return false;
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function isElementInView(element: Element, container: Element): boolean {
  try {
    const elRect = element.getBoundingClientRect();
    const containerRect = container === document.documentElement
      ? { top: 0, bottom: window.innerHeight, left: 0, right: window.innerWidth }
      : container.getBoundingClientRect();
    return (
      elRect.top >= containerRect.top &&
      elRect.bottom <= containerRect.bottom &&
      elRect.left >= containerRect.left &&
      elRect.right <= containerRect.right
    );
  } catch {
    return false;
  }
}
