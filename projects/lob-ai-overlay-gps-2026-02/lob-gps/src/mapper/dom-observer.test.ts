import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Window } from "happy-dom";
import { DomObserver } from "./dom-observer.js";
import { StateChangeTrigger } from "./types.js";

describe("dom-observer", () => {
  let window: Window;
  let document: Document;

  beforeEach(() => {
    window = new Window();
    document = window.document as unknown as Document;
    
    // Mock global document and window
    (global as any).document = document;
    (global as any).window = window;
    (global as any).HTMLElement = (window as any).HTMLElement;
    (global as any).Node = (window as any).Node;
    (global as any).MutationObserver = (window as any).MutationObserver;
    
    // Mock requestAnimationFrame
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(Date.now()), 0);
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => {
      clearTimeout(id);
    });
    
    // Mock getComputedStyle
    vi.stubGlobal("getComputedStyle", (el: Element) => {
      return (el as any).style || {};
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("emits state-change when hidden element with interactive children becomes visible", async () => {
    document.body.innerHTML = `
      <div id="container" style="display: none">
        <button>Click Me</button>
      </div>
    `;
    
    const onStateChange = vi.fn();
    let callCount = 0;
    const observer = new DomObserver({
        onStateChange,
        generateStateKey: () => `key-${callCount++}` as any
    });

    observer.observe();

    // Trigger visibility change
    const container = document.getElementById("container")!;
    container.style.display = "block";
    
    // Wait for debounce (rAF)
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(onStateChange).toHaveBeenCalled();
    const event = onStateChange.mock.calls[0][0];
    expect(event.trigger).toBe(StateChangeTrigger.VISIBILITY);
    
    observer.teardown();
  });

  it("emits state-change when interactive elements are added", async () => {
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.getElementById("root")!;
    
    const onStateChange = vi.fn();
    let callCount = 0;
    const observer = new DomObserver({
        onStateChange,
        generateStateKey: () => `key-${callCount++}` as any
    });

    observer.observe();

    const btn = document.createElement("button");
    btn.textContent = "New Button";
    root.appendChild(btn);

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(onStateChange).toHaveBeenCalled();
    const event = onStateChange.mock.calls[0][0];
    expect(event.trigger).toBe(StateChangeTrigger.CHILD_LIST);
    
    observer.teardown();
  });

  it("does not emit for non-interactive noise", async () => {
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.getElementById("root")!;
    
    const onStateChange = vi.fn();
    const observer = new DomObserver({
        onStateChange,
        generateStateKey: (sel) => `key::${sel}` as any
    });

    observer.observe();

    const noise = document.createElement("div");
    noise.className = "noise";
    noise.textContent = "Noise";
    root.appendChild(noise);

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(onStateChange).not.toHaveBeenCalled();
    
    observer.teardown();
  });

  it("stops emitting after teardown", async () => {
    document.body.innerHTML = `<div id="root"></div>`;
    const root = document.getElementById("root")!;
    
    const onStateChange = vi.fn();
    const observer = new DomObserver({
        onStateChange,
        generateStateKey: (sel) => `key::${sel}` as any
    });

    observer.observe();
    observer.teardown();

    const btn = document.createElement("button");
    root.appendChild(btn);

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(onStateChange).not.toHaveBeenCalled();
  });
});
