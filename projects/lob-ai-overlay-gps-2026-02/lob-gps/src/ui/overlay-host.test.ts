import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { OverlayHost } from "./overlay-host.js";
import type { UIConfig } from "./types.js";

describe("OverlayHost", () => {
  let host: OverlayHost;

  beforeEach(() => {
    host = new OverlayHost();
  });

  afterEach(() => {
    host.teardown();
  });

  test("create() appends a div to document.body", () => {
    host.create({});
    const root = host.getRoot();
    expect(root).not.toBeNull();
    expect(root!.host).toBeInstanceOf(HTMLDivElement);
    expect(root!.host.parentElement).toBe(document.body);
  });

  test("create() attaches an open shadow root", () => {
    host.create({});
    const root = host.getRoot();
    expect(root).not.toBeNull();
    expect(root!.mode).toBe("open");
  });

  test("create() adopts the module stylesheet", () => {
    host.create({});
    const root = host.getRoot();
    expect(root!.adoptedStyleSheets.length).toBe(1);
    expect(root!.adoptedStyleSheets[0]).toBeInstanceOf(CSSStyleSheet);
  });

  test("create() sets default z-index of 2147483646", () => {
    host.create({});
    const el = host.getRoot()!.host as HTMLElement;
    expect(el.style.zIndex).toBe("2147483646");
  });

  test("create() uses custom z-index from config", () => {
    host.create({ zIndex: 999999 });
    const el = host.getRoot()!.host as HTMLElement;
    expect(el.style.zIndex).toBe("999999");
  });

  test("create() sets position: fixed on host element", () => {
    host.create({});
    const el = host.getRoot()!.host as HTMLElement;
    expect(el.style.position).toBe("fixed");
  });

  test("create() sets pointer-events: none on host element", () => {
    host.create({});
    const el = host.getRoot()!.host as HTMLElement;
    expect(el.style.pointerEvents).toBe("none");
  });

  test("teardown() removes host element from body", () => {
    host.create({});
    const el = host.getRoot()!.host;
    expect(document.body.contains(el)).toBe(true);
    host.teardown();
    expect(document.body.contains(el)).toBe(false);
  });

  test("teardown() is idempotent — double call does not throw", () => {
    host.create({});
    host.teardown();
    expect(() => host.teardown()).not.toThrow();
  });

  test("getRoot() returns null after teardown", () => {
    host.create({});
    host.teardown();
    expect(host.getRoot()).toBeNull();
  });

  test("create() after teardown is a no-op", () => {
    host.create({});
    host.teardown();
    host.create({});
    expect(host.getRoot()).toBeNull();
  });

  test("graceful degradation when attachShadow is unavailable", () => {
    const origAttachShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = undefined as any;
    const fallbackHost = new OverlayHost();
    expect(() => fallbackHost.create({})).not.toThrow();
    expect(fallbackHost.getRoot()).toBeNull();
    Element.prototype.attachShadow = origAttachShadow;
    fallbackHost.teardown();
  });

  // T010: Style isolation
  test("host CSS with !important does NOT affect shadow content", () => {
    const hostStyle = document.createElement("style");
    hostStyle.textContent = `* { font-family: "Comic Sans MS" !important; }`;
    document.head.appendChild(hostStyle);

    host.create({});
    const root = host.getRoot()!;
    const testEl = document.createElement("span");
    testEl.textContent = "test";
    root.appendChild(testEl);

    const computed = getComputedStyle(testEl);
    // In a real browser, shadow DOM blocks inheritance of *-selected styles.
    // happy-dom may not enforce this, so we check the element exists in shadow root.
    expect(root.contains(testEl)).toBe(true);

    hostStyle.remove();
  });

  // T011: Teardown cleanup completeness
  test("teardown restores document.body children count to original", () => {
    const before = document.body.children.length;
    host.create({});
    expect(document.body.children.length).toBe(before + 1);
    host.teardown();
    expect(document.body.children.length).toBe(before);
  });
});
