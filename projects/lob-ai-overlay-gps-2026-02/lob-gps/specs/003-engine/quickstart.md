# Quickstart: Engine Module

**Branch**: `003-engine` | **Date**: 2026-02-13

## Prerequisites

- Bun installed (for running/testing)
- Repository cloned, on `003-engine` branch
- `bun install` completed
- Mapper module (001) and Telemetry module (002) implemented

## Running Tests

```bash
# Unit tests (Vitest — no DOM environment needed)
bun run test

# Watch mode
bun run test:watch

# Type check only
bun run lint
```

No Playwright/e2e tests are needed for this module. The engine is pure computation with zero DOM access.

## Project Layout

```
src/
├── index.ts                    # Public API re-exports
└── engine/
    ├── index.ts                # Engine class (public API)
    ├── types.ts                # Suggestion, CuratedPath, CuratedStep, EngineConfig
    ├── ranker.ts               # Frequency ranking + tie-breaking
    ├── curated.ts              # Curated path indexing + step resolution
    ├── labels.ts               # Label generation (tiered templates)
    ├── merger.ts               # Curated/predicted merge + dedup + truncation
    └── *.test.ts               # Co-located unit tests
```

## Usage Example

```ts
import { Engine } from "./engine";
import type { Suggestion } from "./engine/types";
import type { TelemetryProvider } from "../telemetry/types";

// The engine needs a TelemetryProvider (from the Telemetry module)
const telemetry: TelemetryProvider = /* your provider instance */;

// Initialize with defaults (max 3 suggestions, no curated paths)
const engine = new Engine({ telemetryProvider: telemetry });

// Or with curated paths and error callback
const engine = new Engine({
  telemetryProvider: telemetry,
  maxSuggestions: 5,
  curatedPaths: [
    {
      id: "onboarding-flow",
      name: "New Customer Onboarding",
      steps: [
        { stateKey: "https://app.example.com/::..." as any, targetSelector: "#account-id" as any, label: "Step 1: Enter Account ID", stepNumber: 1 },
        { stateKey: "https://app.example.com/::#account-id" as any, targetSelector: "#save-btn" as any, label: "Step 2: Save", stepNumber: 2 },
        { stateKey: "https://app.example.com/::#save-btn" as any, targetSelector: "#finalize-btn" as any, label: "Step 3: Finalize", stepNumber: 3 },
      ],
    },
  ],
  onError: (err) => console.warn("[LobGPS Engine]", err.message),
});

// Query for suggestions at a given StateKey
const stateKey = "https://app.example.com/::#account-id" as any;
const suggestions: Suggestion[] = engine.query(stateKey);

// suggestions[0]:
// {
//   selector: "#save-btn",
//   label: "Step 2: Save",
//   confidence: 1.0,
//   source: "curated",
//   avgDwellTime: 0,
//   curatedPathId: "onboarding-flow",
// }
```

## Key Implementation Notes

1. **Test-first**: Write tests before implementation (Constitution §IX). Each module file has a co-located `.test.ts` file.
2. **No DOM**: The engine has zero DOM access (FR-013). All tests are pure unit tests — no happy-dom, no jsdom, no Playwright.
3. **Try-catch everything**: The top-level `query()` is wrapped in try-catch. Errors go to `onError` callback, then return `[]` (FR-015).
4. **Stateless**: Each `query()` call is independent. The engine caches nothing between calls.
5. **Zero dependencies**: No runtime npm packages. All logic is self-contained TypeScript.
6. **Performance budget**: Full query cycle must complete in <50ms (FR-014). With pure computation on small arrays, this is trivial but must be benchmarked.

## Build

```bash
bun run build
```

Produces `dist/index.js` (ESM), `dist/index.cjs` (CJS), and `dist/index.d.ts` (types) via tsup.
