# Feature Specification: Mapper Module

**Feature Branch**: `001-mapper`
**Created**: 2026-02-08
**Status**: Draft
**Input**: Constitution v1.0.0, session.md, messy-app.html test page

## Clarifications

### Session 2026-02-10

- Q: Which strategy should NormalizedSelector use for text-content matching — custom pseudo-selector or stable ancestor + text encoding? → A: Stable ancestor + text encoding. The CSS selector targets the closest stable ancestor + tag (native `querySelector`-compatible), with visible text stored as a separate `textHint` metadata annotation.
- Q: What should the mapper return when a selector cannot be made unique (ambiguous)? → A: Return a result object (`SelectorResult`) containing the selector string, the `SelectorTier`, and an `ambiguous: boolean` flag. Callers decide whether to use or discard it.
- Q: Which DOM mutations count as "meaningful state changes" beyond the examples in US4? → A: Structural + visibility only. Only childList additions/removals and style/class changes affecting visibility of containers with interactive children. Attribute and text changes on existing elements are ignored.
- Q: What format should allowlist/denylist entries use for ID classification overrides? → A: JavaScript RegExp pattern strings (ECMAScript regex dialect), compiled via `new RegExp()`. Examples below in FR-003.
- Q: How should page fingerprinting mode be activated? → A: Global config flag (`useFingerprinting: boolean`) passed at mapper initialization. Per-call override is out of scope for v1 but the API should not preclude adding it later.

## User Scenarios & Testing

### User Story 1 - Stable Selector Generation (Priority: P1)

When the overlay observes a user interaction (click, focus, input) on a host DOM element, it must generate a normalized, stable selector string that can reliably re-locate that element across page loads and sessions — even when the DOM contains dynamic IDs, injected noise, and shifting content.

**Why this priority**: Everything downstream (telemetry, engine, UI pulse targeting) depends on selectors that don't break between sessions. If selectors are fragile, the entire system is unreliable.

**Independent Test**: Given `messy-app.html`, click each interactive element and verify the generated selector can `querySelector` back to the same element after a full page reload.

**Acceptance Scenarios**:

1. **Given** an element with a stable unique ID (e.g. `#save-btn`), **When** a selector is generated, **Then** the result is `#save-btn`.
2. **Given** an element with a dynamic ID matching known patterns (e.g. `#ember-id-7721-a`), **When** a selector is generated, **Then** the dynamic ID is ignored and the selector falls through to the next tier (e.g. `input[name="ref_code"]`).
3. **Given** an element with a `data-testid` attribute, **When** a selector is generated, **Then** the result uses `[data-testid="value"]`.
4. **Given** an element with an `aria-label` but no stable ID or data-testid, **When** a selector is generated, **Then** the result uses `[aria-label="value"]`.
5. **Given** an interactive element (button, link) with unique visible text but no stable attributes, **When** a selector is generated, **Then** the result uses the closest stable ancestor as a CSS selector scope combined with a tag match (e.g. `#form-section button`), with the visible text stored as a separate metadata annotation — not embedded in the selector string. The selector itself remains native `querySelector`-compatible.
6. **Given** an element with no stable attributes at all, **When** a selector is generated, **Then** a DOM path selector is produced using tag names, nth-child indices, and stable ancestor anchors.
7. **Given** any generated selector, **When** `document.querySelector(selector)` is called, **Then** it returns exactly one element — the original target. For TEXT_CONTENT tier selectors where the CSS selector alone may match multiple elements, the `textHint` metadata is used as a secondary filter to resolve to the correct element.

---

### User Story 2 - Dynamic ID Detection (Priority: P1)

The mapper must detect and discard auto-generated or dynamic IDs so they never pollute selectors or StateKeys. Common patterns include framework-generated IDs (Ember, Angular, React), GUIDs, and numeric suffixes.

**Why this priority**: Same tier as US1 — dynamic IDs are the most common cause of selector breakage in legacy LOB apps. Without this, selectors rot immediately.

**Independent Test**: Feed a set of known dynamic ID patterns to the detector and verify 100% correct classification. Then verify against `messy-app.html` where `#ember-id-7721-a` must be flagged.

**Acceptance Scenarios**:

1. **Given** an ID matching `ember-*`, `ember\d+`, or `ember-id-*`, **When** evaluated, **Then** it is classified as dynamic.
2. **Given** an ID matching a GUID pattern (e.g. `a1b2c3d4-e5f6-...`), **When** evaluated, **Then** it is classified as dynamic.
3. **Given** an ID with a numeric suffix that changes across loads (e.g. `field_8832`, `input-row-42`), **When** evaluated, **Then** it is classified as dynamic. *(Note: this requires heuristic tuning — see Edge Cases.)*
4. **Given** a stable, human-authored ID (e.g. `save-btn`, `acc_id_input`), **When** evaluated, **Then** it is classified as stable.
5. **Given** an ID matching Angular patterns (e.g. `ng-*`, `_ngcontent-*`, `cdk-*`), **When** evaluated, **Then** it is classified as dynamic.
6. **Given** a configurable allowlist/denylist, **When** an ID matches an allowlist entry, **Then** it is always treated as stable regardless of pattern matching.

---

### User Story 3 - StateKey Generation (Priority: P1)

The mapper must produce a StateKey representing "where the user is" in the application. The default formula is `URL + LastActionSelector`. For apps with fragile or identical URLs across screens, it must support a page fingerprinting fallback using semantic anchors.

**Why this priority**: The engine uses StateKeys to look up what to suggest next. Wrong or colliding StateKeys mean wrong suggestions.

**Independent Test**: Navigate through `messy-app.html`'s multi-step workflow (load → type in Account ID → click Save → Finalize appears) and verify that each state transition produces a distinct, deterministic StateKey.

**Acceptance Scenarios**:

1. **Given** a page load with no prior action, **When** a StateKey is generated, **Then** it contains the current URL (origin + pathname) and a null/empty action component.
2. **Given** the user clicks `#save-btn`, **When** a StateKey is generated, **Then** it equals `{url}::#save-btn` (or equivalent encoding).
3. **Given** the same action is performed on the same URL across two sessions, **When** StateKeys are compared, **Then** they are identical.
4. **Given** page fingerprinting is enabled, **When** a StateKey is generated, **Then** it incorporates semantic anchors (e.g. the text of the first `<h1>`/`<h3>`, unique button labels) instead of or in addition to the URL.
5. **Given** a dynamic noise div is injected (e.g. the random `MSG_ID` label in messy-app), **When** a StateKey is generated, **Then** the noise does not affect the key — the fingerprint ignores non-semantic, dynamically injected elements.
6. **Given** two different pages at the same URL but with different semantic content, **When** StateKeys are generated, **Then** they differ (fingerprinting disambiguates).

---

### User Story 4 - DOM Observation (Priority: P2)

The mapper must observe the host DOM for meaningful state changes (element visibility, new interactive elements appearing, navigation) using MutationObserver and report state transitions to the telemetry and engine layers.

**Why this priority**: Required for the system to react to dynamic content (like `messy-app.html`'s hidden Action Items section appearing after Save), but US1-3 can be validated without it.

**Independent Test**: Load `messy-app.html`, click Save, verify the mapper detects the `.dynamic-list` becoming visible and emits a state-change event with the correct new StateKey.

**Acceptance Scenarios**:

1. **Given** a hidden element becomes visible (e.g. `display: none` → `display: block`), **When** that element contains interactive children, **Then** the mapper emits a `state-change` event.
2. **Given** new DOM nodes are inserted (e.g. the noise div), **When** the nodes are non-interactive and match noise heuristics, **Then** no state-change event is emitted.
3. **Given** the workspace scrolls, **When** no new elements appear or become interactive, **Then** no state-change event is emitted (scroll alone is not a state change).
4. **Given** the mapper is observing, **When** the observation is torn down (e.g. kill switch), **Then** all MutationObservers are disconnected and no further events fire.
5. **Given** the MutationObserver callback throws, **When** the error occurs, **Then** it is caught and silenced — the host app is unaffected.

---

### Edge Cases

- **Numeric suffix ambiguity**: IDs like `section-2` may be stable (authored) or dynamic (generated). The system should default to treating them as stable unless they change across page loads. A configurable denylist pattern can override this.
- **Iframes**: Out of scope for v1. The mapper should not attempt to observe inside iframes. Document this limitation.
- **Shadow DOM in host app**: If the host app itself uses Shadow DOM, the mapper cannot observe inside those shadow roots. Document this limitation.
- **Very deep DOM trees**: DOM path selectors should cap depth (e.g. max 5 ancestors) to avoid brittle long paths.
- **Multiple elements matching a selector**: If a generated selector matches more than one element, the mapper must attempt to refine it (add nth-child). If still ambiguous after exhausting all tiers, return a `SelectorResult` with `ambiguous: true`; callers decide how to handle it.
- **Rapid-fire mutations**: The observer must debounce or batch mutations to avoid flooding downstream with events. Target: coalesce within a single animation frame.

## Requirements

### Functional Requirements

- **FR-001**: Mapper MUST generate selectors following the hierarchy: Unique ID > `data-testid` > `aria-label` > Text Content (interactive elements) > DOM Path. (Constitution §Dev Workflow #3)
- **FR-002**: Mapper MUST detect and discard dynamic IDs matching known framework patterns (Ember, Angular, React) and GUID formats. (Constitution §Dev Workflow #4)
- **FR-003**: Mapper MUST support a configurable allowlist/denylist for ID classification overrides. Entries are JavaScript RegExp pattern strings (ECMAScript dialect), compiled at initialization via `new RegExp(pattern)`. Allowlist patterns force-classify matching IDs as stable; denylist patterns force-classify as dynamic. Allowlist takes precedence over denylist. Examples:
  - Denylist: `"^section-\\d+$"` (treat `section-1`, `section-42` as dynamic), `"^row-item-"` (treat any `row-item-*` as dynamic)
  - Allowlist: `"^app-header$"` (preserve `app-header` as stable even if it matches a denylist pattern), `"^nav-\\d+$"` (treat authored `nav-1`, `nav-2` as stable)
- **FR-004**: Mapper MUST generate deterministic StateKeys using URL + LastActionSelector as the default formula. (Constitution §Dev Workflow #2)
- **FR-005**: Mapper MUST support a page fingerprinting mode using semantic anchors (headings, unique button text) for StateKey generation. Fingerprinting is enabled via a `useFingerprinting: boolean` configuration flag passed at mapper initialization. When `true`, all StateKeys use a semantic fingerprint in place of the URL component. Per-call fingerprinting overrides are out of scope for v1, but the StateKey generation API should accept an options parameter to allow this extension in future versions without breaking changes. (Constitution §Dev Workflow #2)
- **FR-006**: Mapper MUST normalize selectors by stripping GUIDs and dynamic components before output. (Constitution §XII)
- **FR-007**: Mapper MUST observe the host DOM for meaningful state changes via MutationObserver and emit structured events. A "meaningful state change" is defined as: (1) childList mutations that add or remove DOM nodes containing interactive elements, or (2) style/class attribute changes that toggle visibility (`display`, `visibility`, `hidden` attribute) of containers with interactive children. Attribute changes and text content changes on existing elements are NOT considered meaningful state changes.
- **FR-008**: Mapper MUST debounce/batch mutation events to prevent event flooding (coalesce within one animation frame).
- **FR-009**: Mapper MUST NOT read, capture, or expose input field values, clipboard data, or innerText of non-interactive elements. (Constitution §XIII.2)
- **FR-010**: Mapper MUST wrap all host DOM interactions in try-catch boundaries. Any error MUST be silenced. (Constitution §X)
- **FR-011**: Mapper MUST be read-only with respect to the host DOM — no mutations, no style changes, no attribute modifications. (Constitution §Tech Constraints)
- **FR-012**: Mapper MUST provide a `teardown()` method that disconnects all observers and removes all event listeners.
- **FR-013**: Selector generation MUST complete within 5ms for a single element. (Supports Constitution §VIII sub-50ms target with budget for other layers.)
- **FR-014**: Generated selectors MUST be unique — `querySelectorAll(selector).length === 1`. If uniqueness cannot be achieved after exhausting all tiers, the mapper MUST return a `SelectorResult` with `ambiguous: true` containing the best-effort selector. Callers decide whether to use or discard ambiguous results.

### Key Entities

- **NormalizedSelector**: A stable, native `querySelector`-compatible CSS selector string for a host DOM element. Never contains dynamic IDs or GUIDs. For TEXT_CONTENT tier selectors, the CSS selector targets the closest stable ancestor + tag, and a separate `textHint` metadata field carries the visible text for disambiguation — the selector string itself contains no custom pseudo-selectors.
- **StateKey**: A string representing the user's current position in the application workflow. Format: `{urlKey}::{normalizedSelector}` or `{fingerprint}::{normalizedSelector}`.
- **StateChangeEvent**: An object emitted when the mapper detects a meaningful DOM transition. Contains: `previousStateKey`, `newStateKey`, `trigger` (mutation type), `timestamp`.
- **SelectorResult**: The return type of selector generation. Contains: `selector` (NormalizedSelector string), `tier` (SelectorTier), `ambiguous` (boolean — true if the selector matches more than one element after all refinement attempts), and optionally `textHint` (string — visible text for TEXT_CONTENT tier selectors).
- **SelectorTier**: Enum indicating which hierarchy level was used: `ID`, `DATA_TESTID`, `ARIA_LABEL`, `TEXT_CONTENT`, `DOM_PATH`.

## Assumptions

- Target browsers support MutationObserver, `querySelectorAll`, and `performance.now()` (all modern evergreen browsers).
- The host DOM is a standard HTML document — no XML or XHTML namespacing.
- `messy-app.html` is the canonical test fixture for acceptance validation.
- The Mapper operates within the overlay's Shadow DOM execution context but reads the host DOM in read-only mode.
- Dynamic ID patterns are finite and enumerable; new framework ID patterns (beyond Ember, Angular, React) may require allowlist/denylist configuration updates, not code changes.
- Upstream dependency: the Mapper defines types (NormalizedSelector, StateKey, StateChangeEvent, SelectorTier) consumed by Telemetry, Engine, and UI modules.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All interactive elements in `messy-app.html` produce selectors that survive a page reload (re-query returns the same element).
- **SC-002**: Dynamic ID `#ember-id-7721-a` is correctly classified as dynamic and excluded from selectors in 100% of test runs.
- **SC-003**: The multi-step workflow in `messy-app.html` (load → Save → Finalize appears) produces 3 distinct, deterministic StateKeys.
- **SC-004**: Injected noise divs (random `MSG_ID` labels) do not alter StateKeys or trigger false state-change events.
- **SC-005**: Selector generation for any single element completes in under 5ms (benchmarked on the test page DOM).
- **SC-006**: 100% unit test coverage on selector generation, dynamic ID detection, and StateKey generation logic (Constitution §IX).
- **SC-007**: `teardown()` disconnects all observers — verified by confirming zero event emissions after teardown.
