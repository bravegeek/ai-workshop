import type { EngineConfig, StateKey, Suggestion } from "./types.js";
import { CuratedIndex } from "./curated.js";
import { rankPredicted } from "./ranker.js";
import { mergeSuggestions } from "./merger.js";

const DEFAULT_MAX_SUGGESTIONS = 3;

export class Engine {
  private readonly curatedIndex: CuratedIndex;
  private readonly config: EngineConfig;
  private readonly maxSuggestions: number;

  constructor(config: EngineConfig) {
    this.config = config;
    this.maxSuggestions = config.maxSuggestions ?? DEFAULT_MAX_SUGGESTIONS;
    this.curatedIndex = new CuratedIndex(config.curatedPaths ?? []);
  }

  query(stateKey: StateKey): Suggestion[] {
    try {
      const entries = this.config.telemetryProvider.query(stateKey);
      const curated = this.curatedIndex.resolve(stateKey);
      const predicted = rankPredicted(entries);
      return mergeSuggestions(curated, predicted, this.maxSuggestions);
    } catch (error) {
      try {
        this.config.onError?.(error as Error);
      } catch {
        // callback failure is silenced
      }
      return [];
    }
  }
}
