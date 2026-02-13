# Feature Specification: Engine Module

**Feature Branch**: `003-engine`
**Created**: 2026-02-08
**Status**: Draft
**Input**: Constitution v1.1.0, session.md, Mapper spec, Telemetry spec

## Clarifications

### Session 2026-02-13

- Q: When multiple curated paths match the current StateKey, which path's suggestion wins? → A: All matching curated steps are collected and deduplicated by target selector. When two paths suggest the same target selector, the step from the first-registered path wins (registration order = array index in `EngineConfig.curatedPaths`). This is deterministic per Constitution §XII.
- Q: Should there be a minimum sample threshold before showing predicted suggestions (e.g., 3 transitions)? → A: No threshold. The `confidence` score (count / total) already communicates signal strength — a single transition yields confidence 1.0, which is mathematically correct. Consumers (UI/integration) can apply their own minimum confidence filter if desired. The engine returns all predictions and does not gate on sample size.
- Q: Should the engine perform DOM existence checks to filter stale suggestions? → A: No. The engine is pure computation with zero DOM access. Freshness validation is the responsibility of the integration pipeline (005) or the UI layer (004), which already require DOM access to render overlays. This avoids redundant checks (TOCTOU: element could disappear between engine query and UI render), keeps the engine trivially testable without a DOM environment, and maintains clean separation of concerns — the Mapper owns DOM reads, the Engine owns ranking.
- Q: How should the engine report caught errors for debugging, given that 005-integration exposes `window.LobGPS.errors[]`? → A: Engine accepts an optional `onError?: (error: Error) => void` callback in `EngineConfig`. The integration layer provides a callback that pushes to the error buffer. The engine still returns an empty array on error (FR-015 unchanged). This keeps the query return type clean while providing an observability hook.
- Q: What values should `confidence` and `avgDwellTime` hold for curated suggestions, which have no telemetry data? → A: Curated suggestions use `confidence: 1.0` (authoritative) and `avgDwellTime: 0` (no data). Both fields stay required on all Suggestion instances — no optionality needed.
- Q: What confidence thresholds define predicted label tiers ("Most common", "Frequently used", "Sometimes used")? → A: Three tiers: `≥0.5` → "Most common next action (N%)", `≥0.2` → "Frequently used (N%)", `<0.2` → "Sometimes used (N%)". The percentage is always appended in parentheses.

## Upstream Dependencies

This module consumes types from Mapper and Telemetry:
- **StateKey** (Mapper) — current workflow position, used to query telemetry
- **NormalizedSelector** (Mapper) — stable selector strings identifying DOM targets
- **FrequencyEntry** (Telemetry) — `{selector, count, avgDwellTime, lastSeenTimestamp}[]` returned by `query(stateKey)`. The `lastSeenTimestamp` field (wall-clock `Date.now()`) supports the "Most Recent" tie-breaker in deterministic ranking.
- **TelemetryProvider.query()** (Telemetry) — the read interface for historical transition data

Note: The Telemetry module also defines `ActionType` and `TransitionPacket`, but the engine does not consume these. The engine operates on aggregated frequency data, not raw interaction events.

## User Scenarios & Testing

### User Story 1 - Predictive Suggestion Ranking (Priority: P1)

Given a StateKey, the engine queries telemetry for historical transitions and returns a ranked list of suggested next actions. Ranking is by frequency count, with deterministic tie-breaking. The engine is a pure function: it accepts a StateKey, reads from the TelemetryProvider, and returns suggestions. It maintains no internal state about the user's current position.

**Why this priority**: This is the core intelligence loop — the reason the system exists. Without ranked suggestions, there's nothing to display.

**Independent Test**: Pre-load a mock TelemetryProvider with known frequency data for 3 StateKeys. Call the engine with each StateKey and verify the returned suggestions match expected order and content.

**Acceptance Scenarios**:

1. **Given** telemetry shows StateKey `A` has transitions to selectors `X` (count: 10), `Y` (count: 5), `Z` (count: 2), **When** the engine is queried for StateKey `A`, **Then** it returns suggestions ordered `[X, Y, Z]`.
2. **Given** the engine is configured to return a maximum of 3 suggestions, **When** telemetry has 7 distinct next selectors, **Then** only the top 3 by frequency are returned.
3. **Given** two selectors have equal frequency counts, **When** tie-breaking is applied, **Then** the selector with the most recent `lastSeenTimestamp` wins. (Constitution §XII)
4. **Given** telemetry has no data for the current StateKey, **When** the engine is queried, **Then** it returns an empty suggestion list (not null, not an error).
5. **Given** a suggestion is returned, **When** inspected, **Then** it includes `selector`, `confidence` (normalized 0–1), `source: "predicted"`, `label` (human-readable), and `avgDwellTime`.

---

### User Story 2 - Curated Golden Path Suggestions (Priority: P1)

The engine accepts manually defined "Golden Paths" — expert-authored step sequences. When a curated path is active and the user's current StateKey matches a step via exact string equality, curated suggestions always outrank predicted ones.

**Why this priority**: Same tier as US1. The constitution mandates curated paths take precedence (Constitution §II: "Curated paths always take precedence over predicted ones"). This is also the Day 1 value — the system is useful before any telemetry accumulates.

**Independent Test**: Load a curated path with 4 steps, set the current StateKey to step 2, and verify the engine returns step 3 as the top suggestion with `source: "curated"`, ahead of any predicted suggestions.

**Acceptance Scenarios**:

1. **Given** a curated path defines steps `[S1 → S2 → S3 → S4]` and the current StateKey matches `S2`, **When** the engine is queried, **Then** the top suggestion is `S3` with `source: "curated"`.
2. **Given** a curated suggestion and a predicted suggestion target the same selector, **When** results are merged, **Then** only one entry appears with `source: "curated"` (curated wins, no duplicates).
3. **Given** a curated suggestion exists and predicted suggestions also exist, **When** merged, **Then** curated suggestions appear first, followed by predicted ones. The total count still respects the max suggestion limit.
4. **Given** no curated path matches the current StateKey, **When** the engine is queried, **Then** only predicted suggestions are returned (curated paths don't block or interfere).
5. **Given** multiple curated paths are loaded and more than one matches the current StateKey, **When** results are merged, **Then** all matching curated steps are collected, deduplicated by target selector (first-registered path wins), and placed before predicted suggestions.
6. **Given** a curated step's `stateKey` field, **When** compared to the current StateKey, **Then** matching uses exact string equality (`===`). No partial, prefix, or pattern matching is performed.
7. **Given** a curated suggestion is returned, **When** inspected, **Then** `confidence` is `1.0`, `avgDwellTime` is `0`, and `curatedPathId` matches the parent path's `id`.

---

### User Story 3 - Contextual Labels ("Why" Layer) (Priority: P1)

Every suggestion the engine returns must include a human-readable label explaining why it's being suggested. For curated paths, this comes from the path definition. For predicted suggestions, the engine generates it from frequency context.

**Why this priority**: Constitution §III is explicit — "Providing the 'Why' is as important as the guidance itself." A suggestion without a label is a violation.

**Independent Test**: Query the engine for suggestions and verify every returned suggestion has a non-empty `label` field. Verify curated labels match their path definitions and predicted labels reflect frequency data.

**Acceptance Scenarios**:

1. **Given** a curated path step has label `"Step 3: Review billing details"`, **When** the engine returns that suggestion, **Then** `label` is `"Step 3: Review billing details"`.
2. **Given** a predicted suggestion for selector `#save-btn` with count 42 out of 50 total transitions, **When** the engine returns it, **Then** `label` is auto-generated and includes the confidence percentage (e.g. `"Most common next action (84%)"` or `"Frequently used (84%)"`). The label MUST contain the percentage as a whole number followed by `%`.
3. **Given** a suggestion exists, **When** `label` is inspected, **Then** it is never null, never empty, never a raw selector string, and never a technical identifier.
4. **Given** a predicted suggestion with confidence `≥0.5`, **When** the label is generated, **Then** the label reads `"Most common next action (N%)"`. **Given** confidence `≥0.2` and `<0.5`, **Then** the label reads `"Frequently used (N%)"`. **Given** confidence `<0.2`, **Then** the label reads `"Sometimes used (N%)"`. `N` is always the confidence as a whole-number percentage.

---

### Edge Cases

- **Cold start**: No telemetry and no curated paths loaded. Engine returns empty suggestions for every StateKey. The UI should handle this gracefully (nothing to show is fine).
- **Confidence normalization**: `confidence` is `count / totalTransitionsFromThisState`, where the denominator is computed by summing all `count` values from the `FrequencyEntry[]` returned by `query()`. If there's only 1 recorded transition, confidence is 1.0 — which is mathematically correct. No minimum sample threshold is applied; consumers can filter by confidence if desired.
- **Max suggestions**: Configurable, default 3. Constitution references "Top 3" (session.md §Interview Insights).
- **Performance**: `query()` + ranking + label generation must complete within the sub-50ms budget. The engine is pure computation on small arrays (frequency maps), so this should be trivial — but it must be validated.
- **Curated path registration order**: Paths are ordered by their index in `EngineConfig.curatedPaths`. This order is the tie-breaker when multiple paths suggest the same target selector for a given StateKey.
- **Freshness / stale suggestions**: The engine does NOT filter suggestions by DOM existence. Stale suggestion filtering is the responsibility of downstream consumers (integration pipeline or UI layer) that have DOM access. See Clarifications section.

## Requirements

### Functional Requirements

- **FR-001**: Engine MUST expose a query method that accepts a `StateKey` parameter and returns `Suggestion[]`. The engine MUST NOT maintain internal state about the user's current position — each call is independent. (Stateless design)
- **FR-002**: Engine MUST return suggestions ranked by: Curated > Highest Frequency > Most Recent (`lastSeenTimestamp`). (Constitution §XII)
- **FR-003**: Engine MUST accept curated Golden Path definitions and prioritize them over predicted suggestions. (Constitution §II)
- **FR-004**: Every returned suggestion MUST include a non-empty `label` explaining the "Why." (Constitution §III)
- **FR-005**: Curated step labels MUST come from the path definition verbatim. Predicted labels MUST be auto-generated using confidence tiers: `≥0.5` → `"Most common next action (N%)"`, `≥0.2` → `"Frequently used (N%)"`, `<0.2` → `"Sometimes used (N%)"`, where `N` is the whole-number confidence percentage.
- **FR-006**: Engine MUST query telemetry via the `TelemetryProvider.query()` interface — no direct storage access.
- **FR-007**: Engine MUST return a configurable maximum number of suggestions (default: 3).
- **FR-008**: When a curated and predicted suggestion target the same selector, the curated version MUST win (no duplicates).
- **FR-009**: When multiple curated paths match the same StateKey, all matching steps MUST be collected and deduplicated by target selector. When two paths suggest the same target, the step from the path with the lower index in `EngineConfig.curatedPaths` wins.
- **FR-010**: Curated path step matching MUST use exact string equality (`===`) against the current StateKey. No partial, prefix, or pattern matching.
- **FR-011**: `confidence` MUST be normalized to 0–1 range, computed as `count / totalTransitionsFromState`, where the denominator is the sum of all `count` values in the `FrequencyEntry[]` for that StateKey.
- **FR-012**: Engine MUST return an empty array (not null) when no suggestions are available.
- **FR-013**: Engine MUST be pure computation — no DOM access, no DOM reads, no side effects. All inputs come via method parameters and the TelemetryProvider interface.
- **FR-014**: Full query cycle (telemetry read + ranking + label generation) MUST complete within 50ms. (Constitution §VIII)
- **FR-015**: All errors during query/ranking MUST be caught and result in an empty suggestion list — never a throw. If an `onError` callback is configured, the caught error MUST be forwarded to it before returning the empty array. The callback itself MUST be wrapped in a try-catch (a failing callback must not propagate). (Constitution §X)

### Key Entities

- **Suggestion**: The engine's output unit. Fields: `selector: NormalizedSelector`, `label: string` (the "Why" — human-readable, includes confidence percentage for predicted suggestions), `confidence: number` (0–1; curated suggestions use `1.0`), `source: 'curated' | 'predicted'`, `avgDwellTime: number` (curated suggestions use `0`), `curatedPathId?: string` (present only when `source` is `'curated'`).
- **CuratedPath**: An expert-defined workflow sequence. Fields: `id: string`, `name: string`, `steps: CuratedStep[]`.
- **CuratedStep**: A single step in a curated path. Fields: `stateKey: StateKey`, `targetSelector: NormalizedSelector`, `label: string`, `stepNumber: number`.
- **EngineConfig**: Configuration object. Fields: `maxSuggestions: number` (default 3), `curatedPaths: CuratedPath[]` (order matters — lower index = higher priority), `telemetryProvider: TelemetryProvider`, `onError?: (error: Error) => void` (optional callback for error observability — integration layer uses this to populate `window.LobGPS.errors[]`).

## Assumptions

- The engine is stateless. It computes suggestions fresh on every call and caches nothing between calls.
- The engine has zero DOM access. Freshness validation (filtering suggestions for non-existent elements) is performed by the integration pipeline (005) or UI layer (004).
- Curated paths are provided at engine construction via `EngineConfig` and are immutable for the engine's lifetime. Updating curated paths requires constructing a new engine instance.
- The `TelemetryProvider.query()` method returns `FrequencyEntry[]` sorted by count descending (per Telemetry FR-008). The engine MAY rely on this pre-sorted order but MUST produce correct results regardless of input order.
- `messy-app.html` is the canonical test fixture for performance validation.
- Upstream dependency: the Engine consumes types from Mapper (`StateKey`, `NormalizedSelector`) and Telemetry (`FrequencyEntry`, `TelemetryProvider`). It does not consume `ActionType`, `TransitionPacket`, or any other raw telemetry types.
- The engine does not require a `teardown()` method. It holds no observers, timers, or subscriptions. To "disable" the engine, the integration layer simply stops calling it.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Given known telemetry data, engine returns suggestions in correct frequency order 100% of the time.
- **SC-002**: When a curated path is active, curated suggestions always appear before predicted ones — verified across all test scenarios.
- **SC-003**: Every suggestion returned by the engine has a non-empty, human-readable `label` — validated by test assertion on all outputs. Predicted labels include a confidence percentage.
- **SC-004**: When multiple curated paths match the same StateKey, deduplication and registration-order priority produce deterministic, correct results.
- **SC-005**: Full query cycle completes within 50ms (benchmarked with mock TelemetryProvider returning realistic data volumes).
- **SC-006**: 100% unit test coverage on ranking logic, tie-breaking, curated/predicted merging, label generation, and multi-path conflict resolution.
- **SC-007**: Engine with empty telemetry and no curated paths returns empty arrays without errors — cold start is graceful.
- **SC-008**: All engine tests run without a DOM environment — pure unit tests with mock providers only.
