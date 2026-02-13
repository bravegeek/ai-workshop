# Quickstart: Telemetry Module

**Branch**: `002-telemetry` | **Date**: 2026-02-12

## Prerequisites

- Bun installed (for running/testing)
- Repository cloned, on `002-telemetry` branch
- `bun install` completed
- Mapper module implemented (001-mapper) — telemetry consumes its types

## Development Server

```bash
bun run dev
```

Opens `http://localhost:3000/test-pages/messy-app.html` with Vite HMR. Both Mapper and Telemetry modules are loaded via `<script type="module" src="/src/index.ts">`.

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
├── index.ts                           # Public API re-exports (mapper + telemetry)
└── telemetry/
    ├── index.ts                       # Telemetry class
    ├── types.ts                       # TransitionPacket, FrequencyEntry, TelemetryProvider, etc.
    ├── local-storage-provider.ts      # LocalStorageProvider (aggregate, evict, fallback)
    └── *.test.ts                      # Co-located unit tests
```

## Usage Example

```ts
import { Telemetry } from "./telemetry";
import { ActionType } from "./telemetry/types";
import type { FrequencyEntry } from "./telemetry/types";
import type { StateKey, NormalizedSelector } from "./mapper/types";

// Initialize with defaults (LocalStorageProvider, 1MB cap)
const telemetry = new Telemetry();

// Or with custom config
const telemetry = new Telemetry({
  storageCap: 512 * 1024,           // 512KB
  namespace: "my-app:telemetry",
});

// Record an interaction (typically called by the orchestration layer
// when the Mapper emits an enriched event)
telemetry.record(
  "https://app.example.com/customer::#save-btn" as StateKey,
  "input[name=\"ref_code\"]" as NormalizedSelector,
  ActionType.FOCUS,
);

// Query frequency data for a state
const entries: FrequencyEntry[] = telemetry.query(
  "https://app.example.com/customer::#save-btn" as StateKey,
);
// entries: [{ selector: "input[name=\"ref_code\"]", count: 5, avgDwellTime: 1200, lastSeenTimestamp: ... }]

// Swap to a different provider at runtime
import { someBeaconProvider } from "./some-future-provider";
telemetry.swapProvider(someBeaconProvider);  // flushes old provider first

// Clear all data
telemetry.flush();

// Teardown when done
telemetry.teardown();
```

## Wiring with Mapper

```ts
import { Mapper } from "./mapper";
import { Telemetry } from "./telemetry";
import { ActionType } from "./telemetry/types";

const mapper = new Mapper();
const telemetry = new Telemetry();

// The orchestration layer (future integration module) connects them:
// 1. Listen for user interactions on the host DOM
// 2. Ask the Mapper for normalized selector + StateKey
// 3. Pass to Telemetry for recording
//
// Telemetry itself has NO DOM coupling — it only receives data.
```

## Key Implementation Notes

1. **Test-first**: Write tests before implementation (Constitution §IX). Each module file has a co-located `.test.ts` file.
2. **Try-catch everything**: All provider operations must be wrapped in try-catch (FR-009). Errors are silenced.
3. **No DOM access**: Telemetry is a pure data pipeline. It receives events from the Mapper, never touches the DOM.
4. **Aggregate-on-write**: `record()` updates frequency counters, not raw packet storage. This makes `query()` a trivial map lookup.
5. **Zero dependencies**: No runtime npm packages. All logic is self-contained TypeScript.
6. **Schema versioning**: The localStorage envelope includes a `v` field for forward-compatible migration.

## Build

```bash
bun run build
```

Produces `dist/index.js` (ESM), `dist/index.cjs` (CJS), and `dist/index.d.ts` (types) via tsup. Telemetry exports are included alongside Mapper exports.
