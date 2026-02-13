import type { NormalizedSelector, Suggestion } from "./types.js";

/**
 * Merge curated and predicted suggestions with dedup and truncation.
 *
 * Curated suggestions come first. Predicted suggestions with a selector
 * already present in curated are dropped. Result is truncated to maxSuggestions.
 */
export function mergeSuggestions(
  curated: Suggestion[],
  predicted: Suggestion[],
  maxSuggestions: number,
): Suggestion[] {
  const curatedSelectors = new Set<NormalizedSelector>(
    curated.map((s) => s.selector),
  );

  const filteredPredicted = predicted.filter(
    (s) => !curatedSelectors.has(s.selector),
  );

  return [...curated, ...filteredPredicted].slice(0, maxSuggestions);
}
