# Implementation Plan: Mapper Module

**Branch**: `001-mapper` | **Date**: 2026-02-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-mapper/spec.md`

## Summary

The Mapper module is the foundational layer of the LOB AI Overlay GPS system. It provides three core capabilities: (1) stable, normalized CSS selector generation using a tiered hierarchy that survives page reloads and dynamic DOM changes, (2) deterministic StateKey generation combining URL context with the last user action to identify workflow position, and (3) DOM observation via MutationObserver to detect meaningful state transitions (structural changes and visibility toggles of interactive containers). All host DOM interaction is read-only and wrapped in try-catch boundaries. The module exposes a typed API (`SelectorResult`, `StateKey`, `StateChangeEvent`) consumed downstream by Telemetry, Engine, and UI modules.

## Technical Context

**Language/Version**: TypeScript (Strict mode), targeting ESNext
**Primary Dependencies**: Zero runtime dependencies (constitution §VII). Dev: Vitest, Playwright, tsup, Vite, happy-dom.
**Storage**: N/A for this module (downstream modules handle persistence via localStorage)
**Testing**: Vitest (unit, happy-dom environment) + Playwright (Chromium/Firefox/WebKit e2e against `messy-app.html`)
**Target Platform**: Modern evergreen browsers (MutationObserver, `querySelectorAll`, `performance.now()` required)
**Project Type**: Single library — ESM/CJS dual bundles via tsup
**Performance Goals**: <5ms per selector generation (FR-013), <50ms total UI response (constitution §VIII), <50KB gzipped bundle (constitution §Tech Constraints)
**Constraints**: Read-only host DOM access (FR-011), no global namespace pollution, zero external runtime dependencies
**Scale/Scope**: Single test fixture (`messy-app.html`) for v1; real LOB app DOMs may have thousands of elements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| §I Shadow DOM Isolation | Mapper reads host DOM from overlay Shadow DOM context; does not inject UI | PASS |
| §VII Strict TypeScript & Minimal Overhead | TypeScript strict mode enabled; zero runtime dependencies | PASS |
| §VIII Performance | 5ms selector budget fits within 50ms total budget | PASS |
| §IX Test-First Reliability | Vitest + Playwright configured; spec mandates 100% unit coverage (SC-006) | PASS |
| §X Fail-Safe Resilience | FR-010 mandates try-catch on all host DOM interactions | PASS |
| §XI Accessibility | Mapper uses `aria-label` in selector hierarchy; no UI to make accessible | PASS (N/A for UI) |
| §XII Determinism & Normalization | FR-006 strips GUIDs/dynamic IDs; SelectorTier hierarchy is deterministic | PASS |
| §XIII Telemetry Privacy | FR-009 prohibits capturing input values, clipboard, non-interactive innerText | PASS |
| Tech: tsup build | tsup.config.ts configured for ESM/CJS + dts | PASS |
| Tech: Vite dev server | vite.config.ts configured, serves messy-app.html on port 3000 | PASS |
| Tech: Read-only host DOM | FR-011 explicitly requires this | PASS |

**Gate result**: ALL PASS. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-mapper/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── mapper.ts        # TypeScript interface definitions
├── checklists/
│   └── requirements.md  # Pre-existing quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── index.ts                  # Public API re-exports
├── mapper/
│   ├── index.ts              # Mapper class (public API surface)
│   ├── types.ts              # SelectorResult, SelectorTier, StateKey, StateChangeEvent, MapperConfig
│   ├── selector-generator.ts # Tiered selector generation logic
│   ├── dynamic-id-detector.ts # Dynamic ID classification (regex patterns, allowlist/denylist)
│   ├── state-key.ts          # StateKey generation (URL mode + fingerprint mode)
│   ├── page-fingerprint.ts   # Semantic anchor extraction and hashing
│   ├── dom-observer.ts       # MutationObserver wrapper with debounce
│   ├── selector-generator.test.ts
│   ├── dynamic-id-detector.test.ts
│   ├── state-key.test.ts
│   ├── page-fingerprint.test.ts
│   └── dom-observer.test.ts

test-pages/
└── messy-app.html            # Canonical test fixture (pre-existing)

test/
└── e2e/
    └── mapper.spec.ts        # Playwright e2e tests against messy-app.html
```

**Structure Decision**: Single-project library layout. The `src/mapper/` directory contains all mapper logic as co-located modules with co-located unit tests (matching `vitest.config.ts` pattern `src/**/*.test.ts`). E2E tests live in `test/e2e/` per the `playwright.config.ts` testDir. No additional top-level directories needed — the mapper is a pure logic module with no backend, no frontend components, and no API server.

## Complexity Tracking

No constitution violations detected. This table is intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |
