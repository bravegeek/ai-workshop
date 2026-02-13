import type { FrequencyEntry, Suggestion } from "./types.js";
import { SuggestionSource } from "./types.js";
import { generatePredictedLabel } from "./labels.js";

/**
 * Rank frequency entries into predicted suggestions.
 *
 * Computes confidence = count / totalTransitions, generates labels,
 * sorts by count desc then lastSeenTimestamp desc.
 * Does NOT truncate — the merger owns final truncation after combining
 * with curated suggestions.
 */
export function rankPredicted(entries: FrequencyEntry[]): Suggestion[] {
  if (entries.length === 0) return [];

  const totalTransitions = entries.reduce((sum, e) => sum + e.count, 0);

  // Sort entries first, then map to Suggestion (avoids lookups in comparator)
  const sorted = [...entries].sort((a, b) => {
    if (a.count !== b.count) return b.count - a.count;
    return b.lastSeenTimestamp - a.lastSeenTimestamp;
  });

  return sorted.map((entry) => {
    const confidence = entry.count / totalTransitions;
    return {
      selector: entry.selector,
      label: generatePredictedLabel(confidence),
      confidence,
      source: SuggestionSource.PREDICTED,
      avgDwellTime: entry.avgDwellTime,
    } satisfies Suggestion;
  });
}
