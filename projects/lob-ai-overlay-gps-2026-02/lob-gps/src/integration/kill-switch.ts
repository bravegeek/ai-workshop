import type { KillSwitchDescriptor } from "./types.js";

const MODIFIERS = new Set(["ctrl", "shift", "alt", "meta"]);

export function parseCombo(combo: string): KillSwitchDescriptor {
  const parts = combo.split("+").map((p) => p.trim().toLowerCase());
  const modifiers = new Set(parts.filter((p) => MODIFIERS.has(p)));
  const keyPart = parts.find((p) => !MODIFIERS.has(p));

  return {
    ctrl: modifiers.has("ctrl"),
    shift: modifiers.has("shift"),
    alt: modifiers.has("alt"),
    meta: modifiers.has("meta"),
    key: (keyPart ?? "").toUpperCase(),
  };
}

export function matchesEvent(
  descriptor: KillSwitchDescriptor,
  event: KeyboardEvent,
): boolean {
  return (
    event.ctrlKey === descriptor.ctrl &&
    event.shiftKey === descriptor.shift &&
    event.altKey === descriptor.alt &&
    event.metaKey === descriptor.meta &&
    event.key.toUpperCase() === descriptor.key
  );
}

export function attach(
  descriptor: KillSwitchDescriptor,
  callback: () => void,
  signal: AbortSignal,
): void {
  document.addEventListener(
    "keydown",
    (event: KeyboardEvent) => {
      if (matchesEvent(descriptor, event)) {
        event.preventDefault();
        callback();
      }
    },
    { capture: true, signal },
  );
}
