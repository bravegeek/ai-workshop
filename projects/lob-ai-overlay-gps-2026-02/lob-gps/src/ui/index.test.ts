import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { OverlayUI } from "./index.js";
import type { Suggestion } from "./types.js";
import { SuggestionSource } from "../engine/types.js";

// ── Mock all child modules ──────────────────────────────────────────────────

vi.mock("./dom-utils.js", () => ({
  resolveElement: vi.fn(),
  isElementVisible: vi.fn(),
  isReducedMotion: vi.fn(() => false),
  findScrollableAncestor: vi.fn(),
  isElementInView: vi.fn(() => true),
}));

vi.mock("./pulse-renderer.js", () => ({
  pulse: vi.fn(),
}));

vi.mock("./scroll-controller.js", () => ({
  scrollToElement: vi.fn(() => Promise.resolve()),
}));

vi.mock("./label-renderer.js", () => ({
  show: vi.fn(),
}));

vi.mock("./mini-map.js", () => ({
  update: vi.fn(),
}));

import { resolveElement, isElementVisible, isElementInView } from "./dom-utils.js";
import { pulse } from "./pulse-renderer.js";
import { scrollToElement } from "./scroll-controller.js";
import { show } from "./label-renderer.js";
import { update as updateMiniMap } from "./mini-map.js";

const mockedResolveElement = vi.mocked(resolveElement);
const mockedIsElementVisible = vi.mocked(isElementVisible);
const mockedIsElementInView = vi.mocked(isElementInView);
const mockedPulse = vi.mocked(pulse);
const mockedScrollToElement = vi.mocked(scrollToElement);
const mockedShow = vi.mocked(show);
const mockedUpdateMiniMap = vi.mocked(updateMiniMap);

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeSuggestion(overrides: Partial<Suggestion> = {}): Suggestion {
  return {
    selector: "#test-btn" as any,
    label: "Test suggestion",
    confidence: 0.9,
    source: SuggestionSource.CURATED,
    avgDwellTime: 1200,
    ...overrides,
  };
}

describe("OverlayUI", () => {
  let ui: OverlayUI;
  let targetEl: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();

    targetEl = document.createElement("div");
    document.body.appendChild(targetEl);

    mockedResolveElement.mockReturnValue(targetEl);
    mockedIsElementVisible.mockReturnValue(true);
    mockedIsElementInView.mockReturnValue(true);
    mockedPulse.mockReturnValue({ dismiss: vi.fn() });
    mockedScrollToElement.mockResolvedValue(undefined);
    mockedShow.mockImplementation(() => {});
    mockedUpdateMiniMap.mockImplementation(() => {});
  });

  afterEach(() => {
    ui?.teardown();
    targetEl.remove();
  });

  // ── Constructor ─────────────────────────────────────────────────────────

  test("constructor creates OverlayHost (shadow root exists)", () => {
    ui = new OverlayUI();
    const hostEl = document.querySelector("[data-lob-gps]");
    expect(hostEl).not.toBeNull();
    expect(hostEl!.shadowRoot).not.toBeNull();
  });

  // ── render([]) — no-op ────────────────────────────────────────────────

  test("render([]) is a no-op — no pulse, no label", () => {
    ui = new OverlayUI();
    ui.render([]);
    expect(mockedPulse).not.toHaveBeenCalled();
    expect(mockedShow).not.toHaveBeenCalled();
  });

  test("render([]) updates mini-map with empty array", () => {
    ui = new OverlayUI();
    ui.render([]);
    expect(mockedUpdateMiniMap).toHaveBeenCalledTimes(1);
    const firstArg = mockedUpdateMiniMap.mock.calls[0][0];
    expect(firstArg).toEqual([]);
  });

  // ── render() validates targets ────────────────────────────────────────

  test("render() filters suggestions with non-existent targets", () => {
    ui = new OverlayUI();
    mockedResolveElement.mockReturnValue(null);

    ui.render([makeSuggestion()]);

    expect(mockedPulse).not.toHaveBeenCalled();
  });

  test("render() filters suggestions with invisible targets", () => {
    ui = new OverlayUI();
    mockedIsElementVisible.mockReturnValue(false);

    ui.render([makeSuggestion()]);

    expect(mockedPulse).not.toHaveBeenCalled();
  });

  // ── render() dismisses previous pulse (FR-019) ────────────────────────

  test("render() dismisses previous pulse before rendering new one", () => {
    ui = new OverlayUI();
    const dismissFn = vi.fn();
    mockedPulse.mockReturnValue({ dismiss: dismissFn });

    ui.render([makeSuggestion({ label: "First" })]);
    expect(dismissFn).not.toHaveBeenCalled();

    ui.render([makeSuggestion({ label: "Second" })]);
    expect(dismissFn).toHaveBeenCalledTimes(1);
  });

  // ── render() sequences scroll → pulse → label ────────────────────────

  test("render() calls pulse and label for top suggestion", () => {
    ui = new OverlayUI();

    ui.render([makeSuggestion()]);

    expect(mockedPulse).toHaveBeenCalledTimes(1);
    expect(mockedShow).toHaveBeenCalledTimes(1);
    expect(mockedShow).toHaveBeenCalledWith(
      targetEl,
      "Test suggestion",
      expect.anything(),
      expect.anything(),
    );
  });

  test("render() calls scrollToElement when target is off-screen", async () => {
    ui = new OverlayUI();
    mockedIsElementInView.mockReturnValue(false);

    ui.render([makeSuggestion()]);

    await vi.waitFor(() => {
      expect(mockedScrollToElement).toHaveBeenCalledTimes(1);
    });
  });

  test("render() does not scroll when target is already in view", () => {
    ui = new OverlayUI();
    mockedIsElementInView.mockReturnValue(true);

    ui.render([makeSuggestion()]);

    expect(mockedScrollToElement).not.toHaveBeenCalled();
  });

  // ── render() updates mini-map ─────────────────────────────────────────

  test("render() updates mini-map with all valid suggestions", () => {
    ui = new OverlayUI();

    const suggestions = [
      makeSuggestion({ label: "First" }),
      makeSuggestion({ label: "Second" }),
    ];

    ui.render(suggestions);

    expect(mockedUpdateMiniMap).toHaveBeenCalledTimes(1);
    const firstArg = mockedUpdateMiniMap.mock.calls[0][0];
    expect(firstArg).toHaveLength(2);
  });

  // ── mini-map onSelect triggers scroll + pulse ─────────────────────────

  test("mini-map onSelect callback triggers scroll+pulse for selected suggestion", () => {
    ui = new OverlayUI();

    const suggestion = makeSuggestion({ label: "Selected" });
    ui.render([suggestion]);

    // Get the onSelect callback that was passed to mini-map update
    const onSelectCb = mockedUpdateMiniMap.mock.calls[0][2];
    expect(typeof onSelectCb).toBe("function");

    // Reset mocks to track the onSelect-triggered calls
    mockedPulse.mockClear();
    mockedShow.mockClear();
    // Re-set implementations after clear
    mockedPulse.mockReturnValue({ dismiss: vi.fn() });

    // Simulate mini-map entry click
    onSelectCb(suggestion);

    expect(mockedPulse).toHaveBeenCalledTimes(1);
  });

  // ── teardown() ────────────────────────────────────────────────────────

  test("teardown() removes shadow host from document.body", () => {
    ui = new OverlayUI();
    expect(document.querySelector("[data-lob-gps]")).not.toBeNull();

    ui.teardown();
    expect(document.querySelector("[data-lob-gps]")).toBeNull();
  });

  test("teardown() is idempotent — double call does not throw", () => {
    ui = new OverlayUI();
    ui.teardown();
    expect(() => ui.teardown()).not.toThrow();
  });

  // ── render() after teardown() is a no-op ──────────────────────────────

  test("render() after teardown() is a no-op", () => {
    ui = new OverlayUI();
    ui.teardown();

    mockedPulse.mockClear();
    mockedShow.mockClear();
    mockedUpdateMiniMap.mockClear();

    ui.render([makeSuggestion()]);

    expect(mockedPulse).not.toHaveBeenCalled();
    expect(mockedShow).not.toHaveBeenCalled();
    expect(mockedUpdateMiniMap).not.toHaveBeenCalled();
  });

  // ── Error boundaries (FR-023) ─────────────────────────────────────────

  test("error in pulse rendering does not prevent label rendering", () => {
    ui = new OverlayUI();
    mockedPulse.mockImplementation(() => {
      throw new Error("Pulse error");
    });

    ui.render([makeSuggestion()]);

    expect(mockedShow).toHaveBeenCalledTimes(1);
  });

  test("error in scroll does not prevent pulse rendering", () => {
    ui = new OverlayUI();
    mockedIsElementInView.mockReturnValue(false);
    mockedScrollToElement.mockRejectedValue(new Error("Scroll error"));

    ui.render([makeSuggestion()]);

    expect(mockedPulse).toHaveBeenCalledTimes(1);
  });

  // ── onError callback ──────────────────────────────────────────────────

  test("onError callback receives caught errors", () => {
    const onError = vi.fn();
    ui = new OverlayUI({ onError });

    mockedPulse.mockImplementation(() => {
      throw new Error("Pulse broke");
    });

    ui.render([makeSuggestion()]);

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(onError.mock.calls[0][0].message).toBe("Pulse broke");
  });

  test("onError callback failure is silenced (double try-catch)", () => {
    const onError = vi.fn(() => {
      throw new Error("onError itself broke");
    });
    ui = new OverlayUI({ onError });

    mockedPulse.mockImplementation(() => {
      throw new Error("Pulse broke");
    });

    expect(() => ui.render([makeSuggestion()])).not.toThrow();
  });

  // ── mini-map onSelect with scroll ──────────────────────────────────────

  test("mini-map onSelect scrolls to off-screen target then pulses", () => {
    ui = new OverlayUI();
    mockedIsElementInView.mockReturnValue(false);

    const suggestion = makeSuggestion({ label: "Off-screen" });
    ui.render([suggestion]);

    const onSelectCb = mockedUpdateMiniMap.mock.calls[0][2];
    mockedPulse.mockClear();
    mockedScrollToElement.mockClear();
    mockedPulse.mockReturnValue({ dismiss: vi.fn() });

    onSelectCb(suggestion);

    expect(mockedScrollToElement).toHaveBeenCalledTimes(1);
    expect(mockedPulse).toHaveBeenCalledTimes(1);
  });

  test("mini-map onSelect with invalid target is a no-op", () => {
    ui = new OverlayUI();

    const suggestion = makeSuggestion({ label: "Valid" });
    ui.render([suggestion]);

    const onSelectCb = mockedUpdateMiniMap.mock.calls[0][2];
    mockedPulse.mockClear();
    mockedResolveElement.mockReturnValue(null);

    onSelectCb(suggestion);

    expect(mockedPulse).not.toHaveBeenCalled();
  });

  test("mini-map onSelect after teardown is a no-op", () => {
    ui = new OverlayUI();

    const suggestion = makeSuggestion({ label: "Will teardown" });
    ui.render([suggestion]);

    const onSelectCb = mockedUpdateMiniMap.mock.calls[0][2];
    ui.teardown();

    mockedPulse.mockClear();
    onSelectCb(suggestion);

    expect(mockedPulse).not.toHaveBeenCalled();
  });

  // ── Error in mini-map update doesn't block pulse ─────────────────────

  test("error in mini-map update does not prevent pulse rendering", () => {
    ui = new OverlayUI();
    mockedUpdateMiniMap.mockImplementation(() => {
      throw new Error("MiniMap error");
    });

    ui.render([makeSuggestion()]);

    expect(mockedPulse).toHaveBeenCalledTimes(1);
  });

  // ── onError with scroll rejection ─────────────────────────────────────

  test("onError receives scroll rejection errors", async () => {
    const onError = vi.fn();
    ui = new OverlayUI({ onError });
    mockedIsElementInView.mockReturnValue(false);
    mockedScrollToElement.mockRejectedValue(new Error("Scroll failed"));

    ui.render([makeSuggestion()]);

    // Wait for the async rejection to be caught
    await vi.waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: "Scroll failed" }));
    });
  });

  // ── Performance (T033, SC-007, FR-014) ─────────────────────────────────

  test("render() with 3 valid suggestions completes within 50ms", () => {
    ui = new OverlayUI();

    const suggestions = [
      makeSuggestion({ label: "S1" }),
      makeSuggestion({ label: "S2" }),
      makeSuggestion({ label: "S3" }),
    ];

    const start = performance.now();
    ui.render(suggestions);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(50);
  });
});
