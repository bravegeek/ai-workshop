# Feature Specification: Engine Module

**Feature Branch**: `engine-module`
**Created**: 2026-02-08
**Status**: Draft
**Input**: Constitution v1.0.0, session.md, Mapper spec, Telemetry spec

## Upstream Dependencies

This module consumes types from Mapper and Telemetry:
- **StateKey** (Mapper) — current workflow position, used to query telemetry
- **NormalizedSelector** (Mapper) — stable selector strings identifying DOM targets
- **FrequencyEntry** (Telemetry) — `{selector, count, avgDwellTime}[]` returned by `query(stateKey)`
- **TelemetryProvider.query()** (Telemetry) — the read interface for historical transition data

## User Scenarios & Testing

### User Story 1 - Predictive Suggestion Ranking (Priority: P1)

Given the current StateKey, the engine queries telemetry for historical transitions and returns a ranked list of suggested next actions. Ranking is by frequency count, with deterministic tie-breaking.

**Why this priority**: This is the core intelligence loop — the reason the system exists. Without ranked suggestions, there's nothing to display.

**Independent Test**: Pre-load a mock TelemetryProvider with known frequency data for 3 StateKeys. Call the engine with each StateKey and verify the returned suggestions match expected order and content.

**Acceptance Scenarios**:

1. **Given** telemetry shows StateKey `A` has transitions to selectors `X` (count: 10), `Y` (count: 5), `Z` (count: 2), **When** the engine is queried for StateKey `A`, **Then** it returns suggestions ordered `[X, Y, Z]`.
2. **Given** the engine is configured to return a maximum of 3 suggestions, **When** telemetry has 7 distinct next selectors, **Then** only the top 3 by frequency are returned.
3. **Given** two selectors have equal frequency counts, **When** tie-breaking is applied, **Then** the selector with the most recent transition wins. (Constitution §XII)
4. **Given** telemetry has no data for the current StateKey, **When** the engine is queried, **Then** it returns an empty suggestion list (not null, not an error).
5. **Given** a suggestion is returned, **When** inspected, **Then** it includes `selector`, `confidence` (normalized 0–1 from frequency), `source: "predicted"`, and `avgDwellTime`.

---

### User Story 2 - Curated Golden Path Suggestions (Priority: P1)

The engine accepts manually defined "Golden Paths" — expert-authored step sequences. When a curated path is active and the user's current StateKey matches a step, curated suggestions always outrank predicted ones.

**Why this priority**: Same tier as US1. The constitution mandates curated paths take precedence (Constitution §II: "Curated paths always take precedence over predicted ones"). This is also the Day 1 value — the system is useful before any telemetry accumulates.

**Independent Test**: Load a curated path with 4 steps, set the current StateKey to step 2, and verify the engine returns step 3 as the top suggestion with `source: "curated"`, ahead of any predicted suggestions.

**Acceptance Scenarios**:

1. **Given** a curated path defines steps `[S1 → S2 → S3 → S4]` and the current StateKey matches `S2`, **When** the engine is queried, **Then** the top suggestion is `S3` with `source: "curated"`.
2. **Given** a curated suggestion and a predicted suggestion target the same selector, **When** results are merged, **Then** only one entry appears with `source: "curated"` (curated wins, no duplicates).
3. **Given** a curated suggestion exists and predicted suggestions also exist, **When** merged, **Then** curated suggestions appear first, followed by predicted ones. The total count still respects the max suggestion limit.
4. **Given** no curated path matches the current StateKey, **When** the engine is queried, **Then** only predicted suggestions are returned (curated paths don't block or interfere).
5. **Given** multiple curated paths are loaded, **When** more than one matches the current StateKey, **Then** [NEEDS CLARIFICATION: which curated path wins? First registered? Most specific? Configurable priority?]

---

### User Story 3 - Contextual Labels ("Why" Layer) (Priority: P1)

Every suggestion the engine returns must include a human-readable label explaining why it's being suggested. For curated paths, this comes from the path definition. For predicted suggestions, the engine generates it from frequency context.

**Why this priority**: Constitution §III is explicit — "Providing the 'Why' is as important as the guidance itself." A suggestion without a label is a violation.

**Independent Test**: Query the engine for suggestions and verify every returned suggestion has a non-empty `label` field. Verify curated labels match their path definitions and predicted labels reflect frequency data.

**Acceptance Scenarios**:

1. **Given** a curated path step has label `"Step 3: Review billing details"`, **When** the engine returns that suggestion, **Then** `label` is `"Step 3: Review billing details"`.
2. **Given** a predicted suggestion for selector `#save-btn` with count 42 out of 50 total transitions, **When** the engine returns it, **Then** `label` is auto-generated (e.g. `"Most common next action (84%)"` or similar — format TBD, but must convey frequency context).
3. **Given** a suggestion exists, **When** `label` is inspected, **Then** it is never null, never empty, never a raw selector string.

---

### User Story 4 - Suggestion Freshness and Invalidation (Priority: P2)

The engine must handle stale data gracefully. If a suggested target selector no longer exists in the DOM (element removed, page navigated), the suggestion should be excluded from results.

**Why this priority**: P2 because the system is functional without it — stale suggestions just won't pulse on anything. But it causes confusion and degrades trust, so it needs addressing before launch.

**Independent Test**: Pre-load telemetry pointing to a selector that doesn't exist in the current DOM. Query the engine and verify that suggestion is excluded from results.

**Acceptance Scenarios**:

1. **Given** telemetry suggests selector `#deleted-element` but `querySelector('#deleted-element')` returns null, **When** the engine is queried, **Then** that suggestion is excluded from results.
2. **Given** a curated path points to a selector that doesn't exist in the current DOM, **When** the engine is queried, **Then** that step is skipped and the next valid step is suggested instead.
3. **Given** all suggestions for a StateKey point to missing elements, **When** the engine is queried, **Then** it returns an empty list.
4. **Given** element existence checking is performed, **When** `querySelector` throws (malformed selector edge case), **Then** the error is caught, that suggestion is excluded, and remaining suggestions are still returned.

---

### Edge Cases

- **Cold start**: No telemetry and no curated paths loaded. Engine returns empty suggestions for every StateKey. The UI should handle this gracefully (nothing to show is fine).
- **Confidence normalization**: `confidence` is `count / totalTransitionsFromThisState`. If there's only 1 recorded transition, confidence is 1.0 — which is technically correct but misleading. Consider a minimum sample threshold (e.g. 3 transitions) before showing predicted suggestions. [NEEDS CLARIFICATION: is a minimum threshold desired?]
- **Max suggestions**: Configurable, default 3. Constitution references "Top 3" (session.md §Interview Insights).
- **Performance**: `query()` + ranking + label generation must complete within the sub-50ms budget. The engine is pure computation on small datasets (frequency maps), so this should be trivial — but it must be validated.
- **Curated path format versioning**: The path JSON schema should include a version field to support future format changes without breaking existing paths.

## Requirements

### Functional Requirements

- **FR-001**: Engine MUST return suggestions ranked by: Curated > Highest Frequency > Most Recent. (Constitution §XII)
- **FR-002**: Engine MUST accept curated Golden Path definitions and prioritize them over predicted suggestions. (Constitution §II)
- **FR-003**: Every returned suggestion MUST include a non-empty `label` explaining the "Why." (Constitution §III)
- **FR-004**: Curated step labels MUST come from the path definition. Predicted labels MUST be auto-generated from frequency context.
- **FR-005**: Engine MUST query telemetry via the `TelemetryProvider.query()` interface — no direct storage access.
- **FR-006**: Engine MUST return a configurable maximum number of suggestions (default: 3).
- **FR-007**: Engine MUST exclude suggestions whose target selector does not resolve to a DOM element.
- **FR-008**: When a curated and predicted suggestion target the same selector, the curated version MUST win (no duplicates).
- **FR-009**: `confidence` MUST be normalized to 0–1 range, computed as `count / totalTransitionsFromState`.
- **FR-010**: Engine MUST return an empty array (not null) when no suggestions are available.
- **FR-011**: Engine MUST be pure computation — no direct DOM mutation, no side effects beyond reading the DOM for element existence checks.
- **FR-012**: Full query cycle (telemetry read + ranking + label generation + DOM existence check) MUST complete within 50ms. (Constitution §VIII)
- **FR-013**: All errors during query/ranking MUST be caught and result in an empty suggestion list — never a throw. (Constitution §X)

### Key Entities

- **Suggestion**: The engine's output unit. Fields: `selector: NormalizedSelector`, `label: string` (the "Why"), `confidence: number` (0–1), `source: 'curated' | 'predicted'`, `avgDwellTime: number`, `curatedPathId?: string`.
- **CuratedPath**: An expert-defined workflow sequence. Fields: `id: string`, `name: string`, `version: number`, `steps: CuratedStep[]`.
- **CuratedStep**: A single step in a curated path. Fields: `stateKey: StateKey`, `targetSelector: NormalizedSelector`, `label: string`, `stepNumber: number`.
- **EngineConfig**: Configuration object. Fields: `maxSuggestions: number` (default 3), `curatedPaths: CuratedPath[]`, `telemetryProvider: TelemetryProvider`.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Given known telemetry data, engine returns suggestions in correct frequency order 100% of the time.
- **SC-002**: When a curated path is active, curated suggestions always appear before predicted ones — verified across all test scenarios.
- **SC-003**: Every suggestion returned by the engine has a non-empty, human-readable `label` — validated by test assertion on all outputs.
- **SC-004**: Suggestions pointing to non-existent DOM elements are excluded — verified by inserting stale selectors into test data.
- **SC-005**: Full query cycle completes within 50ms on `messy-app.html` DOM (benchmarked).
- **SC-006**: 100% unit test coverage on ranking logic, tie-breaking, curated/predicted merging, label generation, and invalidation.
- **SC-007**: Engine with empty telemetry and no curated paths returns empty arrays without errors — cold start is graceful.
