import type { Suggestion, MiniMapAnchor } from "./types.js";
import { SuggestionSource } from "../engine/types.js";

/**
 * Renders (or removes) the MiniMap suggestion panel inside a shadow root.
 *
 * FR-023: All DOM operations are wrapped in try-catch for graceful degradation.
 */
export function update(
  suggestions: Suggestion[],
  shadowRoot: ShadowRoot,
  onSelect: (s: Suggestion) => void,
  abortSignal: AbortSignal,
  anchor?: MiniMapAnchor,
): void {
  try {
    // Remove any existing panel first
    const existing = shadowRoot.querySelector(".lob-minimap");
    if (existing) existing.remove();

    // If no suggestions, don't render
    if (suggestions.length === 0) return;

    const panel = document.createElement("div");
    panel.className = "lob-minimap";
    panel.setAttribute("role", "complementary");
    panel.setAttribute("aria-label", "Navigation suggestions");

    // ── Position ──────────────────────────────────────────────────────────
    panel.style.position = "fixed";
    const pos = anchor ?? "bottom-right";
    if (pos.startsWith("top")) {
      panel.style.top = "16px";
    } else {
      panel.style.bottom = "16px";
    }
    if (pos.endsWith("left")) {
      panel.style.left = "16px";
    } else {
      panel.style.right = "16px";
    }

    // ── Header ────────────────────────────────────────────────────────────
    const header = document.createElement("div");
    header.className = "lob-minimap-header";

    const title = document.createElement("span");
    title.textContent = "LOB GPS";
    header.appendChild(title);

    const toggle = document.createElement("button");
    toggle.setAttribute("role", "button");
    toggle.setAttribute("aria-label", "Collapse suggestions");
    toggle.textContent = "\u2212"; // minus sign
    toggle.addEventListener(
      "click",
      () => {
        const collapsed = panel.classList.toggle("collapsed");
        toggle.textContent = collapsed ? "+" : "\u2212";
      },
      { signal: abortSignal },
    );
    header.appendChild(toggle);
    panel.appendChild(header);

    // ── Entry list ────────────────────────────────────────────────────────
    const list = document.createElement("div");
    list.setAttribute("role", "list");

    for (const suggestion of suggestions) {
      const entry = document.createElement("div");
      entry.setAttribute("role", "listitem");
      entry.setAttribute("tabindex", "0");

      const icon = suggestion.source === SuggestionSource.CURATED ? "\u2605" : "\u25C6";
      const iconSpan = document.createElement("span");
      iconSpan.className = "lob-minimap-icon";
      iconSpan.textContent = icon;

      const labelSpan = document.createElement("span");
      labelSpan.className = "lob-minimap-label";
      labelSpan.textContent = suggestion.label;

      entry.appendChild(iconSpan);
      entry.appendChild(labelSpan);

      entry.addEventListener(
        "click",
        () => onSelect(suggestion),
        { signal: abortSignal },
      );

      entry.addEventListener(
        "keydown",
        (e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(suggestion);
          }
        },
        { signal: abortSignal },
      );

      list.appendChild(entry);
    }

    panel.appendChild(list);
    shadowRoot.appendChild(panel);

    // ── Teardown via abort signal ─────────────────────────────────────────
    abortSignal.addEventListener(
      "abort",
      () => {
        try {
          panel.remove();
        } catch {
          // already removed
        }
      },
      { once: true },
    );
  } catch {
    // FR-023: graceful degradation — swallow errors silently
  }
}
