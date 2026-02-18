import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { update } from "./mini-map.js";
import type { Suggestion } from "./types.js";
import { SuggestionSource } from "../engine/types.js";

function makeSuggestion(overrides: Partial<Suggestion> = {}): Suggestion {
  return {
    selector: "#btn" as any,
    label: "Next Step",
    confidence: 0.9,
    source: SuggestionSource.CURATED,
    avgDwellTime: 1200,
    ...overrides,
  };
}

describe("MiniMap", () => {
  let host: HTMLDivElement;
  let root: ShadowRoot;
  let controller: AbortController;
  let onSelect: (s: Suggestion) => void;

  beforeEach(() => {
    host = document.createElement("div");
    root = host.attachShadow({ mode: "open" });
    controller = new AbortController();
    onSelect = vi.fn<(s: Suggestion) => void>();
  });

  afterEach(() => {
    controller.abort();
  });

  test("update() renders a .lob-minimap panel with correct number of entries", () => {
    const suggestions = [
      makeSuggestion({ label: "Step 1" }),
      makeSuggestion({ label: "Step 2" }),
      makeSuggestion({ label: "Step 3" }),
    ];

    update(suggestions, root, onSelect, controller.signal);

    const panel = root.querySelector(".lob-minimap");
    expect(panel).not.toBeNull();

    const entries = panel!.querySelectorAll('[role="listitem"]');
    expect(entries.length).toBe(3);
  });

  test("each entry displays label text and source indicator (curated = ★)", () => {
    const suggestions = [
      makeSuggestion({ label: "Curated Step", source: SuggestionSource.CURATED }),
    ];

    update(suggestions, root, onSelect, controller.signal);

    const entry = root.querySelector('[role="listitem"]')!;
    expect(entry.textContent).toContain("Curated Step");
    expect(entry.textContent).toContain("\u2605"); // ★
  });

  test("each entry displays label text and source indicator (predicted = ◆)", () => {
    const suggestions = [
      makeSuggestion({ label: "Predicted Step", source: SuggestionSource.PREDICTED }),
    ];

    update(suggestions, root, onSelect, controller.signal);

    const entry = root.querySelector('[role="listitem"]')!;
    expect(entry.textContent).toContain("Predicted Step");
    expect(entry.textContent).toContain("\u25C6"); // ◆
  });

  test("clicking an entry calls onSelect with the clicked suggestion", () => {
    const suggestion = makeSuggestion({ label: "Clickable" });
    update([suggestion], root, onSelect, controller.signal);

    const entry = root.querySelector('[role="listitem"]') as HTMLElement;
    entry.click();

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(suggestion);
  });

  test("panel hides (removes from DOM) when suggestions array is empty", () => {
    // First render with suggestions
    update([makeSuggestion()], root, onSelect, controller.signal);
    expect(root.querySelector(".lob-minimap")).not.toBeNull();

    // Then update with empty array
    update([], root, onSelect, controller.signal);
    expect(root.querySelector(".lob-minimap")).toBeNull();
  });

  test('panel has role="complementary" and aria-label="Navigation suggestions"', () => {
    update([makeSuggestion()], root, onSelect, controller.signal);

    const panel = root.querySelector(".lob-minimap") as HTMLElement;
    expect(panel.getAttribute("role")).toBe("complementary");
    expect(panel.getAttribute("aria-label")).toBe("Navigation suggestions");
  });

  test('entry list has role="list"', () => {
    update([makeSuggestion()], root, onSelect, controller.signal);

    const list = root.querySelector('[role="list"]');
    expect(list).not.toBeNull();
  });

  test('entries have role="listitem" and tabindex="0"', () => {
    update([makeSuggestion(), makeSuggestion()], root, onSelect, controller.signal);

    const entries = root.querySelectorAll('[role="listitem"]');
    expect(entries.length).toBe(2);
    for (const entry of entries) {
      expect(entry.getAttribute("tabindex")).toBe("0");
    }
  });

  test("Enter key on focused entry triggers onSelect", () => {
    const suggestion = makeSuggestion({ label: "Enter Test" });
    update([suggestion], root, onSelect, controller.signal);

    const entry = root.querySelector('[role="listitem"]') as HTMLElement;
    const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
    entry.dispatchEvent(event);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(suggestion);
  });

  test("Space key on focused entry triggers onSelect", () => {
    const suggestion = makeSuggestion({ label: "Space Test" });
    update([suggestion], root, onSelect, controller.signal);

    const entry = root.querySelector('[role="listitem"]') as HTMLElement;
    const event = new KeyboardEvent("keydown", { key: " ", bubbles: true });
    entry.dispatchEvent(event);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(suggestion);
  });

  test("panel anchors to default bottom-right corner", () => {
    update([makeSuggestion()], root, onSelect, controller.signal);

    const panel = root.querySelector(".lob-minimap") as HTMLElement;
    expect(panel.style.bottom).toBe("16px");
    expect(panel.style.right).toBe("16px");
  });

  test('panel anchors to custom corner (e.g. "top-left")', () => {
    update([makeSuggestion()], root, onSelect, controller.signal, "top-left");

    const panel = root.querySelector(".lob-minimap") as HTMLElement;
    expect(panel.style.top).toBe("16px");
    expect(panel.style.left).toBe("16px");
  });

  test("collapse toggle button exists with role and aria-label", () => {
    update([makeSuggestion()], root, onSelect, controller.signal);

    const toggle = root.querySelector('[role="button"]') as HTMLElement;
    expect(toggle).not.toBeNull();
    expect(toggle.getAttribute("aria-label")).toBe("Collapse suggestions");
  });

  test("collapse toggle toggles collapsed class on panel", () => {
    update([makeSuggestion()], root, onSelect, controller.signal);

    const panel = root.querySelector(".lob-minimap") as HTMLElement;
    const toggle = root.querySelector('[role="button"]') as HTMLElement;

    expect(panel.classList.contains("collapsed")).toBe(false);
    toggle.click();
    expect(panel.classList.contains("collapsed")).toBe(true);
    expect(toggle.textContent).toBe("+");
    toggle.click();
    expect(panel.classList.contains("collapsed")).toBe(false);
    expect(toggle.textContent).toBe("\u2212");
  });

  test("teardown removes panel from shadow root (via abort signal)", () => {
    update([makeSuggestion()], root, onSelect, controller.signal);
    expect(root.querySelector(".lob-minimap")).not.toBeNull();

    controller.abort();
    expect(root.querySelector(".lob-minimap")).toBeNull();
  });
});
