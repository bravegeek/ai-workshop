# Feature Specification: UI Module

**Feature Branch**: `004-ui`
**Created**: 2026-02-08
**Status**: Draft
**Input**: Constitution v1.1.0, session.md, Mapper spec, Telemetry spec, Engine spec

## Clarifications

### Session 2026-02-17

- Q: Should the shadow root use open or closed mode? → A: Open (`mode: 'open'`). Enables DevTools inspection, Playwright assertions, and integration layer error diagnostics via `element.shadowRoot`. Closed mode adds encapsulation but complicates debugging and testing without meaningful security benefit (the overlay contains no sensitive data).
- Q: How should the mini-map panel be positioned? → A: Fixed position, configurable anchor corner (default: bottom-right). Set via initialization option (e.g. `miniMapAnchor: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'`). No drag functionality in v1 — can be added later without breaking changes.

## Upstream Dependencies

This module consumes the Engine's output:
- **Suggestion** — `{selector, label, confidence, source, avgDwellTime, curatedPathId?}`
- **NormalizedSelector** (Mapper, via Suggestion) — used to locate the target element for pulse/scroll

The UI never interacts with Telemetry or Mapper directly. It receives Suggestions from the Engine and renders them.

## User Scenarios & Testing

### User Story 1 - Shadow DOM Host Lifecycle (Priority: P1)

The UI module must create, manage, and tear down a Shadow DOM container attached to the host document. All overlay elements (pulse highlights, labels, mini-map) live inside this shadow root. No styles or scripts leak in or out.

**Why this priority**: Foundation for all visual output. Without isolation, the overlay breaks host app styling or vice versa. Constitution §I is non-negotiable on this.

**Independent Test**: Inject the shadow host into `messy-app.html`, verify it exists in the DOM, verify no host CSS affects elements inside the shadow root, verify no shadow styles affect host elements. Then call `teardown()` and verify the shadow host is fully removed.

**Acceptance Scenarios**:

1. **Given** the UI module is initialized, **When** the shadow host is created, **Then** it is appended to `document.body` as a `<div>` with an **open** shadow root (`mode: 'open'`). Open mode enables DevTools inspection, Playwright assertions, and error diagnostics via `element.shadowRoot`.
2. **Given** the shadow host exists, **When** a CSS rule like `div { color: red !important; }` exists in the host app, **Then** elements inside the shadow root are not affected.
3. **Given** styles are applied inside the shadow root, **When** inspected, **Then** they use Constructable Stylesheets — no external CSS files, no CSS frameworks, no inline `<style>` fallback needed (all target browsers support Constructable Stylesheets). (Constitution §Tech Constraints)
4. **Given** `teardown()` is called, **When** complete, **Then** the shadow host element is removed from `document.body`, all internal event listeners are cleaned up, and no orphaned DOM nodes remain.
5. **Given** the shadow host creation fails (e.g. browser doesn't support Shadow DOM), **When** the error is caught, **Then** the UI module degrades silently — no overlay, no errors thrown to host app. (Constitution §X)

---

### User Story 2 - Pulse Animation (Priority: P1)

When the Engine returns suggestions, the UI highlights the top suggestion's target element with a non-intrusive pulsing visual effect. The pulse draws attention without obscuring the element or blocking interaction.

**Why this priority**: The pulse is the core visual feedback mechanism — the "GPS arrow" that says "go here next."

**Independent Test**: On `messy-app.html`, trigger a pulse on `#save-btn`. Verify the pulse is visually positioned over the button, does not block clicks on the button, and auto-dismisses after a timeout or user interaction.

**Acceptance Scenarios**:

1. **Given** a Suggestion with `selector: '#save-btn'`, **When** the pulse is triggered, **Then** a visual highlight (border glow, outline, or ring animation) appears positioned over `#save-btn`.
2. **Given** the pulse is active on an element, **When** the user clicks that element, **Then** the pulse dismisses immediately.
3. **Given** the pulse is active, **When** the user clicks elsewhere or performs another action, **Then** the pulse dismisses (the overlay never persists against the user's intent).
4. **Given** the pulse element is rendered, **When** inspected, **Then** it lives inside the shadow root — not injected into the host DOM. Positioning is achieved via absolute/fixed coordinates calculated from the target element's bounding rect.
5. **Given** the target element is inside a scrollable container (like `.workspace` in `messy-app.html`), **When** the container scrolls, **Then** the pulse tracks the element's position smoothly (repositions on scroll/resize via `requestAnimationFrame`).
6. **Given** `prefers-reduced-motion: reduce` is active, **When** the pulse is triggered, **Then** it shows a static highlight (no animation) instead of a pulsing effect. (Constitution §XI)
7. **Given** the target element is not visible (e.g. `display: none`, zero dimensions), **When** the pulse is triggered, **Then** no pulse is rendered — the suggestion is skipped silently.

---

### User Story 3 - Auto-Scroll to Target (Priority: P1)

When the top suggestion's target element is off-screen (below the fold, in a scrollable container), the UI smoothly scrolls the viewport or container to bring the element into view before pulsing it.

**Why this priority**: The `messy-app.html` test page has a 600px empty space specifically to test this. If the user can't see the target, the pulse is useless.

**Independent Test**: On `messy-app.html`, after clicking Save (which reveals the Action Items section below 600px of empty space), trigger a suggestion for `#finalize-transaction-btn`. Verify the workspace scrolls smoothly to bring it into view, then the pulse appears.

**Acceptance Scenarios**:

1. **Given** a suggestion targets `#finalize-transaction-btn` which is below the visible viewport, **When** auto-scroll triggers, **Then** the workspace container scrolls smoothly until the target is visible.
2. **Given** the target is already visible in the viewport, **When** a suggestion is rendered, **Then** no scrolling occurs — only the pulse appears.
3. **Given** the target is inside a nested scrollable container (not the main viewport), **When** auto-scroll triggers, **Then** the correct container scrolls (not `window.scrollTo` on the wrong element).
4. **Given** `prefers-reduced-motion: reduce` is active, **When** auto-scroll triggers, **Then** the scroll is instant (no smooth animation) but still positions the element in view. (Constitution §XI)
5. **Given** auto-scroll completes, **When** the element is in view, **Then** the pulse animation begins — scroll happens before pulse, not simultaneously.
6. **Given** the user manually scrolls during an auto-scroll, **When** user scroll is detected, **Then** the auto-scroll cancels immediately — user input always wins. (Constitution §IV)

---

### User Story 4 - Contextual Micro-Labels (Priority: P1)

Each pulsed element gets a small, readable label displaying the suggestion's "Why" text. The label is positioned near the target element without obscuring it or other interactive elements.

**Why this priority**: Constitution §III — "Providing the 'Why' is as important as the guidance itself." A pulse without a label is a blinking mystery.

**Independent Test**: Trigger a curated suggestion with label `"Step 2: Enter Account ID"` targeting `#acc_id_input` on `messy-app.html`. Verify the label is visible, readable, positioned near the input, and doesn't cover the input field itself.

**Acceptance Scenarios**:

1. **Given** a Suggestion with `label: "Step 2: Enter Account ID"`, **When** rendered, **Then** a small tooltip/chip appears near the target element displaying that text.
2. **Given** the label is rendered, **When** inspected, **Then** it lives inside the shadow root, uses a readable font size (minimum 12px), and has sufficient contrast (WCAG AA minimum). (Constitution §XI)
3. **Given** the target element is near the edge of the viewport, **When** the label is positioned, **Then** it flips or repositions to stay fully visible (no clipping off-screen).
4. **Given** the label is displayed, **When** the user hovers or focuses the label, **Then** nothing happens — the label is inert and non-interactive (passive guidance only). (Constitution §IV)
5. **Given** the pulse dismisses (click, timeout, new suggestion), **When** the pulse disappears, **Then** the label disappears with it.

---

### User Story 5 - Mini-Map / Suggestion List (Priority: P2)

A persistent, small overlay panel (the "ghost button" from session.md) that shows the current top suggestions as a clickable list. Clicking a suggestion triggers auto-scroll + pulse to that target.

**Why this priority**: P2 because pulse + label (US2-4) deliver the core guidance experience. The mini-map adds discoverability — users can see all suggestions at a glance rather than waiting for auto-pulse.

**Independent Test**: With 3 suggestions available, verify the mini-map shows 3 entries. Click the second entry and verify auto-scroll + pulse targets the correct element.

**Acceptance Scenarios**:

1. **Given** the Engine returns 3 suggestions, **When** the mini-map renders, **Then** it shows 3 entries, each with the suggestion's `label` and `source` indicator (curated vs predicted).
2. **Given** the user clicks a mini-map entry, **When** clicked, **Then** auto-scroll + pulse triggers for that suggestion's target element.
3. **Given** the mini-map is displayed, **When** it is positioned, **Then** it uses a fixed position anchored to a configurable corner (default: bottom-right). The anchor corner is set via an initialization option. No drag functionality in v1.
4. **Given** no suggestions are available, **When** the mini-map checks, **Then** it hides itself — no empty panel.
5. **Given** the mini-map is visible, **When** the user presses the kill switch or calls `teardown()`, **Then** it disappears immediately along with all other overlay elements.
6. **Given** the mini-map is displayed, **When** keyboard navigation is used, **Then** entries are focusable via Tab and activatable via Enter/Space. (Constitution §XI)

---

### Edge Cases

- **Target element removed during pulse**: If the DOM element is removed while a pulse is active (dynamic app), the pulse should detect this (via periodic bounding rect check in the rAF tracking loop) and dismiss gracefully.
- **Multiple rapid suggestions**: If the Engine fires new suggestions while a pulse is active, the old pulse should dismiss before the new one appears — no stacking.
- **Z-index wars**: The shadow host should use a high but not maximum z-index. Legacy apps sometimes abuse z-index. A configurable z-index base is advisable.
- **Viewport resize**: Pulse positioning must recalculate on `resize` events.
- **Print media**: The shadow host should be hidden in print stylesheets (`@media print { display: none }`).
- **Touch devices**: Pulse dismiss should work on `touchstart` as well as `click`.
- **RTL layouts**: Label positioning should respect `direction: rtl` if the host app uses it.

## Requirements

### Functional Requirements

- **FR-001**: All UI elements MUST be rendered inside a Shadow DOM attached to `document.body`. (Constitution §I)
- **FR-002**: Styles MUST use Constructable Stylesheets (`new CSSStyleSheet()` + `shadowRoot.adoptedStyleSheets`). No external CSS files, no CSS frameworks, no inline `<style>` fallback. All target evergreen browsers support Constructable Stylesheets. (Constitution §Tech Constraints)
- **FR-003**: Pulse animation MUST highlight the target element without blocking user interaction with it. (Constitution §IV)
- **FR-004**: Pulse positioning MUST track the target element across scroll and resize events using `requestAnimationFrame` or equivalent.
- **FR-005**: Auto-scroll MUST bring off-screen target elements into view before the pulse begins.
- **FR-006**: Auto-scroll MUST detect and scroll the correct scrollable ancestor, not always `window`.
- **FR-007**: Auto-scroll MUST cancel immediately if the user initiates manual scrolling. (Constitution §IV)
- **FR-008**: Every pulsed element MUST display a contextual micro-label with the suggestion's `label` text. (Constitution §III)
- **FR-009**: Labels MUST meet WCAG AA contrast requirements and use a minimum 12px font size. (Constitution §XI)
- **FR-010**: All animations MUST respect `prefers-reduced-motion: reduce` — static alternatives for pulse, instant scroll. (Constitution §XI)
- **FR-011**: All overlay elements MUST be keyboard-navigable and ARIA-compliant. (Constitution §XI)
- **FR-012**: The UI MUST be strictly read-only with respect to the host DOM — no mutations, no style injection into host elements. (Constitution §Tech Constraints)
- **FR-013**: The UI MUST provide a `teardown()` method that removes the shadow host and all event listeners. (Constitution §X)
- **FR-014**: Synchronous UI rendering operations (validate + pulse positioning + label positioning + mini-map update) MUST complete within 50ms of receiving a suggestion. Scroll animation is asynchronous and excluded from this budget. (Constitution §VIII)
- **FR-015**: The UI MUST NOT block, force navigation, or hijack user control at any point. (Constitution §IV)
- **FR-016**: The shadow host MUST be hidden in `@media print`.
- **FR-017**: Pulse dismiss MUST work on `touchstart` as well as `click` for touch device compatibility.
- **FR-018**: Label positioning MUST respect `direction: rtl` if the host app uses right-to-left layouts.
- **FR-019**: When new suggestions arrive while a pulse is active, the old pulse MUST dismiss before the new one renders — no stacking or overlapping highlights.
- **FR-020**: If the target element is removed from the DOM while a pulse is active, the pulse MUST detect removal (via periodic bounding rect check in the rAF position-tracking loop) and dismiss gracefully.
- **FR-021**: The shadow host z-index MUST be configurable via an initialization option (default: a high but non-maximum value) to handle legacy apps with z-index conflicts.
- **FR-022**: Before rendering a pulse for a suggestion, the UI MUST validate that the target element exists in the DOM and is visible. Suggestions targeting non-existent or hidden elements MUST be skipped silently. (Engine does not perform DOM checks — see Engine spec Clarifications.)
- **FR-023**: Rendering operations (pulse, scroll, label) MUST fail independently. A failure in one operation (e.g. label positioning throws) MUST NOT prevent other operations from completing. All errors MUST be caught and silenced. (Constitution §X)
- **FR-024**: The UI MUST expose a `render(suggestions: Suggestion[])` method as its primary input interface, and a `teardown()` method for cleanup. The integration layer calls `render()` on each pipeline cycle.
- **FR-025**: The mini-map panel MUST support a collapse/expand toggle. When collapsed, the panel reduces to a small icon. The toggle button MUST have `role="button"` and `aria-label="Collapse suggestions"` (or "Expand suggestions" when collapsed). (Constitution §XI)
- **FR-026**: The UI MUST accept an optional `onError` callback via `UIConfig` for error observability. When a rendering operation catches an error, the callback is invoked with the `Error` object. The callback itself MUST be wrapped in a try-catch — a throwing callback is silenced and does not propagate. (Constitution §X)

### Key Entities

- **OverlayHost**: The shadow DOM container. Manages lifecycle (create, teardown), holds all overlay elements.
- **PulseRenderer**: Renders the pulsing highlight over a target element. Handles positioning, animation, dismiss logic, reduced-motion fallback.
- **ScrollController**: Handles auto-scroll to off-screen targets. Detects correct scrollable ancestor, cancels on user scroll.
- **LabelRenderer**: Renders contextual micro-labels near target elements. Handles positioning, viewport edge flipping, dismiss sync with pulse.
- **MiniMap**: Optional persistent panel showing current suggestions. Handles entry rendering, click-to-navigate, keyboard nav, show/hide logic.

## Assumptions

- Target browsers support Shadow DOM v1, `requestAnimationFrame`, `IntersectionObserver`, and CSS `@media` queries (all modern evergreen browsers).
- The UI module has zero DOM write access to the host document — all overlay elements live inside the shadow root. Reading host element bounding rects (`getBoundingClientRect()`) and computed styles (for visibility checks) is permitted as read-only access.
- The UI is stateless with respect to workflow position. It renders whatever `Suggestion[]` it receives and does not track which suggestions were previously shown.
- The UI does not interact with Telemetry or Mapper directly. All input comes from the Engine's `Suggestion[]` output, wired by the integration layer (005).
- The Engine does NOT perform DOM existence checks (per Engine spec Clarifications). The UI is responsible for validating that target elements exist before rendering.
- `messy-app.html` is the canonical test fixture for acceptance validation, including the 600px empty space for scroll testing.
- Constructable Stylesheets are the sole styling mechanism. No inline `<style>` fallback is needed — all target evergreen browsers support Constructable Stylesheets (Chrome 73+, Firefox 101+, Safari 16.4+).
- The UI does not require curated path awareness — it treats all suggestions identically based on their `Suggestion` fields. The mini-map uses `source` to display a visual indicator but doesn't change behavior.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Shadow root isolation verified — host CSS with `!important` rules does not affect overlay elements, overlay styles do not leak to host.
- **SC-002**: Pulse on `#save-btn` in `messy-app.html` is visually positioned correctly and does not block clicks on the button.
- **SC-003**: Auto-scroll to `#finalize-transaction-btn` (below 600px gap) brings it into view within the `.workspace` container, not the window.
- **SC-004**: Every rendered suggestion displays a visible, readable label — verified by Playwright screenshot comparison or DOM assertion.
- **SC-005**: With `prefers-reduced-motion: reduce` emulated, pulse shows static highlight and scroll is instant — verified by Playwright.
- **SC-006**: `teardown()` removes all shadow DOM elements and event listeners — verified by checking `document.body.children` count returns to pre-init value.
- **SC-007**: UI rendering completes within 50ms of suggestion receipt (benchmarked).
- **SC-008**: All overlay elements are keyboard-focusable and have appropriate ARIA roles — verified by accessibility audit (Playwright + axe-core or equivalent).
