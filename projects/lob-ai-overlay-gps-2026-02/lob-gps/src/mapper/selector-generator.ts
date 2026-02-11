import { SelectorTier, type SelectorResult, type NormalizedSelector, type ResolveSelector } from "./types.js";
import { isDynamicId, normalizeString } from "./dynamic-id-detector.js";

/**
 * Maximum ancestor depth to walk when searching for stable anchors
 * or building DOM paths.
 */
const DEFAULT_MAX_DEPTH = 5;

/**
 * Generate a stable, normalized selector for a host DOM element.
 */
export function generateSelector(element: Element): SelectorResult {
  try {
    // Tier 1: Unique stable ID
    const id = element.id;
    if (id && !isDynamicId(id)) {
      const selector = `#${id}` as NormalizedSelector;
      if (isUnique(selector, element.ownerDocument)) {
        return { selector, tier: SelectorTier.ID, ambiguous: false };
      }
    }

    // Tier 2: data-testid
    const testId = element.getAttribute("data-testid");
    if (testId) {
      const selector = `[data-testid="${testId}"]` as NormalizedSelector;
      if (isUnique(selector, element.ownerDocument)) {
        return { selector, tier: SelectorTier.DATA_TESTID, ambiguous: false };
      }
    }

    // Tier 3: aria-label
    const ariaLabel = element.getAttribute("aria-label");
    if (ariaLabel) {
      const selector = `[aria-label="${ariaLabel}"]` as NormalizedSelector;
      if (isUnique(selector, element.ownerDocument)) {
        return { selector, tier: SelectorTier.ARIA_LABEL, ambiguous: false };
      }
    }

    // Tier 4: Text Content (for interactive elements)
    if (isInteractive(element)) {
      const text = element.textContent?.trim();
      if (text && text.length > 0 && text.length < 100) {
        const anchor = findStableAnchor(element);
        const tag = element.tagName.toLowerCase();
        const scopedSelector = anchor 
          ? `${anchor.selector} ${tag}` 
          : tag;
        
        return { 
          selector: scopedSelector as NormalizedSelector, 
          tier: SelectorTier.TEXT_CONTENT, 
          ambiguous: !isUniqueWithText(scopedSelector, text, element.ownerDocument),
          textHint: text 
        };
      }
    }

    // Tier 5: DOM Path
    const pathSelector = buildDomPathSelector(element);
    return {
      selector: pathSelector as NormalizedSelector,
      tier: SelectorTier.DOM_PATH,
      ambiguous: !isUnique(pathSelector, element.ownerDocument)
    };

  } catch (error) {
    // Fail-safe resilience (FR-010)
    return {
      selector: "*" as NormalizedSelector,
      tier: SelectorTier.DOM_PATH,
      ambiguous: true
    };
  }
}

/**
 * Resolve a SelectorResult back to an element.
 */
export const resolveSelector: ResolveSelector = (result, root = document) => {
  try {
    if (result.tier === SelectorTier.TEXT_CONTENT && result.textHint) {
      const candidates = root.querySelectorAll(result.selector);
      for (const candidate of candidates) {
        if (candidate.textContent?.trim() === result.textHint) {
          return candidate;
        }
      }
      return null;
    }
    return root.querySelector(result.selector);
  } catch (e) {
    return null;
  }
};

/**
 * Checks if a selector is unique within the given root.
 */
function isUnique(selector: string, root: ParentNode | null): boolean {
  if (!root) return false;
  try {
    return root.querySelectorAll(selector).length === 1;
  } catch (e) {
    return false;
  }
}

/**
 * Checks if a selector + text hint is unique.
 */
function isUniqueWithText(selector: string, text: string, root: ParentNode | null): boolean {
  if (!root) return false;
  try {
    const candidates = root.querySelectorAll(selector);
    let count = 0;
    for (const candidate of candidates) {
      if (candidate.textContent?.trim() === text) {
        count++;
      }
    }
    return count === 1;
  } catch (e) {
    return false;
  }
}

/**
 * Determines if an element is interactive.
 */
function isInteractive(element: Element): boolean {
  const tag = element.tagName.toLowerCase();
  const role = element.getAttribute("role");
  return (
    tag === "button" ||
    tag === "a" ||
    tag === "input" ||
    tag === "select" ||
    tag === "textarea" ||
    role === "button" ||
    role === "link" ||
    element.hasAttribute("onclick")
  );
}

/**
 * Finds the closest stable anchor for an element.
 */
function findStableAnchor(element: Element, maxDepth = DEFAULT_MAX_DEPTH): { selector: string, element: Element } | null {
  let current: Element | null = element.parentElement;
  let depth = 0;

  while (current && depth < maxDepth) {
    const id = current.id;
    if (id && !isDynamicId(id)) {
      return { selector: `#${id}`, element: current };
    }
    const testId = current.getAttribute("data-testid");
    if (testId) {
      return { selector: `[data-testid="${testId}"]`, element: current };
    }
    
    // Landmark roles
    const role = current.getAttribute("role");
    if (role && ["main", "nav", "header", "footer", "section"].includes(role)) {
        const tag = current.tagName.toLowerCase();
        const selector = `${tag}[role="${role}"]`;
        return { selector, element: current };
    }

    current = current.parentElement;
    depth++;
  }

  return null;
}

/**
 * Builds a structural DOM path selector.
 */
function buildDomPathSelector(element: Element, maxDepth = DEFAULT_MAX_DEPTH): string {
  const steps: string[] = [];
  let current: Element | null = element;
  let depth = 0;

  while (current && depth < maxDepth) {
    // If we hit a stable anchor (except the element itself), we stop and prepend it.
    if (current !== element) {
      const id = current.id;
      if (id && !isDynamicId(id)) {
        steps.unshift(`#${id}`);
        break;
      }
      const testId = current.getAttribute("data-testid");
      if (testId) {
        steps.unshift(`[data-testid="${testId}"]`);
        break;
      }
    }

    steps.unshift(buildStepSelector(current));
    
    if (current.tagName.toLowerCase() === "body" || current.tagName.toLowerCase() === "html") {
        break;
    }

    current = current.parentElement;
    depth++;
  }

  return steps.join(" > ");
}

/**
 * Builds a single step selector (tag + classes + nth-of-type).
 */
function buildStepSelector(element: Element): string {
  const tag = element.tagName.toLowerCase();
  if (tag === "body" || tag === "html") return tag;

  let step = tag;
  
  // Add normalized classes
  if (element.classList.length > 0) {
    const classes = Array.from(element.classList)
      .map(c => normalizeString(c))
      .filter(c => c.length > 0);
    if (classes.length > 0) {
      step += `.${classes.join(".")}`;
    }
  }

  // Add nth-of-type if not unique among siblings by tag
  const parent = element.parentElement;
  if (parent) {
    const siblings = Array.from(parent.children).filter(s => s.tagName === element.tagName);
    if (siblings.length > 1) {
      const index = siblings.indexOf(element) + 1;
      step += `:nth-of-type(${index})`;
    }
  }

  return step;
}
