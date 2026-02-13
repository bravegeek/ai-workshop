import type {
  CuratedPath,
  NormalizedSelector,
  StateKey,
  Suggestion,
} from "./types.js";
import { SuggestionSource } from "./types.js";

interface IndexEntry {
  readonly targetSelector: NormalizedSelector;
  readonly label: string;
  readonly pathId: string;
}

/**
 * Pre-built index of curated paths for O(1) step resolution.
 *
 * Given a set of CuratedPaths, builds a Map<StateKey, IndexEntry[]>
 * where each entry points to the *next* step's targetSelector.
 */
export class CuratedIndex {
  private readonly index = new Map<StateKey, IndexEntry[]>();

  constructor(paths: readonly CuratedPath[]) {
    for (const path of paths) {
      const steps = [...path.steps].sort((a, b) => a.stepNumber - b.stepNumber);

      for (let i = 0; i < steps.length - 1; i++) {
        const current = steps[i];
        const next = steps[i + 1];

        const entries = this.index.get(current.stateKey) ?? [];
        entries.push({
          targetSelector: next.targetSelector,
          label: next.label,
          pathId: path.id,
        });
        this.index.set(current.stateKey, entries);
      }
    }
  }

  /**
   * Resolve curated suggestions for the given StateKey.
   * Returns suggestions for the next step(s) in matching paths,
   * deduplicated by targetSelector (first-registered path wins).
   */
  resolve(stateKey: StateKey): Suggestion[] {
    const entries = this.index.get(stateKey);
    if (!entries) return [];

    const seen = new Set<NormalizedSelector>();
    const suggestions: Suggestion[] = [];

    for (const entry of entries) {
      if (seen.has(entry.targetSelector)) continue;
      seen.add(entry.targetSelector);

      suggestions.push({
        selector: entry.targetSelector,
        label: entry.label,
        confidence: 1.0,
        source: SuggestionSource.CURATED,
        avgDwellTime: 0,
        curatedPathId: entry.pathId,
      });
    }

    return suggestions;
  }
}
