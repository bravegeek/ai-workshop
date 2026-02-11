/**
 * FNV-1a 32-bit hash function.
 * Produces a deterministic 8-character hex string.
 */
export function fnv1a(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * PII/PHI detection patterns for filtering semantic anchors.
 */
const PII_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone (approx)
  /welcome,?\s+[a-z]+/i, // Welcome [Name]
  /signed in as\s+[a-z]+/i, // Signed in as [Name]
];

/**
 * Generates a semantic fingerprint of the current page.
 * Uses document title, headings, and active nav items.
 */
export function generatePageFingerprint(): string {
  try {
    const anchors: string[] = [];

    // 1. Document Title
    if (document.title) {
      anchors.push(`title:${document.title.trim()}`);
    }

    // 2. Headings (h1-h3)
    const headings = document.querySelectorAll("h1, h2, h3");
    for (const h of headings) {
      const text = h.textContent?.trim();
      if (text && text.length > 0 && text.length < 100 && isVisible(h)) {
        if (!isPII(text)) {
          anchors.push(`${h.tagName.toLowerCase()}:${text}`);
        }
      }
    }

    // 3. Active Nav Items
    const activeNav = document.querySelectorAll("nav .active, nav [aria-current='page']");
    for (const n of activeNav) {
      const text = n.textContent?.trim();
      if (text && text.length > 0 && text.length < 50 && isVisible(n)) {
        if (!isPII(text)) {
          anchors.push(`nav:${text}`);
        }
      }
    }

    // 4. Normalize and Sort for determinism
    const normalized = anchors
      .map((a) => a.toLowerCase().replace(/\s+/g, " "))
      .sort();

    // 5. Join and Hash
    const seed = normalized.join("|");
    return fnv1a(seed);
  } catch (e) {
    // Fail-safe: fallback to a generic hash or URL hash
    return fnv1a(window.location.pathname);
  }
}

/**
 * Checks if an element is visible in the viewport.
 */
function isVisible(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return true;
  const style = window.getComputedStyle(el);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    el.getAttribute("hidden") === null &&
    el.closest("[hidden]") === null
  );
}

/**
 * Checks if a string contains potential PII/PHI.
 */
function isPII(text: string): boolean {
  return PII_PATTERNS.some((pattern) => pattern.test(text));
}
