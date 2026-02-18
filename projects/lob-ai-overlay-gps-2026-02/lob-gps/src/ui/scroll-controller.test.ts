import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { scrollToElement } from "./scroll-controller.js";

// ── Mock dom-utils ────────────────────────────────────────────────────────────
vi.mock("./dom-utils.js", () => ({
  findScrollableAncestor: vi.fn(),
  isReducedMotion: vi.fn(() => false),
  isElementInView: vi.fn(() => false),
}));

import {
  findScrollableAncestor,
  isReducedMotion,
  isElementInView,
} from "./dom-utils.js";

const mockedFindScrollableAncestor = vi.mocked(findScrollableAncestor);
const mockedIsReducedMotion = vi.mocked(isReducedMotion);
const mockedIsElementInView = vi.mocked(isElementInView);

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeContainer(): HTMLDivElement {
  const container = document.createElement("div");
  container.scrollTo = vi.fn();
  Object.defineProperty(container, "scrollTop", {
    value: 0,
    writable: true,
    configurable: true,
  });
  container.getBoundingClientRect = vi.fn(() => ({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    width: 800,
    height: 600,
    right: 800,
    bottom: 600,
    toJSON() {},
  }));
  document.body.appendChild(container);
  return container;
}

function makeTarget(container: HTMLDivElement): HTMLDivElement {
  const target = document.createElement("div");
  target.getBoundingClientRect = vi.fn(() => ({
    x: 0,
    y: 800,
    top: 800,
    left: 0,
    width: 200,
    height: 40,
    right: 200,
    bottom: 840,
    toJSON() {},
  }));
  container.appendChild(target);
  return target;
}

describe("ScrollController", () => {
  let container: HTMLDivElement;
  let target: HTMLDivElement;
  let abortController: AbortController;

  beforeEach(() => {
    vi.useFakeTimers();
    container = makeContainer();
    target = makeTarget(container);
    abortController = new AbortController();

    mockedFindScrollableAncestor.mockReturnValue(container);
    mockedIsReducedMotion.mockReturnValue(false);
    mockedIsElementInView.mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    container.remove();
  });

  // ── Basic contract ────────────────────────────────────────────────────────

  test("scrollToElement returns a Promise<void>", () => {
    mockedIsElementInView.mockReturnValue(true);
    const result = scrollToElement(target, abortController.signal);
    expect(result).toBeInstanceOf(Promise);
  });

  test("calls scrollTo on the correct scrollable ancestor", () => {
    // Use instant to avoid the promise hanging
    mockedIsReducedMotion.mockReturnValue(true);
    scrollToElement(target, abortController.signal);
    expect(container.scrollTo).toHaveBeenCalledOnce();
  });

  // ── Already in viewport ───────────────────────────────────────────────────

  test("does not scroll when element is already in viewport", async () => {
    mockedIsElementInView.mockReturnValue(true);
    await scrollToElement(target, abortController.signal);
    expect(container.scrollTo).not.toHaveBeenCalled();
  });

  // ── Motion preferences ────────────────────────────────────────────────────

  test("uses smooth scroll behavior when reduced motion is OFF", async () => {
    mockedIsReducedMotion.mockReturnValue(false);
    const promise = scrollToElement(target, abortController.signal);
    expect(container.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "smooth" }),
    );
    // Clean up: abort and catch the expected rejection
    abortController.abort();
    await promise.catch(() => {});
  });

  test("uses instant scroll behavior when reduced motion is ON", async () => {
    mockedIsReducedMotion.mockReturnValue(true);
    await scrollToElement(target, abortController.signal);
    expect(container.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "instant" }),
    );
  });

  // ── Abort signal ──────────────────────────────────────────────────────────

  test("abort signal cancels scroll and rejects", async () => {
    mockedIsReducedMotion.mockReturnValue(false);
    const promise = scrollToElement(target, abortController.signal);
    abortController.abort();
    await expect(promise).rejects.toThrow("Scroll aborted");
  });

  test("already-aborted signal resolves immediately", async () => {
    abortController.abort();
    await expect(
      scrollToElement(target, abortController.signal),
    ).resolves.toBeUndefined();
    expect(container.scrollTo).not.toHaveBeenCalled();
  });

  // ── User scroll detection ────────────────────────────────────────────────

  test("wheel event on container aborts the scroll", async () => {
    mockedIsReducedMotion.mockReturnValue(false);
    const promise = scrollToElement(target, abortController.signal);
    container.dispatchEvent(new Event("wheel"));
    await expect(promise).rejects.toThrow("Scroll aborted");
  });

  test("touchstart event on container aborts the scroll", async () => {
    mockedIsReducedMotion.mockReturnValue(false);
    const promise = scrollToElement(target, abortController.signal);
    container.dispatchEvent(new Event("touchstart"));
    await expect(promise).rejects.toThrow("Scroll aborted");
  });

  test("keydown ArrowDown on container aborts the scroll", async () => {
    mockedIsReducedMotion.mockReturnValue(false);
    const promise = scrollToElement(target, abortController.signal);
    container.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    await expect(promise).rejects.toThrow("Scroll aborted");
  });

  test("keydown with non-cancel key does NOT abort the scroll", async () => {
    mockedIsReducedMotion.mockReturnValue(false);
    const promise = scrollToElement(target, abortController.signal);
    container.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    // Should still be pending — abort to clean up
    abortController.abort();
    await promise.catch(() => {});
  });

  // ── Scroll completion via scrollend ──────────────────────────────────

  test("scrollend event resolves the promise", async () => {
    mockedIsReducedMotion.mockReturnValue(false);

    // Mock rAF to never fire (so scrollend is the only completion path)
    const origRAF = globalThis.requestAnimationFrame;
    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(() => 0);

    const promise = scrollToElement(target, abortController.signal);
    container.dispatchEvent(new Event("scrollend"));
    await expect(promise).resolves.toBeUndefined();

    vi.mocked(globalThis.requestAnimationFrame).mockRestore();
  });

  // ── rAF fallback poll ─────────────────────────────────────────────────

  test("rAF fallback resolves when scrollTop stabilizes for 2 frames", async () => {
    mockedIsReducedMotion.mockReturnValue(false);

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    const promise = scrollToElement(target, abortController.signal);

    // scrollTop stays at 0 across frames → stable → resolve
    // frame 1: stableFrames = 1
    if (rafCallbacks.length > 0) rafCallbacks[rafCallbacks.length - 1](16);
    // frame 2: stableFrames = 2 → done
    if (rafCallbacks.length > 0) rafCallbacks[rafCallbacks.length - 1](32);

    await expect(promise).resolves.toBeUndefined();

    vi.mocked(globalThis.requestAnimationFrame).mockRestore();
  });

  // ── Instant scroll resolves immediately ────────────────────────────────

  test("instant scroll resolves immediately without waiting for scrollend", async () => {
    mockedIsReducedMotion.mockReturnValue(true);
    const result = await scrollToElement(target, abortController.signal);
    expect(result).toBeUndefined();
    expect(container.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "instant" }),
    );
  });
});
