import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isElementVisible,
  findScrollableAncestor,
  resolveElement,
  isReducedMotion,
  isElementInView,
} from "./dom-utils.js";

describe("isElementVisible", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("div");
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  test("returns true for a connected, visible element", () => {
    // happy-dom gives default rects of 0, so we mock
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
      x: 0, y: 0, top: 0, left: 0, width: 100, height: 50,
      right: 100, bottom: 50, toJSON() {},
    });
    expect(isElementVisible(el)).toBe(true);
  });

  test("returns false for a disconnected element", () => {
    const orphan = document.createElement("div");
    expect(isElementVisible(orphan)).toBe(false);
  });

  test("returns false when display is none", () => {
    el.style.display = "none";
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
      x: 0, y: 0, top: 0, left: 0, width: 0, height: 0,
      right: 0, bottom: 0, toJSON() {},
    });
    expect(isElementVisible(el)).toBe(false);
  });

  test("returns false when visibility is hidden", () => {
    el.style.visibility = "hidden";
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
      x: 0, y: 0, top: 0, left: 0, width: 100, height: 50,
      right: 100, bottom: 50, toJSON() {},
    });
    expect(isElementVisible(el)).toBe(false);
  });

  test("returns false for zero-size rect", () => {
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
      x: 0, y: 0, top: 0, left: 0, width: 0, height: 0,
      right: 0, bottom: 0, toJSON() {},
    });
    expect(isElementVisible(el)).toBe(false);
  });

  test("returns false for null input", () => {
    expect(isElementVisible(null as unknown as Element)).toBe(false);
  });
});

describe("findScrollableAncestor", () => {
  test("returns document.scrollingElement when no scrollable ancestor exists", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const result = findScrollableAncestor(el);
    expect(result).toBe(document.scrollingElement ?? document.documentElement);
    el.remove();
  });

  test("finds ancestor with overflow auto and scrollable content", () => {
    const container = document.createElement("div");
    const child = document.createElement("div");
    container.style.overflow = "auto";
    Object.defineProperty(container, "scrollHeight", { value: 500, configurable: true });
    Object.defineProperty(container, "clientHeight", { value: 200, configurable: true });
    container.appendChild(child);
    document.body.appendChild(container);

    const result = findScrollableAncestor(child);
    expect(result).toBe(container);

    container.remove();
  });

  test("finds ancestor with overflow scroll", () => {
    const container = document.createElement("div");
    const child = document.createElement("div");
    container.style.overflow = "scroll";
    Object.defineProperty(container, "scrollHeight", { value: 500, configurable: true });
    Object.defineProperty(container, "clientHeight", { value: 200, configurable: true });
    container.appendChild(child);
    document.body.appendChild(container);

    const result = findScrollableAncestor(child);
    expect(result).toBe(container);

    container.remove();
  });

  test("skips non-scrollable ancestors", () => {
    const outer = document.createElement("div");
    const inner = document.createElement("div");
    const child = document.createElement("div");
    outer.style.overflow = "auto";
    Object.defineProperty(outer, "scrollHeight", { value: 500, configurable: true });
    Object.defineProperty(outer, "clientHeight", { value: 200, configurable: true });
    inner.style.overflow = "visible";
    outer.appendChild(inner);
    inner.appendChild(child);
    document.body.appendChild(outer);

    const result = findScrollableAncestor(child);
    expect(result).toBe(outer);

    outer.remove();
  });

  test("returns fallback for null input", () => {
    const result = findScrollableAncestor(null as unknown as Element);
    expect(result).toBe(document.scrollingElement ?? document.documentElement);
  });
});

describe("resolveElement", () => {
  test("returns element for valid selector", () => {
    const el = document.createElement("div");
    el.id = "resolve-test";
    document.body.appendChild(el);
    expect(resolveElement("#resolve-test")).toBe(el);
    el.remove();
  });

  test("returns null for non-existent selector", () => {
    expect(resolveElement("#does-not-exist")).toBeNull();
  });

  test("returns null for invalid selector syntax", () => {
    expect(resolveElement("[[[invalid")).toBeNull();
  });

  test("returns null for empty string", () => {
    expect(resolveElement("")).toBeNull();
  });
});

describe("isReducedMotion", () => {
  test("returns false when matchMedia reports no-preference", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
    expect(isReducedMotion()).toBe(false);
    vi.unstubAllGlobals();
  });

  test("returns true when matchMedia reports reduce", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    expect(isReducedMotion()).toBe(true);
    vi.unstubAllGlobals();
  });

  test("returns false when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);
    expect(isReducedMotion()).toBe(false);
    vi.unstubAllGlobals();
  });
});

describe("isElementInView", () => {
  test("returns true when element is fully within container viewport", () => {
    const el = document.createElement("div");
    const container = document.createElement("div");
    document.body.appendChild(container);
    container.appendChild(el);

    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
      x: 50, y: 50, top: 50, left: 50, width: 100, height: 30,
      right: 150, bottom: 80, toJSON() {},
    });
    vi.spyOn(container, "getBoundingClientRect").mockReturnValue({
      x: 0, y: 0, top: 0, left: 0, width: 800, height: 600,
      right: 800, bottom: 600, toJSON() {},
    });

    expect(isElementInView(el, container)).toBe(true);
    container.remove();
  });

  test("returns false when element is below container viewport", () => {
    const el = document.createElement("div");
    const container = document.createElement("div");
    document.body.appendChild(container);
    container.appendChild(el);

    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
      x: 50, y: 700, top: 700, left: 50, width: 100, height: 30,
      right: 150, bottom: 730, toJSON() {},
    });
    vi.spyOn(container, "getBoundingClientRect").mockReturnValue({
      x: 0, y: 0, top: 0, left: 0, width: 800, height: 600,
      right: 800, bottom: 600, toJSON() {},
    });

    expect(isElementInView(el, container)).toBe(false);
    container.remove();
  });

  test("returns false when element is above container viewport", () => {
    const el = document.createElement("div");
    const container = document.createElement("div");
    document.body.appendChild(container);
    container.appendChild(el);

    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
      x: 50, y: -50, top: -50, left: 50, width: 100, height: 30,
      right: 150, bottom: -20, toJSON() {},
    });
    vi.spyOn(container, "getBoundingClientRect").mockReturnValue({
      x: 0, y: 0, top: 0, left: 0, width: 800, height: 600,
      right: 800, bottom: 600, toJSON() {},
    });

    expect(isElementInView(el, container)).toBe(false);
    container.remove();
  });

  test("uses viewport bounds for document.documentElement as container", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);

    vi.stubGlobal("innerWidth", 1024);
    vi.stubGlobal("innerHeight", 768);

    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
      x: 50, y: 50, top: 50, left: 50, width: 100, height: 30,
      right: 150, bottom: 80, toJSON() {},
    });

    expect(isElementInView(el, document.documentElement)).toBe(true);

    el.remove();
    vi.unstubAllGlobals();
  });

  test("returns false on error", () => {
    const el = document.createElement("div");
    vi.spyOn(el, "getBoundingClientRect").mockImplementation(() => {
      throw new Error("getBoundingClientRect error");
    });
    expect(isElementInView(el, document.documentElement)).toBe(false);
  });
});
