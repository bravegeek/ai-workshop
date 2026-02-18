import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { pulse } from "./pulse-renderer.js";

function mockRect(overrides: Partial<DOMRect> = {}): DOMRect {
  return {
    x: 0,
    y: 0,
    top: 10,
    left: 20,
    width: 200,
    height: 50,
    right: 220,
    bottom: 60,
    toJSON() {},
    ...overrides,
  } as DOMRect;
}

function zeroRect(): DOMRect {
  return mockRect({ x: 0, y: 0, top: 0, left: 0, width: 0, height: 0, right: 0, bottom: 0 });
}

describe("PulseRenderer", () => {
  let target: HTMLElement;
  let host: HTMLDivElement;
  let root: ShadowRoot;
  let controller: AbortController;
  let rafCallbacks: FrameRequestCallback[];

  beforeEach(() => {
    target = document.createElement("div");
    document.body.appendChild(target);

    host = document.createElement("div");
    root = host.attachShadow({ mode: "open" });

    controller = new AbortController();

    rafCallbacks = [];
    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    target.remove();
    vi.restoreAllMocks();
  });

  test("pulse() creates a .lob-pulse div inside shadow root", () => {
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(mockRect());
    const handle = pulse(target, root, controller.signal);
    expect(handle).not.toBeNull();
    const pulseEl = root.querySelector(".lob-pulse");
    expect(pulseEl).not.toBeNull();
    expect(pulseEl).toBeInstanceOf(HTMLDivElement);
    handle!.dismiss();
  });

  test("pulse element has position: fixed with correct top/left/width/height", () => {
    const rect = mockRect({ top: 30, left: 40, width: 150, height: 60 });
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(rect);

    const handle = pulse(target, root, controller.signal);
    const pulseEl = root.querySelector(".lob-pulse") as HTMLElement;

    expect(pulseEl.style.position).toBe("fixed");
    expect(pulseEl.style.top).toBe("30px");
    expect(pulseEl.style.left).toBe("40px");
    expect(pulseEl.style.width).toBe("150px");
    expect(pulseEl.style.height).toBe("60px");

    handle!.dismiss();
  });

  test("pulse element has pointer-events: none", () => {
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(mockRect());
    const handle = pulse(target, root, controller.signal);
    const pulseEl = root.querySelector(".lob-pulse") as HTMLElement;
    expect(pulseEl.style.pointerEvents).toBe("none");
    handle!.dismiss();
  });

  test("pulse is removed when AbortController signals abort", () => {
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(mockRect());
    pulse(target, root, controller.signal);
    expect(root.querySelector(".lob-pulse")).not.toBeNull();

    controller.abort();
    expect(root.querySelector(".lob-pulse")).toBeNull();
  });

  test("dismiss() cancels rAF and removes pulse element", () => {
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(mockRect());
    const handle = pulse(target, root, controller.signal);
    expect(root.querySelector(".lob-pulse")).not.toBeNull();

    handle!.dismiss();
    expect(root.querySelector(".lob-pulse")).toBeNull();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  test("pulse repositions when target bounding rect changes", () => {
    const rect1 = mockRect({ top: 10, left: 20, width: 200, height: 50 });
    const rect2 = mockRect({ top: 100, left: 200, width: 300, height: 80 });
    vi.spyOn(target, "getBoundingClientRect")
      .mockReturnValueOnce(rect1) // initial visibility check + positioning
      .mockReturnValue(rect2);    // rAF repositioning

    const handle = pulse(target, root, controller.signal);
    const pulseEl = root.querySelector(".lob-pulse") as HTMLElement;

    expect(pulseEl.style.top).toBe("10px");
    expect(pulseEl.style.left).toBe("20px");

    // Fire rAF callback to trigger repositioning
    expect(rafCallbacks.length).toBeGreaterThan(0);
    rafCallbacks[0](performance.now());

    expect(pulseEl.style.top).toBe("100px");
    expect(pulseEl.style.left).toBe("200px");
    expect(pulseEl.style.width).toBe("300px");
    expect(pulseEl.style.height).toBe("80px");

    handle!.dismiss();
  });

  test("no pulse rendered when target has zero-size rect (FR-022)", () => {
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(zeroRect());
    const handle = pulse(target, root, controller.signal);
    expect(handle).toBeNull();
    expect(root.querySelector(".lob-pulse")).toBeNull();
  });

  test("rAF loop dismisses when target rect becomes zero-size (FR-020)", () => {
    const visibleRect = mockRect({ top: 10, left: 20, width: 200, height: 50 });
    vi.spyOn(target, "getBoundingClientRect")
      .mockReturnValueOnce(visibleRect) // initial visibility check + positioning
      .mockReturnValue(zeroRect());     // rAF sees zero

    const handle = pulse(target, root, controller.signal);
    expect(root.querySelector(".lob-pulse")).not.toBeNull();

    // Fire rAF — should auto-dismiss
    rafCallbacks[0](performance.now());
    expect(root.querySelector(".lob-pulse")).toBeNull();
  });

  test("rAF loop dismisses when target is disconnected (FR-020)", () => {
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(mockRect());
    const handle = pulse(target, root, controller.signal);
    expect(root.querySelector(".lob-pulse")).not.toBeNull();

    // Disconnect target from DOM
    target.remove();

    // Fire rAF — should auto-dismiss
    rafCallbacks[0](performance.now());
    expect(root.querySelector(".lob-pulse")).toBeNull();
  });

  test("dismiss() is idempotent — double call does not throw", () => {
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(mockRect());
    const handle = pulse(target, root, controller.signal);
    handle!.dismiss();
    expect(() => handle!.dismiss()).not.toThrow();
  });

  test("returns null on error (e.g., invalid shadow root)", () => {
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(mockRect());
    // Pass null as shadowRoot to trigger an error
    const handle = pulse(target, null as unknown as ShadowRoot, controller.signal);
    expect(handle).toBeNull();
  });
});
