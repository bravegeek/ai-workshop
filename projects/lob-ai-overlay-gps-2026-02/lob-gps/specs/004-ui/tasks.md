# Tasks: UI Module

**Input**: Design documents from `/specs/004-ui/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/ui.ts

**Tests**: Included — Constitution §IX mandates test-first approach with 100% unit test coverage (Vitest) and Playwright e2e tests against `messy-app.html`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the `src/ui/` directory structure and define shared types per plan.md

- [x] T001 Create `src/ui/` directory structure with empty module files per plan.md project structure: `index.ts`, `types.ts`, `overlay-host.ts`, `pulse-renderer.ts`, `scroll-controller.ts`, `label-renderer.ts`, `mini-map.ts`, `styles.ts`, `dom-utils.ts`
- [x] T002 Define shared types in `src/ui/types.ts`: `UIConfig` interface (zIndex, miniMapAnchor, onError), `MiniMapAnchor` union type, re-export `Suggestion` from engine types. Follow contracts/ui.ts exactly.
- [x] T003 Update `src/index.ts` to add UI module re-exports: `OverlayUI` from `./ui/index.js`, `type UIConfig` and `type MiniMapAnchor` from `./ui/types.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared utilities and styles that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Write unit tests for DOM utility helpers in `src/ui/dom-utils.test.ts`: test `isElementVisible()` (connected element, disconnected element, display:none, visibility:hidden, zero-size rect), test `findScrollableAncestor()` (overflow:auto, overflow:scroll, nested containers, fallback to document.scrollingElement), test `resolveElement()` (querySelector wrapper returning Element or null), test `isReducedMotion()` (returns boolean based on matchMedia result, mock matchMedia). Use happy-dom environment.
- [x] T005 [P] Write unit tests for Constructable Stylesheet in `src/ui/styles.test.ts`: verify stylesheet creates without error, verify it contains pulse keyframes, verify `@media (prefers-reduced-motion: reduce)` rule disables animation, verify `@media print` hides host, verify WCAG AA contrast values in label styles (dark bg, white text, min 12px font).
- [x] T006 Implement shared DOM helpers in `src/ui/dom-utils.ts`: `isElementVisible(element)` per research R6 algorithm (isConnected + getBoundingClientRect zero-check + getComputedStyle display/visibility check), `findScrollableAncestor(element)` per research R3 algorithm (walk up DOM tree checking overflow + scrollHeight > clientHeight), `resolveElement(selector)` wrapper around `document.querySelector`, `isReducedMotion()` helper that reads `window.matchMedia('(prefers-reduced-motion: reduce)').matches` (shared by PulseRenderer CSS and ScrollController behavior). All wrapped in try-catch returning null/false on error.
- [x] T007 Implement Constructable Stylesheet in `src/ui/styles.ts`: create and export a `CSSStyleSheet` instance via `new CSSStyleSheet()` + `replaceSync()`. Define all CSS: `:host` reset with `all: initial`, `.lob-pulse` animation keyframes (`box-shadow` glow effect, 1.5s ease-in-out infinite), `.lob-label` chip styles (dark bg #1a1a2e, white text, 12px min font, 6px border-radius, padding), `.lob-minimap` panel styles (fixed position, 240px width, auto height), `@media (prefers-reduced-motion: reduce)` disabling animations, `@media print { :host { display: none } }`.

**Checkpoint**: Shared utilities and styles ready — user story implementation can begin

---

## Phase 3: User Story 1 — Shadow DOM Host Lifecycle (Priority: P1) MVP

**Goal**: Create, manage, and tear down an isolated Shadow DOM container. All overlay elements live inside an open shadow root with no style leakage.

**Independent Test**: Initialize on `messy-app.html`, verify shadow host exists, verify host CSS doesn't affect shadow content, verify shadow styles don't leak to host, call `teardown()` and verify full cleanup.

### Tests for User Story 1

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T008 [P] [US1] Write unit tests for OverlayHost in `src/ui/overlay-host.test.ts`: test `create()` appends div to document.body with open shadow root, test `adoptedStyleSheets` contains the module stylesheet, test host CSS `div { color: red !important }` does NOT affect shadow content, test shadow styles do NOT leak to host elements, test `teardown()` removes host element from body, test `teardown()` is idempotent (double-call doesn't throw), test calling methods after teardown are no-ops, test graceful degradation if `attachShadow` is unavailable (mock).

### Implementation for User Story 1

- [x] T009 [US1] Implement OverlayHost class in `src/ui/overlay-host.ts`: `create(config: UIConfig)` method that creates a `<div>`, sets `style.position = 'fixed'`, `style.zIndex` from config (default 2147483646), `style.pointerEvents = 'none'`, appends to `document.body`, calls `attachShadow({ mode: 'open' })`, adopts the stylesheet from `styles.ts`. `teardown()` removes host element, clears internal references, sets disposed flag. `getRoot()` returns the ShadowRoot or null if disposed. Entire `create()` wrapped in try-catch for graceful degradation (FR-023, US1 AS5).
- [x] T010 [US1] Verify style isolation works end-to-end: add a test in `src/ui/overlay-host.test.ts` that creates a `<style>` tag with `* { font-family: Comic Sans !important; }` in the host document, creates the shadow host, appends a test element inside the shadow root, and asserts the test element's computed `font-family` is NOT Comic Sans.
- [x] T011 [US1] Verify teardown cleanup completeness: add a test in `src/ui/overlay-host.test.ts` that records `document.body.children.length` before init, creates the overlay, verifies children count increased by 1, calls `teardown()`, verifies children count returned to original value.

**Checkpoint**: Shadow DOM host is functional and isolated. All other UI stories can now render into the shadow root.

---

## Phase 4: User Story 2 — Pulse Animation (Priority: P1)

**Goal**: Render a non-intrusive pulsing highlight over a target element. The pulse uses fixed positioning from `getBoundingClientRect()`, tracks position via rAF, doesn't block clicks (`pointer-events: none`), and dismisses on interaction.

**Independent Test**: Trigger pulse on `#save-btn` in `messy-app.html`. Verify pulse is positioned correctly, clicks pass through, pulse dismisses on click/touch, and reduced-motion shows static highlight.

### Tests for User Story 2

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T012 [P] [US2] Write unit tests for PulseRenderer in `src/ui/pulse-renderer.test.ts`: test `pulse(target, shadowRoot, signal)` creates a `.lob-pulse` div inside shadow root, test pulse element has `position: fixed` with correct top/left/width/height matching target's `getBoundingClientRect()`, test `pointer-events: none` is set on pulse element, test pulse is removed when AbortController signals abort, test `dismiss()` cancels rAF and removes pulse element, test pulse repositions when target bounding rect changes (simulate scroll by mocking getBoundingClientRect), test no pulse rendered when target has zero-size rect (hidden element per FR-022), test `prefers-reduced-motion` detection returns correct boolean.

### Implementation for User Story 2

- [x] T013 [US2] Implement PulseRenderer in `src/ui/pulse-renderer.ts`: `pulse(target: Element, shadowRoot: ShadowRoot, abortSignal: AbortSignal)` method. Creates a `<div class="lob-pulse">` in the shadow root. Reads `target.getBoundingClientRect()` and sets `position: fixed` with matching coordinates. Sets `pointer-events: none`. Returns a `PulseHandle` with `dismiss()` method. All wrapped in try-catch.
- [x] T014 [US2] Add rAF position tracking loop to PulseRenderer: inside `pulse()`, start a `requestAnimationFrame` loop that re-reads `target.getBoundingClientRect()` each frame and updates pulse element position. Include target removal detection: if `rect.width === 0 && rect.height === 0` or `!target.isConnected`, call `dismiss()` (FR-020). Cancel loop via `cancelAnimationFrame` on dismiss. Use `abortSignal.addEventListener('abort', ...)` for cleanup.
- [x] T015 [US2] Add dismiss event listeners to PulseRenderer: listen for `click` and `touchstart` on `document` with `{ signal: abortSignal }` — on any trigger, call `dismiss()`. The AbortController pattern ensures all listeners are cleaned up when `abort()` is called (research R7).

**Checkpoint**: Pulse highlights target elements with position tracking, click-through, and dismiss. Reduced-motion fallback is handled by CSS. Note: `isReducedMotion()` was moved to Phase 2 (T006, dom-utils) since it's shared by both PulseRenderer and ScrollController.

---

## Phase 5: User Story 3 — Auto-Scroll to Target (Priority: P1)

**Goal**: When the target element is off-screen, smoothly scroll the correct container to bring it into view before the pulse begins. Cancel if user manually scrolls.

**Independent Test**: On `messy-app.html`, trigger auto-scroll to `#finalize-transaction-btn` (below 600px gap). Verify `.workspace` scrolls (not window), scroll completes before pulse, and manual scroll during animation cancels it.

### Tests for User Story 3

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T017 [P] [US3] Write unit tests for ScrollController in `src/ui/scroll-controller.test.ts`: test `scrollToElement(target, signal)` calls `scrollTo()` on the correct scrollable ancestor (mock `findScrollableAncestor`), test no scroll when element is already in viewport (isElementInView check), test smooth scroll behavior when reduced motion is OFF, test instant scroll behavior when reduced motion is ON, test abort signal cancels scroll and removes all listeners, test user scroll detection (wheel event fires → abort), test scroll completion callback fires after scrollend/rAF fallback.

### Implementation for User Story 3

- [x] T018 [US3] Implement ScrollController in `src/ui/scroll-controller.ts`: `scrollToElement(target: Element, abortSignal: AbortSignal): Promise<void>` method. Uses `findScrollableAncestor(target)` from dom-utils. Calculates target scroll position to center element in container viewport. Calls `container.scrollTo({ top, behavior })` where behavior is `'smooth'` or `'instant'` based on `isReducedMotion()`.
- [x] T019 [US3] Add user scroll cancellation: listen for `wheel`, `touchstart`, and `keydown` (ArrowUp, ArrowDown, PageUp, PageDown, Home, End, Space) on the scroll container with `{ signal: abortSignal }`. On any of these events, abort the scroll by calling `abortController.abort()`. This removes all listeners and rejects the scroll promise.
- [x] T020 [US3] Add scroll completion detection: listen for `scrollend` event on the container. If `scrollend` is not supported (fallback), use a rAF poll that checks if scroll position has stabilized (same scrollTop for 2 consecutive frames). Resolve the returned promise when scroll completes. Handle abort signal (reject promise on abort).

**Checkpoint**: Auto-scroll brings off-screen targets into view with correct container detection and user cancellation.

---

## Phase 6: User Story 4 — Contextual Micro-Labels (Priority: P1)

**Goal**: Display a small, readable label near each pulsed element showing the suggestion's "Why" text. Labels flip to stay visible at viewport edges and are non-interactive.

**Independent Test**: Render a label `"Step 2: Enter Account ID"` near `#acc_id_input` on `messy-app.html`. Verify label is visible, readable, doesn't cover the input, and has WCAG AA contrast.

### Tests for User Story 4

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T021 [P] [US4] Write unit tests for LabelRenderer in `src/ui/label-renderer.test.ts`: test `show(target, labelText, shadowRoot, signal)` creates a `.lob-label` div with the label text, test label has `position: fixed` and `pointer-events: none`, test label positioned below target by default (top = targetRect.bottom + gap), test vertical flip when label would clip below viewport, test horizontal clamp when label is near left/right edge, test RTL layout mirrors horizontal positioning (mock `getComputedStyle(document.documentElement).direction` as `'rtl'`), test label removed on abort signal, test label text content matches input string exactly.

### Implementation for User Story 4

- [x] T022 [US4] Implement LabelRenderer in `src/ui/label-renderer.ts`: `show(target: Element, labelText: string, shadowRoot: ShadowRoot, abortSignal: AbortSignal)` method. Creates `<div class="lob-label">` with `textContent = labelText`, `position: fixed`, `pointer-events: none`. Positions using research R4 algorithm: default below target, centered horizontally.
- [x] T023 [US4] Add viewport edge flip logic to LabelRenderer: after initial positioning, check if label clips viewport bottom → flip to above target. Check if label clips left/right → clamp to viewport margin. Re-read `labelElement.getBoundingClientRect()` after append to get actual dimensions for flip calculation.
- [x] T024 [US4] Add RTL layout support: read `getComputedStyle(document.documentElement).direction`. If `'rtl'`, set `direction: rtl` and `text-align: right` on label element, and mirror horizontal positioning logic (right-align relative to target instead of left-align). Wrap in try-catch (FR-023).

**Checkpoint**: Labels display contextual "Why" text near pulsed elements with proper positioning, flip logic, RTL support, and WCAG AA contrast.

---

## Phase 7: User Story 5 — Mini-Map / Suggestion List (Priority: P2)

**Goal**: A fixed-position panel showing all current suggestions. Clicking an entry triggers auto-scroll + pulse to that target. Keyboard navigable with ARIA roles.

**Independent Test**: With 3 suggestions, verify mini-map shows 3 entries with labels and source indicators. Click second entry and verify scroll + pulse targets correct element. Verify keyboard nav (Tab, Enter/Space).

### Tests for User Story 5

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T025 [P] [US5] Write unit tests for MiniMap in `src/ui/mini-map.test.ts`: test `update(suggestions, shadowRoot, signal)` renders panel with correct number of entries, test each entry displays label text and source indicator (★ curated, ◆ predicted), test clicking an entry calls the onSelect callback with the clicked suggestion, test panel hides when suggestions array is empty, test panel has `role="complementary"` and `aria-label`, test entries have `role="listitem"` and `tabindex="0"`, test Enter key on focused entry triggers onSelect, test Space key on focused entry triggers onSelect, test panel anchors to configured corner (bottom-right default), test `teardown()` removes panel from shadow root.

### Implementation for User Story 5

- [x] T026 [US5] Implement MiniMap panel rendering in `src/ui/mini-map.ts`: `update(suggestions: Suggestion[], shadowRoot: ShadowRoot, onSelect: (s: Suggestion) => void, abortSignal: AbortSignal)` method. Creates/updates a `.lob-minimap` container with header ("LOB GPS"), entry list, and collapse button. Each entry shows source icon (★/◆) and label text. Click listeners on entries call `onSelect`. Hides panel when suggestions is empty (FR, US5 AS4).
- [x] T027 [US5] Add keyboard navigation and ARIA roles to MiniMap: set `role="complementary"`, `aria-label="Navigation suggestions"` on panel. Set `role="list"` on entry container. Each entry gets `role="listitem"`, `tabindex="0"`. Add `keydown` listener for Enter/Space activation on entries. Add collapse/expand toggle button with `role="button"`, `aria-label="Collapse suggestions"`. All listeners use `{ signal: abortSignal }`.
- [x] T028 [US5] Add configurable anchor corner positioning: read `miniMapAnchor` from UIConfig. Map anchor string to CSS positioning (`bottom-right` → `bottom: 16px; right: 16px`, etc.). Apply as inline styles on the panel element. Default to `bottom-right` if not specified.

**Checkpoint**: Mini-map shows suggestion list with click-to-navigate, keyboard nav, and configurable positioning.

---

## Phase 8: Integration — OverlayUI Orchestrator

**Purpose**: Wire all components together into the public `OverlayUI` class that implements `IOverlayUI` (render + teardown).

### Tests for Integration

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T029 [P] Write unit tests for OverlayUI orchestrator in `src/ui/index.test.ts`: test constructor creates OverlayHost, test `render([])` is a no-op (no pulse, no label, mini-map hides), test `render(suggestions)` validates targets via `isElementVisible` and filters invalid ones, test `render()` dismisses previous pulse before rendering new one (FR-019), test `render()` sequences scroll → pulse → label for top suggestion, test `render()` updates mini-map with all valid suggestions, test mini-map onSelect triggers scroll+pulse for selected suggestion, test `teardown()` removes shadow host and aborts all controllers, test `teardown()` is idempotent, test `render()` after `teardown()` is a no-op, test error in pulse rendering doesn't prevent label rendering (FR-023), test error in scroll doesn't prevent pulse rendering (FR-023), test `onError` callback receives caught errors, test `onError` callback failure is silenced (double try-catch).

### Implementation for Integration

- [x] T030 Implement OverlayUI class in `src/ui/index.ts`: constructor accepts `UIConfig`, creates OverlayHost and module-level AbortController. `render(suggestions)` method: filter suggestions via `resolveElement` + `isElementVisible` (FR-022), dismiss active pulse if any (FR-019), update MiniMap, for top valid suggestion: run ScrollController.scrollToElement (if off-screen) → PulseRenderer.pulse → LabelRenderer.show. Each operation in its own try-catch (FR-023). `teardown()` aborts module controller, calls OverlayHost.teardown, sets disposed flag.
- [x] T031 Add independent error boundaries to OverlayUI: wrap each rendering operation (scroll, pulse, label, mini-map update) in its own try-catch per FR-023. On catch, call `config.onError?.(error)` wrapped in its own try-catch (double-wrap per research R5 pattern). Ensure a failing label doesn't block pulse, a failing scroll doesn't block pulse, etc.
- [x] T032 Write Playwright e2e tests in `test/e2e/ui.spec.ts`: test shadow host appears on `messy-app.html` with no console errors, test pulse on `#save-btn` is visually positioned correctly (SC-002), test click passes through pulse to button (pointer-events: none) verifying overlay never blocks user interaction (FR-015), test auto-scroll to `#finalize-transaction-btn` scrolls `.workspace` container (SC-003), test label displays suggestion text and is readable (SC-004), test `prefers-reduced-motion: reduce` emulation shows static highlight and instant scroll (SC-005), test `teardown()` removes all overlay elements (SC-006), test keyboard navigation on mini-map entries, test mini-map collapse/expand toggle (FR-025), test accessibility audit with axe-core (SC-008).

**Checkpoint**: Full OverlayUI orchestrator working end-to-end with all components integrated and e2e tested.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Performance validation, build verification, and final cleanup

- [x] T033 [P] Add performance benchmark test: in `src/ui/index.test.ts`, add a test that calls `render()` with 3 valid suggestions and asserts completion within 50ms using `performance.now()` delta (SC-007, FR-014).
- [x] T034 [P] Verify print media rule: add a test that checks the stylesheet contains `@media print { :host { display: none } }` (FR-016). Already in styles.test.ts if T005 was thorough, but verify explicitly.
- [x] T035 Run build and verify UI module is included in bundle: run `bun run build`, verify `dist/` output includes OverlayUI exports, verify no type errors, verify bundle size stays under 50KB gzipped target.
- [x] T036 Run quickstart.md validation: follow the usage example in `specs/004-ui/quickstart.md` as a smoke test, verify all documented APIs work as described.
- [x] T037 [P] Verify 100% unit test coverage: run `vitest run --coverage` and assert 100% line/branch coverage on all `src/ui/*.ts` logic files (Constitution §IX). Configure coverage thresholds in vitest config if not already present.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T002 (types) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — shadow root is required for all rendering
- **US2 (Phase 4)**: Depends on US1 (needs shadow root to render pulse into)
- **US3 (Phase 5)**: Depends on US1 (scroll tests may run independently, but integration requires shadow root). Can run in parallel with US2.
- **US4 (Phase 6)**: Depends on US1 (labels render into shadow root). Can run in parallel with US2/US3.
- **US5 (Phase 7)**: Depends on US1 (mini-map renders into shadow root). Can run in parallel with US2/US3/US4.
- **Integration (Phase 8)**: Depends on US1–US5 all complete
- **Polish (Phase 9)**: Depends on Phase 8

### User Story Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundational)
                      ↓
                  Phase 3 (US1: Shadow DOM) ← BLOCKS US2
                      ↓
              ┌───────┼───────┐
              ↓       ↓       ↓
          Phase 4  Phase 5  Phase 6  Phase 7
          (US2)    (US3)    (US4)    (US5)
          Pulse    Scroll   Labels   MiniMap
              └───────┼───────┘
                      ↓
                  Phase 8 (Integration)
                      ↓
                  Phase 9 (Polish)
```

**Note**: US2–US5 can run in parallel after US1 completes. Each component is in a separate file with no cross-dependencies. Integration wires them together in Phase 8.

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Implementation tasks within a story are sequential (build on each other)
- Each story is independently testable at its checkpoint

### Parallel Opportunities

- **Phase 2**: T004 and T005 (test files) can run in parallel
- **Phase 4–7**: US2, US3, US4, US5 test tasks (T012, T017, T021, T025) can all run in parallel
- **Phase 4–7**: After US1, implementation of US2–US5 can proceed in parallel (different files)
- **Phase 8**: T029 (integration tests) can start while T030–T031 are being implemented
- **Phase 9**: T033 and T034 can run in parallel

---

## Parallel Example: After Phase 3 (US1) Completes

```bash
# Launch all test files for US2-US5 in parallel (different files, no deps):
Task: "Write unit tests for PulseRenderer in src/ui/pulse-renderer.test.ts"
Task: "Write unit tests for ScrollController in src/ui/scroll-controller.test.ts"
Task: "Write unit tests for LabelRenderer in src/ui/label-renderer.test.ts"
Task: "Write unit tests for MiniMap in src/ui/mini-map.test.ts"

# Then implement each component in parallel (different files):
Task: "Implement PulseRenderer in src/ui/pulse-renderer.ts"
Task: "Implement ScrollController in src/ui/scroll-controller.ts"
Task: "Implement LabelRenderer in src/ui/label-renderer.ts"
Task: "Implement MiniMap panel rendering in src/ui/mini-map.ts"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (types, dom-utils, styles)
3. Complete Phase 3: US1 (Shadow DOM host lifecycle)
4. **STOP and VALIDATE**: Verify shadow host creates, isolates styles, and tears down cleanly
5. Shadow root is now available for all subsequent rendering

### Incremental Delivery

1. Setup + Foundational → shared infrastructure ready
2. Add US1 (Shadow DOM) → isolated container ready (MVP foundation)
3. Add US2 (Pulse) → core visual feedback working
4. Add US3 (Scroll) → off-screen targets reachable
5. Add US4 (Labels) → "Why" layer complete → **Core experience complete**
6. Add US5 (Mini-Map) → suggestion discoverability (P2)
7. Integration → full orchestrated render pipeline
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers after US1 completes:

1. Team completes Setup + Foundational + US1 together
2. Once US1 is done:
   - Developer A: US2 (Pulse) + US4 (Labels) — related visual components
   - Developer B: US3 (Scroll) + US5 (Mini-Map) — interaction components
3. Both converge on Phase 8 (Integration)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (Constitution §IX)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All event listeners must use AbortController `{ signal }` pattern (research R7)
- All rendering operations must have independent try-catch boundaries (FR-023)
- All DOM reads on host elements are read-only (FR-012) — no mutations
