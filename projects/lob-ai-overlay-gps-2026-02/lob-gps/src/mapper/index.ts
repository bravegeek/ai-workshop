import { 
  type IMapper, 
  type MapperConfig, 
  type SelectorResult, 
  type StateKey, 
  type StateChangeCallback,
  type StateKeyOptions,
  type MapperEventName
} from "./types.js";
import { generateSelector } from "./selector-generator.js";
import { generateStateKey } from "./state-key.js";
import { DomObserver } from "./dom-observer.js";

/**
 * Main Mapper class — The foundational layer of the LOB AI Overlay GPS.
 */
export class Mapper implements IMapper {
  private config: Required<MapperConfig>;
  private observer: DomObserver | null = null;
  private callbacks: Set<StateChangeCallback> = new Set();
  private isDisposed = false;

  constructor(config: MapperConfig = {}) {
    this.config = {
      useFingerprinting: config.useFingerprinting ?? false,
      dynamicIdDenylist: config.dynamicIdDenylist ?? [],
      dynamicIdAllowlist: config.dynamicIdAllowlist ?? [],
      maxAncestorDepth: config.maxAncestorDepth ?? 5,
    };

    // Validate regex patterns
    this.validatePatterns(this.config.dynamicIdDenylist);
    this.validatePatterns(this.config.dynamicIdAllowlist);
  }

  public generateSelector(element: Element): SelectorResult {
    this.ensureNotDisposed();
    return generateSelector(element);
  }

  public generateStateKey(
    selector: string & { readonly __brand: "NormalizedSelector" } | "",
    options?: StateKeyOptions
  ): StateKey {
    this.ensureNotDisposed();
    return generateStateKey(selector, this.config, options);
  }

  public observe(): void {
    this.ensureNotDisposed();
    if (this.observer) return;

    this.observer = new DomObserver({
      onStateChange: (event) => {
        this.callbacks.forEach((cb) => {
          try {
            cb(event);
          } catch (e) {
            // Fail-safe (FR-010)
          }
        });
      },
      generateStateKey: (sel) => this.generateStateKey(sel),
      generateElementSelector: (el) => {
        try {
          return this.generateSelector(el).selector;
        } catch {
          return "";
        }
      },
    });

    this.observer.observe();
  }

  public on(event: MapperEventName, callback: StateChangeCallback): void {
    this.ensureNotDisposed();
    if (event === "state-change") {
      this.callbacks.add(callback);
    }
  }

  public off(event: MapperEventName, callback: StateChangeCallback): void {
    this.ensureNotDisposed();
    if (event === "state-change") {
      this.callbacks.delete(callback);
    }
  }

  public teardown(): void {
    if (this.isDisposed) return;
    this.isDisposed = true;

    if (this.observer) {
      this.observer.teardown();
      this.observer = null;
    }

    this.callbacks.clear();
  }

  private validatePatterns(patterns: readonly string[]): void {
    for (const p of patterns) {
      try {
        new RegExp(p);
      } catch (e) {
        throw new Error(`Invalid regex pattern in MapperConfig: ${p}`);
      }
    }
  }

  private ensureNotDisposed(): void {
    if (this.isDisposed) {
      throw new Error("Mapper instance has been disposed.");
    }
  }
}
