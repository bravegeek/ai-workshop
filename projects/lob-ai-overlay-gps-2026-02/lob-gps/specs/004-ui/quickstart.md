# Quickstart: UI Module

**Branch**: `004-ui` | **Date**: 2026-02-17

## Prerequisites

- Bun installed (for running/testing)
- Repository cloned, on `004-ui` branch
- `bun install` completed
- Mapper module (001), Telemetry module (002), and Engine module (003) implemented

## Running Tests

```bash
# Unit tests (Vitest — happy-dom environment for DOM APIs)
bun run test

# Watch mode
bun run test:watch

# E2E tests (Playwright — visual, scroll, accessibility verification)
bun run test:e2e

# Type check only
bun run lint
```

Both Vitest (unit, with happy-dom) and Playwright (e2e against `messy-app.html`) are needed for this module. The UI interacts with real DOM for rendering and positioning.

## Project Layout

```
src/
├── index.ts                       # Public API re-exports
└── ui/
    ├── index.ts                   # OverlayUI class (public API: render, teardown)
    ├── types.ts                   # UIConfig, MiniMapAnchor, internal types
    ├── overlay-host.ts            # Shadow DOM host lifecycle
    ├── pulse-renderer.ts          # Pulse highlight animation + positioning
    ├── scroll-controller.ts       # Auto-scroll to off-screen targets
    ├── label-renderer.ts          # Micro-label positioning + flip logic
    ├── mini-map.ts                # Suggestion list panel
    ├── styles.ts                  # Constructable Stylesheet definitions
    ├── dom-utils.ts               # Shared helpers (visibility, bounding rect, scroll ancestor)
    └── *.test.ts                  # Co-located unit tests

test/
└── e2e/
    └── ui.spec.ts                 # Playwright e2e tests
```

## Usage Example

```ts
import { OverlayUI } from "./ui";
import type { Suggestion } from "../engine/types";

// Initialize with defaults
const ui = new OverlayUI();

// Or with custom config
const ui = new OverlayUI({
  zIndex: 999999,
  miniMapAnchor: "bottom-left",
  onError: (err) => console.warn("[LobGPS UI]", err.message),
});

// Render suggestions (typically called by the Integration layer)
const suggestions: Suggestion[] = [
  {
    selector: "#save-btn" as any,
    label: "Step 2: Save your changes",
    confidence: 1.0,
    source: "curated",
    avgDwellTime: 0,
    curatedPathId: "onboarding",
  },
  {
    selector: "#help-link" as any,
    label: "Frequently used (42%)",
    confidence: 0.42,
    source: "predicted",
    avgDwellTime: 1200,
  },
];

ui.render(suggestions);
// → Validates #save-btn exists and is visible
// → Auto-scrolls if off-screen
// → Renders pulse highlight over #save-btn
// → Shows micro-label "Step 2: Save your changes"
// → Updates mini-map with both suggestions

// Render again (replaces previous pulse)
ui.render(newSuggestions);

// Tear down completely
ui.teardown();
// → Removes shadow host from document.body
// → Cancels all animations and event listeners
```

## Key Implementation Notes

1. **Test-first**: Write tests before implementation (Constitution §IX). Each module file has a co-located `.test.ts` file. E2E tests in Playwright verify visual behavior against `messy-app.html`.
2. **Shadow DOM isolation**: All rendering inside an open shadow root. Host DOM is read-only — only `getBoundingClientRect()` and `getComputedStyle()` calls.
3. **Constructable Stylesheets**: Define styles via `CSSStyleSheet` objects adopted by the shadow root. No inline `<style>` fallback — all target evergreen browsers support Constructable Stylesheets.
4. **Independent error boundaries**: Each operation (pulse, scroll, label, mini-map) is wrapped in its own try-catch. A failing label doesn't block the pulse (FR-023).
5. **AbortController cleanup**: Every pulse/scroll cycle creates an `AbortController` for its event listeners. On dismiss or teardown, `abort()` is called — no manual removeEventListener tracking needed.
6. **Reduced motion**: Check `window.matchMedia('(prefers-reduced-motion: reduce)')` once per render cycle. Pulse uses static highlight, scroll uses `behavior: 'instant'`.
7. **Zero dependencies**: No runtime npm packages. All DOM interaction uses standard Web APIs.
8. **Performance budget**: Full render cycle (validate + scroll + pulse + label) must complete within 50ms (FR-014). Scroll animation is async but pulse positioning setup is synchronous.

## Build

```bash
bun run build
```

Produces `dist/index.js` (ESM), `dist/index.cjs` (CJS), and `dist/index.d.ts` (types) via tsup.
