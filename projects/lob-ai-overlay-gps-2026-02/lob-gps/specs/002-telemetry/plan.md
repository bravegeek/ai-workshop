# Implementation Plan: Telemetry Module

**Branch**: `002-telemetry` | **Date**: 2026-02-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-telemetry/spec.md`

## Summary

The Telemetry module is a pure data pipeline that receives enriched interaction events from the Mapper, creates TransitionPackets, and delegates storage to a provider. It uses an aggregate-on-write model: `record()` updates frequency counters in a `{stateKey → {selector → {count, avgDwellTime, lastSeenTimestamp}}}` map rather than storing individual packets. The default `LocalStorageProvider` persists this map under a namespaced `localStorage` key with LRU eviction, corruption recovery, and in-memory fallback. The `query()` interface returns `FrequencyEntry[]` sorted by count descending, consumed by the Engine for suggestion ranking.

## Technical Context

**Language/Version**: TypeScript (Strict mode), targeting ESNext
**Primary Dependencies**: Zero runtime dependencies (Constitution §VII). Dev: Vitest, Playwright, tsup, Vite, happy-dom.
**Storage**: `localStorage` under namespaced key `lob-gps:telemetry` (Constitution §Tech Constraints). In-memory `Map` fallback when unavailable.
**Testing**: Vitest (unit, happy-dom environment) + Playwright (Chromium/Firefox/WebKit e2e against `messy-app.html`)
**Target Platform**: Modern evergreen browsers (`localStorage`, `performance.now()`, `JSON.parse/stringify` required)
**Project Type**: Single library — ESM/CJS dual bundles via tsup
**Performance Goals**: `record()` and `query()` must not block the UI thread. Aggregate-on-write makes both O(1) per StateKey→selector pair. Target: <5ms per `record()`, <10ms per `query()`.
**Constraints**: No DOM coupling (telemetry is a pure data pipeline per clarification Q2), try-catch all provider errors (FR-009), 1MB default storage cap (FR-013)
**Scale/Scope**: 1MB cap ≈ ~5,000 aggregated entries at ~200 bytes each. Sufficient for tens of thousands of unique state→action pairs across sessions.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| §I Shadow DOM Isolation | Telemetry has no UI and no DOM access — pure data pipeline | PASS |
| §VII Strict TypeScript & Minimal Overhead | TypeScript strict mode; zero runtime dependencies | PASS |
| §VIII Performance | Aggregate-on-write is O(1) per record; <5ms target fits within 50ms total budget | PASS |
| §IX Test-First Reliability | Vitest + Playwright; spec mandates 100% unit coverage (SC-006) | PASS |
| §X Fail-Safe Resilience | FR-009 mandates try-catch on all provider errors; telemetry failures never affect host | PASS |
| §XII Determinism & Normalization | Aggregate map is deterministic; query returns frequency-sorted results | PASS |
| §XIII.1 Transition Packet Schema | FR-001 defines exact fields: stateKey, normalizedSelector, actionType, dwellTime, timestamp, sessionId | PASS |
| §XIII.2 Data Prohibitions | FR-002 prohibits input values, clipboard, innerText | PASS |
| §XIII.3 Provider Architecture | FR-003 defines TelemetryProvider with record/query/flush | PASS |
| Tech: localStorage | FR-004 mandates LocalStorageProvider as default under namespaced key | PASS |
| Tech: tsup build | Same build config as mapper; telemetry exports added to `src/index.ts` | PASS |
| Tech: Read-only host DOM | Telemetry has no DOM access at all (enforced by architecture, not just convention) | PASS |

**Gate result**: ALL PASS. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/002-telemetry/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── telemetry.ts     # TypeScript interface definitions
├── checklists/
│   └── requirements.md  # Pre-existing quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── index.ts                           # Public API re-exports (add telemetry exports)
├── mapper/                            # Pre-existing (001-mapper)
│   └── ...
├── telemetry/
│   ├── index.ts                       # Telemetry class (public API: init, record, query, flush, swap provider)
│   ├── types.ts                       # TransitionPacket, FrequencyEntry, TelemetryProvider, TelemetryConfig, ActionType
│   ├── local-storage-provider.ts      # LocalStorageProvider (aggregate map, serialization, eviction, corruption recovery, in-memory fallback)
│   ├── index.test.ts                  # Telemetry module tests (packet creation, dwell computation, provider delegation, error silencing)
│   ├── types.test.ts                  # TransitionPacket schema validation tests (prohibited fields, required fields)
│   └── local-storage-provider.test.ts # Provider tests (persistence, eviction, corruption, fallback, flush, namespacing)

test/
└── e2e/
    ├── mapper.spec.ts                 # Pre-existing
    └── telemetry.spec.ts              # Playwright e2e: record interactions on messy-app.html, reload, verify query results
```

**Structure Decision**: Follows established single-project library layout from 001-mapper. The `src/telemetry/` directory contains all telemetry logic with co-located unit tests. E2E tests in `test/e2e/`. The Telemetry module has no DOM coupling — it receives events programmatically from the Mapper, so e2e tests wire the two modules together against `messy-app.html`.

## Complexity Tracking

No constitution violations detected. This table is intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |
