# Quickstart: Mapper Module

**Branch**: `001-mapper` | **Date**: 2026-02-10

## Prerequisites

- Bun installed (for running/testing)
- Repository cloned, on `001-mapper` branch
- `bun install` completed

## Development Server

```bash
bun run dev
```

Opens `http://localhost:3000/test-pages/messy-app.html` with Vite HMR. The overlay script is loaded via `<script type="module" src="/src/index.ts">`.

## Running Tests

```bash
# Unit tests (Vitest + happy-dom)
bun run test

# Watch mode
bun run test:watch

# E2E tests (Playwright — requires dev server running)
bun run test:e2e

# Type check only
bun run lint
```

## Project Layout

```
src/
├── index.ts                    # Public API re-exports
└── mapper/
    ├── index.ts                # Mapper class
    ├── types.ts                # All type definitions
    ├── selector-generator.ts   # Tiered selector generation
    ├── dynamic-id-detector.ts  # Dynamic ID classification
    ├── state-key.ts            # StateKey generation
    ├── page-fingerprint.ts     # Semantic anchor hashing (FNV-1a)
    ├── dom-observer.ts         # MutationObserver + rAF debounce
    └── *.test.ts               # Co-located unit tests
```

## Usage Example

```ts
import { Mapper } from "./mapper";
import type { SelectorResult, StateChangeEvent } from "./mapper/types";

// Initialize with default config (URL-based StateKeys)
const mapper = new Mapper();

// Or with fingerprinting and custom denylist
const mapper = new Mapper({
  useFingerprinting: true,
  dynamicIdDenylist: ["^section-\\d+$"],
  dynamicIdAllowlist: ["^app-header$"],
});

// Generate a selector for an element
const element = document.getElementById("save-btn")!;
const result: SelectorResult = mapper.generateSelector(element);
// result.selector: "#save-btn"
// result.tier: SelectorTier.ID
// result.ambiguous: false

// Generate a StateKey
const stateKey = mapper.generateStateKey(result.selector);
// "http://localhost:3000/test-pages/messy-app.html::#save-btn"

// Observe DOM for state changes
mapper.on("state-change", (event: StateChangeEvent) => {
  console.log("State changed:", event.previousStateKey, "→", event.newStateKey);
});
mapper.observe();

// Teardown when done
mapper.teardown();
```

## Key Implementation Notes

1. **Test-first**: Write tests before implementation (Constitution §IX). Each module file has a co-located `.test.ts` file.
2. **Try-catch everything**: All host DOM reads must be wrapped in try-catch (FR-010). Errors are silenced.
3. **Read-only**: The mapper never mutates the host DOM (FR-011). No attribute writes, no style changes, no element creation in the host document.
4. **Performance budget**: Selector generation must complete in <5ms per element (FR-013). Benchmark against `messy-app.html`.
5. **Zero dependencies**: No runtime npm packages. All logic is self-contained TypeScript.

## Build

```bash
bun run build
```

Produces `dist/index.js` (ESM), `dist/index.cjs` (CJS), and `dist/index.d.ts` (types) via tsup.
