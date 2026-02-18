import { describe, test, expect, vi } from "vitest";
import { parseCombo, matchesEvent, attach } from "./kill-switch.js";
import type { KillSwitchDescriptor } from "./types.js";

// ─── parseCombo ────────────────────────────────────────────────────────────────

describe("parseCombo", () => {
  test("parses Ctrl+Shift+K into full descriptor", () => {
    const result = parseCombo("Ctrl+Shift+K");
    expect(result).toEqual<KillSwitchDescriptor>({
      ctrl: true,
      shift: true,
      alt: false,
      meta: false,
      key: "K",
    });
  });

  test("parses Ctrl+Alt+G into full descriptor", () => {
    const result = parseCombo("Ctrl+Alt+G");
    expect(result).toEqual<KillSwitchDescriptor>({
      ctrl: true,
      shift: false,
      alt: true,
      meta: false,
      key: "G",
    });
  });

  test("parses Meta+Shift+X into full descriptor", () => {
    const result = parseCombo("Meta+Shift+X");
    expect(result).toEqual<KillSwitchDescriptor>({
      ctrl: false,
      shift: true,
      alt: false,
      meta: true,
      key: "X",
    });
  });

  test("is case-insensitive: ctrl+shift+k equals Ctrl+Shift+K", () => {
    const lower = parseCombo("ctrl+shift+k");
    const upper = parseCombo("Ctrl+Shift+K");
    expect(lower).toEqual(upper);
  });

  test("parses single modifier with key: Ctrl+K", () => {
    const result = parseCombo("Ctrl+K");
    expect(result).toEqual<KillSwitchDescriptor>({
      ctrl: true,
      shift: false,
      alt: false,
      meta: false,
      key: "K",
    });
  });
});

// ─── matchesEvent ──────────────────────────────────────────────────────────────

describe("matchesEvent", () => {
  test("returns true when event exactly matches descriptor", () => {
    const descriptor = parseCombo("Ctrl+Shift+K");
    const event = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      shiftKey: true,
      altKey: false,
      metaKey: false,
      bubbles: true,
    });
    expect(matchesEvent(descriptor, event)).toBe(true);
  });

  test("returns false when a required modifier is missing", () => {
    const descriptor = parseCombo("Ctrl+Shift+K");
    // Missing shiftKey — event only has ctrl
    const event = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      bubbles: true,
    });
    expect(matchesEvent(descriptor, event)).toBe(false);
  });

  test("returns false when key does not match", () => {
    const descriptor = parseCombo("Ctrl+Shift+K");
    const event = new KeyboardEvent("keydown", {
      key: "j",
      ctrlKey: true,
      shiftKey: true,
      altKey: false,
      metaKey: false,
      bubbles: true,
    });
    expect(matchesEvent(descriptor, event)).toBe(false);
  });

  test("returns false when event has an extra modifier not in descriptor", () => {
    // Descriptor only requires Ctrl+Shift+K but event also has alt
    const descriptor = parseCombo("Ctrl+Shift+K");
    const event = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      shiftKey: true,
      altKey: true,
      metaKey: false,
      bubbles: true,
    });
    expect(matchesEvent(descriptor, event)).toBe(false);
  });

  test("is case-insensitive: event.key 'k' matches descriptor key 'K'", () => {
    const descriptor = parseCombo("Ctrl+K");
    const event = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      bubbles: true,
    });
    expect(matchesEvent(descriptor, event)).toBe(true);
  });
});

// ─── attach ────────────────────────────────────────────────────────────────────

describe("attach", () => {
  test("calls callback when matching keydown event fires on document", () => {
    const descriptor = parseCombo("Ctrl+Shift+K");
    const callback = vi.fn();
    const controller = new AbortController();

    attach(descriptor, callback, controller.signal);

    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: true,
        shiftKey: true,
        altKey: false,
        metaKey: false,
        bubbles: true,
      })
    );

    expect(callback).toHaveBeenCalledTimes(1);
    controller.abort();
  });

  test("does not call callback for non-matching keydown event", () => {
    const descriptor = parseCombo("Ctrl+Shift+K");
    const callback = vi.fn();
    const controller = new AbortController();

    attach(descriptor, callback, controller.signal);

    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "g",
        ctrlKey: true,
        shiftKey: true,
        altKey: false,
        metaKey: false,
        bubbles: true,
      })
    );

    expect(callback).not.toHaveBeenCalled();
    controller.abort();
  });

  test("calls preventDefault on matching event", () => {
    const descriptor = parseCombo("Ctrl+Shift+K");
    const callback = vi.fn();
    const controller = new AbortController();

    attach(descriptor, callback, controller.signal);

    const event = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      shiftKey: true,
      altKey: false,
      metaKey: false,
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    document.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
    controller.abort();
  });

  test("listener is removed after AbortController is aborted", () => {
    const descriptor = parseCombo("Ctrl+Shift+K");
    const callback = vi.fn();
    const controller = new AbortController();

    attach(descriptor, callback, controller.signal);
    controller.abort();

    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: true,
        shiftKey: true,
        altKey: false,
        metaKey: false,
        bubbles: true,
      })
    );

    expect(callback).not.toHaveBeenCalled();
  });

  test("uses capture phase when adding the event listener", () => {
    const descriptor = parseCombo("Ctrl+Shift+K");
    const callback = vi.fn();
    const controller = new AbortController();

    const addEventListenerSpy = vi.spyOn(document, "addEventListener");

    attach(descriptor, callback, controller.signal);

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
      expect.objectContaining({ capture: true })
    );

    addEventListenerSpy.mockRestore();
    controller.abort();
  });
});
