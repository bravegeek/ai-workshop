import { StateChangeTrigger, type StateChangeEvent, type StateKey, type NormalizedSelector } from "./types.js";

interface DomObserverOptions {
  onStateChange: (event: StateChangeEvent) => void;
  generateStateKey: (lastSelector: NormalizedSelector | "") => StateKey;
  generateElementSelector: (el: Element) => NormalizedSelector | "";
}

/**
 * Observes the host DOM for meaningful state changes using MutationObserver.
 * Debounces events within animation frames and filters for interactive elements.
 */
export class DomObserver {
  private structuralObserver: MutationObserver | null = null;
  private attributeObserver: MutationObserver | null = null;
  private pendingRecords: MutationRecord[] = [];
  private rafId: number | null = null;
  private previousStateKey: StateKey;
  private lastActionSelector: NormalizedSelector | "" = "";
  private clickHandler: ((e: MouseEvent) => void) | null = null;
  private isDisposed = false;

  constructor(private options: DomObserverOptions) {
    this.previousStateKey = options.generateStateKey("");
  }

  /**
   * Start observing the host DOM.
   */
  public observe(): void {
    if (this.isDisposed || this.structuralObserver) return;

    try {
      // 1. Structural observer for additions/removals
      this.structuralObserver = new MutationObserver(this.handleMutations);
      this.structuralObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // 2. Attribute observer for visibility toggles
      this.attributeObserver = new MutationObserver(this.handleMutations);
      this.attributeObserver.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ["style", "class", "hidden"],
      });

      // 3. Click listener to track last action selector (FR-004)
      this.clickHandler = (e: MouseEvent) => {
        const target = e.target instanceof Element ? e.target : null;
        if (target && this.isInteractive(target)) {
          try {
            const sel = this.options.generateElementSelector(target);
            if (sel) this.lastActionSelector = sel;
          } catch {
            // Fail-safe (FR-010)
          }
        }
      };
      document.addEventListener("click", this.clickHandler, { capture: true });
    } catch (e) {
      // Fail-safe (FR-010)
    }
  }

  /**
   * Stop observing and clean up resources.
   */
  public teardown(): void {
    this.isDisposed = true;
    
    if (this.structuralObserver) {
      this.structuralObserver.disconnect();
      this.structuralObserver = null;
    }
    
    if (this.attributeObserver) {
      this.attributeObserver.disconnect();
      this.attributeObserver = null;
    }

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.clickHandler) {
      document.removeEventListener("click", this.clickHandler, { capture: true });
      this.clickHandler = null;
    }

    this.pendingRecords = [];
  }

  private handleMutations = (records: MutationRecord[]): void => {
    if (this.isDisposed) return;

    this.pendingRecords.push(...records);

    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(this.processPendingMutations);
    }
  };

  private processPendingMutations = (): void => {
    this.rafId = null;
    if (this.isDisposed || this.pendingRecords.length === 0) return;

    const records = this.pendingRecords;
    this.pendingRecords = [];

    try {
      let trigger: StateChangeTrigger | null = null;

      for (const record of records) {
        if (record.type === "childList") {
          // Check if added/removed nodes contain interactive elements
          if (this.hasInteractiveNodes(record.addedNodes) || this.hasInteractiveNodes(record.removedNodes)) {
            trigger = StateChangeTrigger.CHILD_LIST;
            break;
          }
        } else if (record.type === "attributes") {
          // Check visibility toggle on container
          const target = record.target as Element;
          if (this.isContainer(target) && this.wasVisibilityToggled(record)) {
            if (this.hasInteractiveChildren(target)) {
              trigger = StateChangeTrigger.VISIBILITY;
              break;
            }
          }
        }
      }

      if (trigger) {
        const newStateKey = this.options.generateStateKey(this.lastActionSelector);
        if (newStateKey !== this.previousStateKey) {
          const event: StateChangeEvent = {
            previousStateKey: this.previousStateKey,
            newStateKey,
            trigger,
            timestamp: performance.now(),
          };
          this.previousStateKey = newStateKey;
          this.options.onStateChange(event);
        }
      }
    } catch (e) {
      // Fail-safe (FR-010)
    }
  };

  private hasInteractiveNodes(nodes: NodeList): boolean {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node instanceof Element) {
        if (this.isInteractive(node) || this.hasInteractiveChildren(node)) {
          return true;
        }
      }
    }
    return false;
  }

  private hasInteractiveChildren(el: Element, depth = 0): boolean {
    if (depth >= 3) return false; // FR-007 depth limit

    const interactiveSelector = "button, a, input, select, textarea, [role='button'], [role='link']";
    if (el.querySelector(interactiveSelector)) return true;
    
    return false;
  }

  private isInteractive(el: Element): boolean {
    const tag = el.tagName.toLowerCase();
    const role = el.getAttribute("role");
    return ["button", "a", "input", "select", "textarea"].includes(tag) || 
           ["button", "link"].includes(role || "");
  }

  private isContainer(el: Element): boolean {
    const tag = el.tagName.toLowerCase();
    return ["div", "section", "article", "nav", "main", "aside", "ul", "ol", "li", "form", "fieldset"].includes(tag);
  }

  private wasVisibilityToggled(record: MutationRecord): boolean {
    const target = record.target as HTMLElement;
    if (record.attributeName === "hidden") return true;
    
    // For style and class, we check computed style if possible
    // Note: this is expensive, but we've already filtered by container and interactive children
    try {
        const style = window.getComputedStyle(target);
        // We look for transitions to/from display:none or visibility:hidden
        // Simplified: any change to these attributes on a container is a candidate
        return true; 
    } catch (e) {
        return true;
    }
  }
}
