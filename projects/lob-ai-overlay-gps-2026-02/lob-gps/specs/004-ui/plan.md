# Implementation Plan: UI Module

**Branch**: `004-ui` | **Date**: 2026-02-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-ui/spec.md`

## Summary

The UI module is the visual rendering layer of the LOB AI Overlay GPS system. It receives `Suggestion[]` from the Engine and renders non-intrusive pulse highlights, auto-scrolls to off-screen targets, displays contextual micro-labels, and provides an optional mini-map panel — all inside a Shadow DOM to prevent style/script collisions with the host application. The module is decomposed into five focused components: OverlayHost (Shadow DOM lifecycle), PulseRenderer (highlight animation + positioning), ScrollController (ancestor detection + smooth scroll), LabelRenderer (tooltip positioning + flip logic), and MiniMap (suggestion list panel). Each component manages its own DOM within the shadow root and its own event listeners, with independent error boundaries per FR-023.

## Technical Context

**Language/Version**: TypeScript (Strict mode), targeting ESNext
**Primary Dependencies**: Zero runtime dependencies (Constitution §VII). Dev: Vitest, Playwright, tsup, Vite, happy-dom.
**Storage**: N/A — the UI module is stateless and renders whatever it receives.
**Testing**: Vitest (unit tests, happy-dom environment for DOM APIs) + Playwright (e2e against `messy-app.html` for visual/scroll/accessibility verification).
**Target Platform**: Modern evergreen browsers supporting Shadow DOM v1, `requestAnimationFrame`, `IntersectionObserver`, Constructable Stylesheets.
**Project Type**: Single library — ESM/CJS dual bundles via tsup
**Performance Goals**: <50ms UI rendering per suggestion cycle (FR-014). <50KB gzipped bundle for the entire library (Constitution §Tech Constraints).
**Constraints**: Zero DOM writes to host document (FR-012), all rendering inside Shadow DOM (FR-001), all errors caught and silenced (FR-023, FR-026 onError callback), respect `prefers-reduced-motion` (FR-010), WCAG AA compliance (FR-009, FR-011), mini-map collapse/expand (FR-025).
**Scale/Scope**: Renders 1–5 suggestions at a time. Single shadow host element. Typical DOM interaction: 1 pulse + 1 label + 1 optional scroll + 1 optional mini-map panel.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| §I Shadow DOM Isolation | FR-001: All UI in Shadow DOM. Open mode per clarification. | PASS |
| §II Hybrid Guidance | UI renders both curated and predicted suggestions identically. Source indicator in mini-map. | PASS (N/A — ranking is Engine's job) |
| §III "Why" Layer | FR-008: Every pulsed element displays micro-label with suggestion's `label` text | PASS |
| §IV Passive Waze UX | FR-003/FR-015: Never blocks interaction. FR-007: Auto-scroll cancels on user input. Labels are inert. | PASS |
| §V Zero-Touch Deployment | UI is initialized by Integration layer (005), no host modifications | PASS (N/A — deployment is Integration's job) |
| §VII Strict TypeScript | TypeScript strict mode; zero runtime dependencies | PASS |
| §VIII Performance | FR-014: <50ms rendering. Pulse positioning via rAF. No heavy computation. | PASS |
| §IX Test-First Reliability | Vitest (unit, happy-dom) + Playwright (e2e, messy-app.html). 100% coverage on logic. | PASS |
| §X Fail-Safe Resilience | FR-023: Per-operation error boundaries. FR-013: teardown() cleanup. US1 AS5: graceful degradation. | PASS |
| §XI Accessibility | FR-009: WCAG AA contrast, min 12px. FR-010: prefers-reduced-motion. FR-011: keyboard-nav + ARIA. FR-025: collapse/expand toggle. | PASS |
| §XII Determinism | N/A — ranking/tie-breaking is Engine's responsibility. UI renders in received order. | PASS (N/A) |
| §XIII Telemetry Privacy | UI has no telemetry access. Reads only Suggestion fields (selector, label, source). | PASS (N/A) |
| Tech: Constructable Stylesheets | FR-002: Styles via Constructable Stylesheets only (no inline `<style>` fallback needed) | PASS |
| Tech: Read-only host DOM | FR-012: No mutations to host DOM. Only reads bounding rects + computed styles. | PASS |
| Tech: tsup build | Part of existing tsup.config.ts (src/index.ts re-exports) | PASS |

**Gate result**: ALL PASS. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/004-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── ui.ts            # Phase 1 output — TypeScript interface definitions
├── checklists/
│   └── requirements.md  # Spec quality checklist (created during /speckit.specify)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── index.ts                    # Public API re-exports (add UI exports)
├── ui/
│   ├── index.ts                # OverlayUI class (public API: render, teardown)
│   ├── types.ts                # UIConfig, MiniMapAnchor, internal types
│   ├── overlay-host.ts         # Shadow DOM host lifecycle (create, teardown, getRoot)
│   ├── pulse-renderer.ts       # Pulse highlight (position, animate, dismiss, rAF tracking)
│   ├── scroll-controller.ts    # Auto-scroll (ancestor detection, smooth scroll, cancel-on-user)
│   ├── label-renderer.ts       # Micro-label (position, flip, contrast, RTL)
│   ├── mini-map.ts             # Suggestion list panel (render, click-to-navigate, keyboard nav)
│   ├── styles.ts               # Constructable Stylesheets / style definitions
│   ├── dom-utils.ts            # Shared helpers (visibility check, bounding rect, scroll ancestor)
│   ├── index.test.ts           # OverlayUI integration tests
│   ├── overlay-host.test.ts    # Shadow DOM lifecycle unit tests
│   ├── pulse-renderer.test.ts  # Pulse positioning + animation unit tests
│   ├── scroll-controller.test.ts # Scroll ancestor + cancellation unit tests
│   ├── label-renderer.test.ts  # Label positioning + flip logic unit tests
│   ├── mini-map.test.ts        # Mini-map rendering + keyboard nav unit tests
│   ├── styles.test.ts          # Style isolation verification tests
│   └── dom-utils.test.ts       # Shared helper unit tests

test/
└── e2e/
    └── ui.spec.ts              # Playwright e2e tests (pulse, scroll, label, mini-map, a11y)
```

**Structure Decision**: Single-project library layout, matching `src/mapper/`, `src/telemetry/`, and `src/engine/`. Co-located unit tests per module file. The UI is decomposed into six focused modules (overlay-host, pulse-renderer, scroll-controller, label-renderer, mini-map, styles) plus shared helpers (dom-utils) and the orchestrating `index.ts`. This mirrors the Engine's decomposition pattern (ranker, curated, labels, merger). Unlike the Engine, the UI module requires both Vitest (unit, happy-dom) and Playwright (e2e against messy-app.html) because it interacts with real DOM and visual rendering.

## Complexity Tracking

No constitution violations detected. This table is intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |
