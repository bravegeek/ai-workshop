# Implementation Plan: Integration Layer

**Branch**: `005-integration` | **Date**: 2026-02-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-integration/spec.md`

## Summary

The integration layer wires all four existing modules (Mapper, Telemetry, Engine, UI) into a single drop-in `<script>` bundle. It provides a global `window.LobGPS` API with lifecycle management (enable/disable/teardown), a configurable kill switch, error boundaries around every module call, a leading-edge debounced pipeline (StateChangeEvent → Telemetry → Engine → UI), and a unified configuration surface that fans out to each module's config. The integration layer itself contains no new DOM rendering or data storage — it is pure orchestration.

## Technical Context

**Language/Version**: TypeScript (Strict mode), targeting ESNext
**Primary Dependencies**: Zero runtime dependencies (Constitution §VII). Dev: Vitest, Playwright, tsup, Vite, happy-dom.
**Storage**: N/A — the integration layer delegates all persistence to Telemetry's TelemetryProvider.
**Testing**: Vitest (unit tests with happy-dom for DOM APIs) + Playwright (e2e against `messy-app.html` for full pipeline verification).
**Target Platform**: Modern evergreen browsers supporting Shadow DOM v1, MutationObserver, `requestAnimationFrame`.
**Project Type**: Single library — ESM/CJS dual bundles via tsup
**Performance Goals**: <50ms pipeline cycle (StateChangeEvent → UI render initiated). <50KB gzipped bundle for entire library. (Constitution §VIII, §Tech Constraints)
**Constraints**: Zero global namespace pollution beyond `window.LobGPS` (FR-003). Zero host DOM mutations (read-only). All errors caught and silenced (FR-008). Leading-edge debounce 100ms (FR-011).
**Scale/Scope**: Single global instance per page. Orchestrates 4 modules. Processes 1 pipeline cycle per debounce window. Config surface fans out ~20 fields across 4 modules + integration-specific settings.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| §I Shadow DOM Isolation | UI module already renders in Shadow DOM. Integration layer adds no DOM of its own. | PASS |
| §II Hybrid Guidance | Engine handles curated vs predicted ranking. Integration passes curatedPaths config through. | PASS (N/A — ranking is Engine's job) |
| §III "Why" Layer | UI module displays micro-labels. Integration passes Suggestion[] through unchanged. | PASS (N/A — rendering is UI's job) |
| §IV Passive Waze UX | No blocking behavior added. Kill switch (§X) provides user override. | PASS |
| §V Zero-Touch Deployment | FR-001: Single `<script>` tag, zero host modifications. FR-013: async/defer/sync loading. FR-016: Config via pre-existing `window.LobGPS` object. | PASS |
| §VI Privacy-First Telemetry | Integration does not add telemetry. Passes config to Telemetry module unchanged. | PASS (N/A) |
| §VII Strict TypeScript / Zero deps | TypeScript strict mode. Zero runtime dependencies. All modules are internal. | PASS |
| §VIII Performance | FR-010: <50ms pipeline. FR-011: Leading-edge debounce prevents flood. | PASS |
| §IX Test-First Reliability | Vitest unit tests + Playwright e2e against messy-app.html. 100% coverage on orchestration logic. | PASS |
| §X Fail-Safe Resilience | FR-008: Per-module try-catch. FR-005/FR-006: Kill switch (key combo + API). FR-022: Auto-disable on cascading failures. FR-023: Invalid-state no-ops. | PASS |
| §XI Accessibility | Handled by UI module. Integration adds keyboard listener for kill switch only — does not interfere with a11y. | PASS |
| §XII Determinism | Handled by Engine module. Integration passes through unchanged. | PASS (N/A) |
| §XIII Telemetry Privacy | Integration records no telemetry of its own. Delegates to Telemetry module. | PASS (N/A) |
| Tech: Single global | FR-003: Only `window.LobGPS`. FR-016: Read pre-existing config, replace with API. | PASS |
| Tech: tsup build | Existing tsup.config.ts entry `src/index.ts`. New IIFE entry point `src/boot.ts` for `<script>` tag usage. | PASS |

**Gate result**: ALL PASS. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/005-integration/
├── plan.md              # This file
├── research.md          # Phase 0: technical decisions
├── data-model.md        # Phase 1: entity definitions and state machine
├── quickstart.md        # Phase 1: integration scenarios
├── contracts/           # Phase 1: TypeScript interfaces
│   └── integration.ts   # LobGPS, LobGPSConfig, Pipeline contracts
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── index.ts                  # Barrel exports (existing — add LobGPS, boot)
├── boot.ts                   # NEW: IIFE self-initializer for <script> tag usage
├── integration/              # NEW: Integration module directory
│   ├── index.ts              # LobGPS class (public API facade)
│   ├── types.ts              # LobGPSConfig, LobGPSState enum, internal types
│   ├── pipeline.ts           # Pipeline orchestrator (debounce + error boundaries)
│   ├── error-buffer.ts       # Capped ring buffer (max 100 errors)
│   ├── kill-switch.ts        # Keyboard shortcut listener + key combo parser
│   ├── config-resolver.ts    # Merge user config with defaults, fan out to modules
│   ├── index.test.ts         # Unit tests: LobGPS lifecycle, state machine
│   ├── pipeline.test.ts      # Unit tests: pipeline debounce, error isolation, cycle cancellation
│   ├── error-buffer.test.ts  # Unit tests: ring buffer cap, FIFO eviction
│   ├── kill-switch.test.ts   # Unit tests: key combo parsing, listener lifecycle
│   └── config-resolver.test.ts # Unit tests: config merging, defaults
├── mapper/                   # Existing
├── telemetry/                # Existing
├── engine/                   # Existing
└── ui/                       # Existing

test/
└── e2e/
    ├── ui.spec.ts            # Existing
    └── integration.spec.ts   # NEW: Playwright e2e (full pipeline, kill switch, error boundaries)
```

**Structure Decision**: New `src/integration/` directory follows the established pattern (one directory per module). `src/boot.ts` is a separate entry point for IIFE builds — it reads `window.LobGPS` config, instantiates the LobGPS class, and assigns the API back to `window.LobGPS`. The existing `src/index.ts` barrel file gains exports for `LobGPS` and `LobGPSConfig`. tsup.config.ts adds a second entry for `src/boot.ts` with `globalName: 'LobGPS'` and IIFE format.

## Complexity Tracking

> No constitution violations. No complexity justifications needed.
