# Feature Specification: Integration Layer

**Feature Branch**: `005-integration`
**Created**: 2026-02-08
**Status**: Draft
**Input**: Constitution v1.0.0, session.md, Mapper spec, Telemetry spec, Engine spec, UI spec

## Upstream Dependencies

This layer wires all four modules together:
- **Mapper** — provides NormalizedSelector, StateKey, StateChangeEvent
- **Telemetry** — records TransitionPackets via TelemetryProvider, serves FrequencyEntry queries
- **Engine** — consumes Mapper + Telemetry, outputs Suggestion[]
- **UI** — consumes Suggestions, renders pulse/scroll/labels in Shadow DOM

## User Scenarios & Testing

### User Story 1 - Drop-In Script Initialization (Priority: P1)

A single `<script>` tag loads the library into any host page. An optional inline config object controls behavior. The library self-initializes on DOM ready, boots modules in the correct order, and begins observing — all without modifying the host application.

**Why this priority**: Zero-touch deployment is the product's core delivery promise. If initialization is complex or requires host app changes, adoption fails. (Constitution §V)

**Independent Test**: Add `<script src="lob-gps.js"></script>` to `messy-app.html` with no config. Verify the overlay initializes, the shadow host appears, and the mapper begins observing — with zero console errors and zero host DOM mutations.

**Acceptance Scenarios**:

1. **Given** `<script src="lob-gps.js"></script>` is added to a page, **When** the DOM is ready, **Then** the library initializes with default config: LocalStorageProvider, no curated paths, max 3 suggestions.
2. **Given** a config object is provided via `<script>window.LobGPS = { maxSuggestions: 5, curatedPaths: [...] }</script>` before the library script, **When** the library loads, **Then** it reads and applies that config.
3. **Given** the library initializes, **When** the boot sequence runs, **Then** modules start in order: Mapper → Telemetry → Engine → UI. Each module confirms ready before the next begins.
4. **Given** the library is loaded, **When** the global namespace is inspected, **Then** only a single entry point exists (e.g. `window.LobGPS`). No other globals are created. (Constitution §Tech Constraints)
5. **Given** the library script is loaded twice (duplicate `<script>` tags), **When** the second instance initializes, **Then** it detects the existing instance and no-ops — no duplicate overlays, no errors.
6. **Given** the DOM is not yet ready when the script executes, **When** the library waits, **Then** it defers initialization until `DOMContentLoaded` or equivalent.

---

### User Story 2 - Kill Switch (Priority: P1)

A global mechanism to instantly disable the overlay without refreshing the page. Triggered by a key combo or an API call. Tears down all modules cleanly — stops observation, removes the shadow host, disconnects listeners.

**Why this priority**: Constitution §X is explicit — a kill switch must exist. This is a safety net for when the overlay causes problems on a specific page or workflow.

**Independent Test**: Initialize the library on `messy-app.html`, verify the overlay is active, then press the kill switch key combo. Verify all overlay elements are removed, no more state-change events fire, and the host app continues functioning.

**Acceptance Scenarios**:

1. **Given** the overlay is active, **When** the user presses the kill switch combo (default: `Ctrl+Shift+K` or configurable), **Then** the overlay tears down completely within one animation frame.
2. **Given** the overlay is active, **When** `window.LobGPS.disable()` is called, **Then** the overlay tears down identically to the key combo.
3. **Given** the overlay has been disabled, **When** the DOM is inspected, **Then** the shadow host is removed, all MutationObservers are disconnected, all event listeners are removed.
4. **Given** the overlay has been disabled, **When** `window.LobGPS.enable()` is called, **Then** the overlay reinitializes from scratch (fresh Mapper, fresh UI, existing telemetry data preserved).
5. **Given** the kill switch is triggered, **When** teardown runs, **Then** telemetry data in the provider is NOT flushed — historical data survives the disable/enable cycle.
6. **Given** the kill switch key combo conflicts with a host app shortcut, **When** config is provided, **Then** the combo is configurable via `window.LobGPS = { killSwitch: 'Ctrl+Alt+G' }`.

---

### User Story 3 - Error Boundaries (Priority: P1)

Every module boundary has a try-catch wrapper. Any error in Mapper, Telemetry, Engine, or UI is caught, logged internally, and silenced. The host application must never see an unhandled exception from the overlay.

**Why this priority**: Constitution §X — "Any runtime error within the overlay must be caught and silenced to ensure the host application remains functional." A single uncaught throw could break the host app's error handling or crash its JS.

**Independent Test**: Inject faults into each module (throw in Mapper's observer callback, throw in Telemetry's record(), throw in Engine's query(), throw in UI's render()) and verify the host app's own error handler (`window.onerror`) is never triggered.

**Acceptance Scenarios**:

1. **Given** the Mapper's MutationObserver callback throws, **When** the error occurs, **Then** it is caught at the module boundary, the overlay continues operating (or degrades), and no error propagates to `window.onerror` or `unhandledrejection`.
2. **Given** the Telemetry provider's `record()` throws, **When** the error occurs, **Then** the transition is dropped silently, the Mapper and Engine continue operating.
3. **Given** the Engine's query logic throws, **When** the error occurs, **Then** an empty suggestion list is returned to the UI, the overlay shows nothing for this cycle.
4. **Given** the UI's pulse rendering throws, **When** the error occurs, **Then** the suggestion is skipped, the Engine and Mapper continue operating.
5. **Given** errors are caught, **When** logged, **Then** they are logged to an internal buffer (not `console.error` by default — configurable). The buffer is accessible via `window.LobGPS.errors` for debugging.
6. **Given** a cascade of errors causes all modules to fail, **When** the system detects repeated failures (e.g. 5 consecutive errors within 10 seconds), **Then** it auto-disables via the kill switch to stop further interference. [NEEDS CLARIFICATION: is auto-disable desired, or should it keep retrying?]

---

### User Story 4 - Configuration Surface (Priority: P2)

The library exposes a configuration API that controls all tunable behaviors. Config is provided at init time via a global object, and select options can be changed at runtime via the API.

**Why this priority**: P2 because the system works with defaults (US1). But real deployments will need to customize curated paths, provider, UI positioning, and kill switch binding.

**Independent Test**: Initialize with a custom config (different max suggestions, custom kill switch, curated paths), verify each setting takes effect. Then change max suggestions at runtime and verify the next suggestion cycle reflects the change.

**Acceptance Scenarios**:

1. **Given** config `{ maxSuggestions: 5 }`, **When** the Engine returns suggestions, **Then** up to 5 are returned instead of the default 3.
2. **Given** config `{ curatedPaths: [...] }`, **When** the Engine queries, **Then** curated paths are active and prioritized.
3. **Given** config `{ telemetryProvider: customProvider }`, **When** transitions are recorded, **Then** they route to the custom provider.
4. **Given** config `{ killSwitch: 'Ctrl+Alt+G' }`, **When** the user presses `Ctrl+Alt+G`, **Then** the overlay disables.
5. **Given** `window.LobGPS.configure({ maxSuggestions: 1 })` is called at runtime, **When** the next suggestion cycle runs, **Then** only 1 suggestion is returned.
6. **Given** no config is provided, **When** the library initializes, **Then** all defaults are applied: LocalStorageProvider, 3 max suggestions, `Ctrl+Shift+K` kill switch, no curated paths.

---

### User Story 5 - Event Loop: Mapper → Telemetry → Engine → UI (Priority: P1)

The integration layer orchestrates the end-to-end flow: when the Mapper detects a state change, telemetry records the transition, the Engine queries for suggestions, and the UI renders them. This loop is the system's heartbeat.

**Why this priority**: P1 because this is what makes the modules a product rather than four disconnected libraries.

**Independent Test**: On `messy-app.html`, click `#save-btn`. Verify the full pipeline fires: Mapper emits StateChangeEvent → Telemetry records TransitionPacket → Engine queries and returns Suggestions → UI pulses `#finalize-transaction-btn` (if telemetry has data) or shows nothing (cold start). The entire cycle completes within 50ms of the state change.

**Acceptance Scenarios**:

1. **Given** the user clicks `#save-btn` on `messy-app.html`, **When** the Mapper detects the Action Items section appearing, **Then** the full pipeline executes: state change → telemetry record → engine query → UI render.
2. **Given** the pipeline is running, **When** timed end-to-end (state change event to UI pulse visible), **Then** the total duration is under 100ms (50ms per Constitution §VIII, with 50ms budget for DOM observation latency).
3. **Given** the Engine returns no suggestions (cold start), **When** the UI receives an empty list, **Then** no overlay elements are rendered — no empty panels, no errors.
4. **Given** state changes fire rapidly (e.g. user clicking fast), **When** multiple pipeline cycles overlap, **Then** the most recent cycle wins — stale suggestions from earlier cycles are discarded, not rendered.
5. **Given** one module in the pipeline fails (caught by error boundary), **When** the next state change occurs, **Then** the pipeline retries the full cycle — previous failures don't permanently break the loop.

---

### Edge Cases

- **Script load order**: The library must work whether loaded in `<head>` (defers to DOMContentLoaded) or at end of `<body>` (immediate init). `async` and `defer` attributes should both work.
- **CSP restrictions**: Some enterprise environments have strict Content-Security-Policy headers. Constructable Stylesheets avoid `style-src 'unsafe-inline'` issues, but the library should document CSP requirements.
- **Multiple LOB apps in tabs**: Each tab runs its own instance with its own telemetry (localStorage is shared by origin, but namespaced by the library). Cross-tab coordination is out of scope for v1.
- **Memory leaks**: Long-running LOB sessions (8+ hours) must not accumulate detached DOM nodes or unbounded event listener lists. The pipeline should not hold references to old suggestions or stale DOM elements.
- **Hot reload during development**: The library must handle being re-initialized (Vite HMR) without duplicating overlays or observers. The duplicate-detection logic in US1 covers this.

## Requirements

### Functional Requirements

- **FR-001**: Library MUST initialize via a single `<script>` tag with zero host app modifications. (Constitution §V)
- **FR-002**: Library MUST boot modules in order: Mapper → Telemetry → Engine → UI, confirming readiness at each step.
- **FR-003**: Library MUST expose only a single global entry point (`window.LobGPS`). No other global namespace pollution. (Constitution §Tech Constraints)
- **FR-004**: Library MUST detect and no-op on duplicate script inclusion.
- **FR-005**: Kill switch MUST instantly teardown all overlay components without page refresh. (Constitution §X)
- **FR-006**: Kill switch MUST be triggerable via configurable key combo (default: `Ctrl+Shift+K`) and via API (`window.LobGPS.disable()`).
- **FR-007**: `window.LobGPS.enable()` MUST reinitialize the overlay after disable, preserving existing telemetry data.
- **FR-008**: Every module boundary MUST have try-catch error isolation. No overlay error may propagate to `window.onerror` or `unhandledrejection`. (Constitution §X)
- **FR-009**: Caught errors MUST be stored in an internal buffer accessible via `window.LobGPS.errors` for debugging.
- **FR-010**: The full event loop (state change → telemetry → engine → UI) MUST complete within 100ms end-to-end.
- **FR-011**: When multiple pipeline cycles overlap, the most recent MUST win — stale results discarded.
- **FR-012**: Configuration MUST be providable at init time via `window.LobGPS = { ... }` and modifiable at runtime via `window.LobGPS.configure()`.
- **FR-013**: Library MUST work with `async`, `defer`, and synchronous script loading.
- **FR-014**: Teardown MUST NOT flush telemetry data — historical data survives disable/enable cycles.
- **FR-015**: Library bundle MUST be under 50KB gzipped. (Constitution §Tech Constraints)

### Key Entities

- **LobGPS**: The global API object. Methods: `enable()`, `disable()`, `configure(options)`, `teardown()`. Properties: `errors: Error[]`, `version: string`, `isActive: boolean`.
- **LobGPSConfig**: Init-time configuration. Fields: `maxSuggestions: number`, `curatedPaths: CuratedPath[]`, `telemetryProvider?: TelemetryProvider`, `killSwitch: string` (key combo), `debug: boolean` (enables console logging of caught errors).
- **Pipeline**: Internal orchestrator. Listens for Mapper's StateChangeEvents, triggers Telemetry record → Engine query → UI render. Handles cycle cancellation and error isolation.

## Success Criteria

### Measurable Outcomes

- **SC-001**: `<script src="lob-gps.js"></script>` on `messy-app.html` initializes without errors, shadow host appears, mapper observes — verified by Playwright.
- **SC-002**: Kill switch (`Ctrl+Shift+K`) removes all overlay elements and stops all observation — verified by checking DOM and event listener counts pre/post.
- **SC-003**: `enable()` after `disable()` restores the overlay with telemetry data intact — verified by querying telemetry after re-enable.
- **SC-004**: Injected faults in each module do not trigger `window.onerror` — verified by setting a trap handler and asserting zero calls.
- **SC-005**: Full pipeline (click → pulse visible) completes within 100ms on `messy-app.html` — benchmarked via Playwright performance timing.
- **SC-006**: Duplicate `<script>` tags result in exactly one overlay instance — verified by counting shadow hosts.
- **SC-007**: Final bundle is under 50KB gzipped — verified by build output.
- **SC-008**: Library works with `async`, `defer`, and sync loading — verified by 3 Playwright test variants.
