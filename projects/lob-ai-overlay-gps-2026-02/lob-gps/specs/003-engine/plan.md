# Implementation Plan: Engine Module

**Branch**: `003-engine` | **Date**: 2026-02-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-engine/spec.md`

## Summary

The Engine module is the ranking/intelligence layer of the LOB AI Overlay GPS system. It accepts a StateKey and produces a ranked list of `Suggestion` objects by: (1) querying the TelemetryProvider for historical frequency data, (2) matching curated Golden Path steps against the current StateKey, (3) merging and deduplicating curated and predicted results with deterministic tie-breaking (Curated > Frequency > Most Recent), and (4) generating contextual "Why" labels for each suggestion. The engine is pure computation — zero DOM access, zero side effects, stateless per call — making it trivially testable with mock providers and no DOM environment.

## Technical Context

**Language/Version**: TypeScript (Strict mode), targeting ESNext
**Primary Dependencies**: Zero runtime dependencies (Constitution §VII). Dev: Vitest, tsup, Vite.
**Storage**: N/A — the engine reads from TelemetryProvider (injected), does not persist anything.
**Testing**: Vitest (unit only — no DOM environment needed, no Playwright). happy-dom NOT required.
**Target Platform**: Modern evergreen browsers (same as Mapper/Telemetry)
**Project Type**: Single library — ESM/CJS dual bundles via tsup
**Performance Goals**: <50ms full query cycle (FR-014), <50KB gzipped bundle (Constitution §Tech Constraints)
**Constraints**: Zero DOM access (FR-013), stateless (FR-001), no runtime dependencies, all errors caught (FR-015)
**Scale/Scope**: Small arrays — typical FrequencyEntry[] is <100 entries per StateKey, typical CuratedPath has <20 steps.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| §I Shadow DOM Isolation | Engine has no UI or DOM interaction | PASS (N/A) |
| §II Hybrid Guidance | FR-002/FR-003: Curated paths always outrank predicted | PASS |
| §III "Why" Layer | FR-004/FR-005: Every suggestion includes a label | PASS |
| §IV Passive Waze UX | Engine produces suggestions only; never blocks | PASS (N/A for engine) |
| §VII Strict TypeScript | TypeScript strict mode; zero runtime dependencies | PASS |
| §VIII Performance | FR-014: <50ms query cycle; pure computation on small arrays | PASS |
| §IX Test-First Reliability | Vitest with 100% coverage (SC-006); no DOM needed (SC-008) | PASS |
| §X Fail-Safe Resilience | FR-015: All errors caught → empty array + optional onError callback | PASS |
| §XII Determinism & Normalization | FR-002: Curated > Frequency > Most Recent tie-breaking | PASS |
| §XIII Telemetry Privacy | Engine reads aggregated FrequencyEntry only; never sees raw input values | PASS |
| Tech: tsup build | Part of existing tsup.config.ts (src/index.ts re-exports) | PASS |
| Tech: No DOM access | FR-013 explicitly prohibits DOM reads/writes | PASS |

**Gate result**: ALL PASS. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/003-engine/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── engine.ts        # Phase 1 output — TypeScript interface definitions
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── index.ts                  # Public API re-exports (add Engine exports)
├── engine/
│   ├── index.ts              # Engine class (public API surface)
│   ├── types.ts              # Suggestion, CuratedPath, CuratedStep, EngineConfig
│   ├── ranker.ts             # Frequency ranking + tie-breaking logic
│   ├── curated.ts            # Curated path matching + step resolution
│   ├── labels.ts             # Label generation (curated passthrough + tiered predicted)
│   ├── merger.ts             # Curated/predicted merge + deduplication + max limit
│   ├── index.test.ts         # Engine integration tests (full pipeline)
│   ├── ranker.test.ts        # Ranking + tie-breaking unit tests
│   ├── curated.test.ts       # Curated path matching unit tests
│   ├── labels.test.ts        # Label generation unit tests
│   └── merger.test.ts        # Merge/dedup unit tests
```

**Structure Decision**: Single-project library layout, matching the established pattern from `src/mapper/` and `src/telemetry/`. Co-located unit tests per module file. The engine is decomposed into four focused modules (ranker, curated, labels, merger) plus the orchestrating `index.ts`, keeping each file small and independently testable. No e2e/Playwright tests needed — the engine is pure computation with no DOM or browser dependency.

## Complexity Tracking

No constitution violations detected. This table is intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |
