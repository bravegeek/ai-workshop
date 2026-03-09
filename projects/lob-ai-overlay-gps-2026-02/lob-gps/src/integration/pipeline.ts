import type { StateChangeEvent, StateKey } from "../mapper/types.js";
import type { NormalizedSelector, Suggestion } from "../engine/types.js";
import { ActionType } from "../telemetry/types.js";
import type { ResolvedConfig } from "./types.js";

const DEBOUNCE_MS = 100;

export interface PipelineDeps {
  mapper: {
    on(event: "state-change", cb: (event: StateChangeEvent) => void): void;
    off(event: "state-change", cb: (event: StateChangeEvent) => void): void;
  };
  telemetry: {
    record(stateKey: StateKey, selector: NormalizedSelector, actionType: ActionType): void;
  };
  engine: {
    query(stateKey: StateKey): Suggestion[];
  };
  ui: {
    render(suggestions: Suggestion[]): void;
  };
  config: ResolvedConfig;
  errorReporter: (error: Error) => void;
  onAutoDisable?: () => void;
}

export class Pipeline {
  private readonly deps: PipelineDeps;
  private config: ResolvedConfig;
  private readonly handler: (event: StateChangeEvent) => void;
  private debounceGateOpen = true;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private cycleController: AbortController | null = null;
  private running = false;

  // Auto-disable tracking
  private consecutiveErrors = 0;
  private errorWindowStart = -1;

  constructor(deps: PipelineDeps) {
    this.deps = deps;
    this.config = deps.config;
    this.handler = (event: StateChangeEvent) => this.handleStateChange(event);
  }

  updateConfig(config: ResolvedConfig): void {
    this.config = config;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.debounceGateOpen = true;
    this.deps.mapper.on("state-change", this.handler);
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;
    this.deps.mapper.off("state-change", this.handler);

    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.cycleController) {
      this.cycleController.abort();
      this.cycleController = null;
    }

    this.debounceGateOpen = true;
  }

  private handleStateChange(event: StateChangeEvent): void {
    if (!this.debounceGateOpen) return;

    this.debounceGateOpen = false;
    this.debounceTimer = setTimeout(() => {
      this.debounceGateOpen = true;
      this.debounceTimer = null;
    }, DEBOUNCE_MS);

    this.runCycle(event);
  }

  private runCycle(event: StateChangeEvent): void {
    if (this.cycleController) {
      this.cycleController.abort();
    }
    this.cycleController = new AbortController();

    const parts = (event.newStateKey as string).split("::");
    const selector = (parts.length > 1 ? parts[1] : "") as NormalizedSelector;

    let hadError = false;

    // Step 1: Record telemetry — index by previousStateKey so the engine learns
    // "from state A, the user's next action was selector X (arriving at state B)".
    // Querying newStateKey then returns what others did *after* reaching this state.
    try {
      this.deps.telemetry.record(event.previousStateKey, selector, ActionType.NAVIGATION);
    } catch (err) {
      hadError = true;
      this.deps.errorReporter(err instanceof Error ? err : new Error(String(err)));
    }

    // Step 2: Query engine
    let suggestions: Suggestion[] = [];
    try {
      suggestions = this.deps.engine.query(event.newStateKey);
    } catch (err) {
      hadError = true;
      this.deps.errorReporter(err instanceof Error ? err : new Error(String(err)));
    }

    // Step 3: Render UI
    try {
      this.deps.ui.render(suggestions);
    } catch (err) {
      hadError = true;
      this.deps.errorReporter(err instanceof Error ? err : new Error(String(err)));
    }

    // Auto-disable tracking
    if (hadError) {
      const now = performance.now();
      if (
        this.errorWindowStart < 0 ||
        now - this.errorWindowStart > this.config.errorWindowMs
      ) {
        this.errorWindowStart = now;
        this.consecutiveErrors = 1;
      } else {
        this.consecutiveErrors++;
      }

      if (this.consecutiveErrors >= this.config.errorThreshold) {
        this.deps.onAutoDisable?.();
      }
    } else {
      this.consecutiveErrors = 0;
      this.errorWindowStart = -1;
    }
  }
}
