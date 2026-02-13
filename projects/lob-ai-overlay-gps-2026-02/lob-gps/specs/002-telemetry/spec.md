# Feature Specification: Telemetry Module

**Feature Branch**: `002-telemetry`
**Created**: 2026-02-08
**Status**: Draft
**Input**: Constitution v1.0.0, session.md, Mapper spec (`specs/001-mapper/spec.md`)

## Clarifications

### Session 2026-02-12

- Q: Does `record()` aggregate in-place (update frequency counters per StateKey→selector pair) or store individual raw packets aggregated at query time? → A: Aggregate-on-write. `record()` updates counters in a `{stateKey → {selector → {count, avgDwell, lastSeen}}}` map. Eviction drops least-recently-updated entries. `lastSeenTimestamp` supports the Engine's "Most Recent" tie-breaker.
- Q: Who detects user interactions and assembles `normalizedSelector` + `actionType` for TransitionPackets? → A: The Mapper emits enriched events that include `normalizedSelector` and `actionType`. Telemetry is a pure data pipeline — no DOM coupling, no direct event listeners.
- Q: What triggers a `navigation` action type? → A: SPA-style route changes (`pushState`, `popstate`, hash changes) within the same page load. Full page navigations end the session and are not captured as `navigation` actions.

## Upstream Dependencies

This module consumes types and events defined in the Mapper spec:
- **NormalizedSelector** — stable selector string, never contains dynamic IDs
- **StateKey** — user's current workflow position (`{urlKey}::{normalizedSelector}`)
- **StateChangeEvent** — emitted by Mapper on meaningful DOM transitions
- **Enriched interaction events** — Mapper emits events containing `stateKey`, `normalizedSelector`, and `actionType` for each user interaction. Telemetry is a pure data pipeline with no direct DOM listeners; all interaction detection and selector normalization is upstream in the Mapper.

## User Scenarios & Testing

### User Story 1 - Transition Packet Recording (Priority: P1)

When the Mapper emits an enriched interaction event (containing `stateKey`, `normalizedSelector`, and `actionType`), the telemetry module must create a Transition Packet and pass it to the active provider for storage. Telemetry has no direct DOM coupling — all interaction detection and selector normalization is the Mapper's responsibility. The packet schema is strictly limited to state/selector metadata — no data content.

**Why this priority**: Without recorded transitions, the Engine has nothing to query. This is the write path — the fundamental data pipeline.

**Independent Test**: Wire telemetry to a mock provider, simulate a click sequence on `messy-app.html` (Account ID focus → Save click → Finalize click), and verify 3 Transition Packets are stored with correct fields and no prohibited data.

**Acceptance Scenarios**:

1. **Given** the user clicks `#save-btn`, **When** a Transition Packet is created, **Then** it contains `stateKey` (current StateKey), `normalizedSelector` (`#save-btn`), `actionType` (`click`), and `dwellTime` (ms since last action).
2. **Given** the user focuses on `input[name="ref_code"]` (the dynamic-ID input), **When** a Transition Packet is created, **Then** `normalizedSelector` uses the Mapper's normalized form — never the raw `#ember-id-7721-a`.
3. **Given** the user types into an input field, **When** a Transition Packet is created, **Then** it contains `actionType: "input"` but does NOT contain the input's `value`, `innerText`, or any keystroke data. (Constitution §XIII.2)
4. **Given** a Transition Packet is created, **When** inspected, **Then** it contains a monotonic `timestamp` (ms precision) and a `sessionId` (random per page load, not tied to user identity).
5. **Given** a SPA-style route change occurs (`pushState`, `popstate`, or hash change) within the same page load, **When** a Transition Packet is created, **Then** it contains `actionType: "navigation"` and the `stateKey` reflects the new URL.
6. **Given** the provider's `record()` call throws, **When** the error occurs, **Then** it is caught and silenced — no data is lost from other packets and the host app is unaffected.

---

### User Story 2 - Transition Query Interface (Priority: P1)

The telemetry module must expose a query interface that the Engine can use to retrieve frequency data: "for a given StateKey, what are the most common next actions and how often did each occur?"

**Why this priority**: This is the read path — the Engine depends on it to rank suggestions. Without it, no predictions are possible.

**Independent Test**: Pre-load a provider with known Transition Packets, then query by StateKey and verify the returned frequency map matches expected counts, sorted by frequency descending.

**Acceptance Scenarios**:

1. **Given** 10 recorded transitions from StateKey `A` where 6 go to selector `X`, 3 to `Y`, 1 to `Z`, **When** `query(stateKeyA)` is called, **Then** the result is `[{selector: X, count: 6, avgDwellTime: ..., lastSeenTimestamp: ...}, ...]` sorted by count descending.
2. **Given** a StateKey with no recorded transitions, **When** `query(unknownKey)` is called, **Then** the result is an empty array (not null, not an error).
3. **Given** transitions have been recorded with dwell times, **When** queried, **Then** each result entry includes `avgDwellTime` so the Engine can factor in interaction duration.
4. **Given** the provider's storage is corrupted or unreadable, **When** `query()` is called, **Then** it returns an empty array and logs a warning internally — no throw.

---

### User Story 3 - LocalStorage Provider (Priority: P1)

The first concrete provider implementation. Stores Transition Packets in `localStorage` under a namespaced key. Handles storage limits, data eviction, and serialization.

**Why this priority**: The system needs a working provider for the prototype. LocalStorage is the constitution's mandated starting point (Constitution §Tech Constraints: "Initial prototype uses `localStorage`").

**Independent Test**: Record 100+ transitions via the LocalStorageProvider, reload the page, query back, and verify data survived. Then fill storage to quota and verify eviction works without throwing.

**Acceptance Scenarios**:

1. **Given** a Transition Packet is recorded, **When** the page is reloaded, **Then** `query()` returns data that includes that packet's contribution to frequency counts.
2. **Given** all data is stored under a namespaced key (e.g. `lob-gps:telemetry`), **When** inspected via DevTools, **Then** no data exists outside the namespace — no pollution of the host app's localStorage.
3. **Given** localStorage is at quota, **When** `record()` is called, **Then** the provider evicts the least-recently-updated aggregated entries (by `lastSeenTimestamp`) to make room and successfully stores the new data.
4. **Given** another script corrupts the namespaced key (invalid JSON), **When** the provider reads it, **Then** it discards the corrupt data, reinitializes, and continues operating.
5. **Given** localStorage is completely unavailable (private browsing, disabled), **When** the provider is initialized, **Then** it degrades to in-memory storage for the current session without throwing.
6. **Given** `flush()` is called, **When** executed, **Then** all namespaced telemetry data is removed from localStorage.

---

### User Story 4 - Provider Interface Contract (Priority: P2)

The telemetry module must define an abstract provider interface that the LocalStorageProvider implements and that future providers (Beacon, Proxy) will also implement. This ensures the Engine is decoupled from any specific storage mechanism.

**Why this priority**: P2 because the interface is implicitly defined by US1-3, but formalizing it as a standalone contract matters for extensibility. The system works without this being explicitly specced — but it won't scale cleanly.

**Independent Test**: Create a trivial mock provider that implements the interface, plug it into the telemetry module, and verify record/query/flush work identically to LocalStorageProvider.

**Acceptance Scenarios**:

1. **Given** a class implements `TelemetryProvider`, **When** it provides `record(packet)`, `query(stateKey)`, and `flush()`, **Then** the telemetry module accepts it without modification.
2. **Given** the telemetry module is initialized with a custom provider, **When** transitions are recorded, **Then** they route to the custom provider's `record()` — not to localStorage.
3. **Given** no provider is specified at initialization, **When** the module starts, **Then** it defaults to LocalStorageProvider.
4. **Given** a provider is swapped at runtime (e.g. upgrade from local to Beacon), **When** the swap occurs, **Then** in-flight data is flushed to the old provider before the new one activates.

---

### Edge Cases

- **Storage size**: localStorage is typically 5-10MB. With ~200 bytes per aggregated transition entry, this supports tens of thousands of unique state→action pairs. But a size cap should be configurable (default: 1MB) to leave room for the host app's own localStorage usage.
- **Cross-tab conflicts**: Multiple tabs on the same LOB app will share localStorage. The provider should handle concurrent writes gracefully — last-write-wins with frequency merging is acceptable for v1.
- **Clock skew**: `dwellTime` is computed from `performance.now()` deltas, not wall-clock time, to avoid issues with system clock changes.
- **Rapid interactions**: If a user clicks 10 buttons in 500ms, all 10 transitions should be recorded. No debouncing on the telemetry write path (debouncing belongs in the Mapper's observation layer).
- **Session boundary**: `sessionId` is generated once per page load. Tab refresh = new session. SPA-style route changes (`pushState`, `popstate`, hash changes) do NOT reset the session — they produce `navigation` action type transitions within the existing session. Full page navigations end the session.

## Requirements

### Functional Requirements

- **FR-001**: Telemetry MUST record Transition Packets containing exactly: `stateKey`, `normalizedSelector`, `actionType`, `dwellTime`, `timestamp`, `sessionId`. (Constitution §XIII.1)
- **FR-002**: Telemetry MUST NOT capture input field values, clipboard data, innerText of non-interactive elements, or any other data content. (Constitution §XIII.2)
- **FR-003**: Telemetry MUST use a provider-based architecture with a `TelemetryProvider` interface defining `record()`, `query()`, and `flush()`. (Constitution §XIII.3)
- **FR-004**: The default provider MUST be `LocalStorageProvider`, storing data under a namespaced key. (Constitution §Tech Constraints)
- **FR-005**: `LocalStorageProvider` MUST implement least-recently-updated eviction (by `lastSeenTimestamp`) when storage quota is reached.
- **FR-006**: `LocalStorageProvider` MUST degrade to in-memory storage when localStorage is unavailable.
- **FR-007**: `LocalStorageProvider` MUST handle corrupt stored data by discarding and reinitializing.
- **FR-008**: `query(stateKey)` MUST return frequency-sorted results: `{selector, count, avgDwellTime, lastSeenTimestamp}[]`, or an empty array if no data exists.
- **FR-009**: All provider errors MUST be caught and silenced — telemetry failures must never affect the host app. (Constitution §X)
- **FR-010**: Telemetry data MUST be namespaced to avoid polluting the host app's storage.
- **FR-011**: `dwellTime` MUST be computed using `performance.now()` deltas, not wall-clock time.
- **FR-012**: `sessionId` MUST be a random identifier generated once per page load, not tied to user identity or persisted across sessions.
- **FR-013**: Storage size MUST be configurable with a default cap (1MB) to respect the host app's localStorage budget.
- **FR-014**: `flush()` MUST remove all telemetry data from the active provider.

### Key Entities

- **TransitionPacket**: The atomic unit of telemetry. Fields: `stateKey: StateKey`, `normalizedSelector: NormalizedSelector`, `actionType: 'click' | 'focus' | 'input' | 'navigation'`, `dwellTime: number` (ms), `timestamp: number` (ms, monotonic), `sessionId: string`.
- **FrequencyEntry**: A query result entry. Fields: `selector: NormalizedSelector`, `count: number`, `avgDwellTime: number`, `lastSeenTimestamp: number` (ms, `Date.now()` wall-clock for cross-session comparability — supports Engine tie-breaking).
- **TelemetryProvider**: Abstract interface. Methods: `record(packet: TransitionPacket): void`, `query(stateKey: StateKey): FrequencyEntry[]`, `flush(): void`.
- **LocalStorageProvider**: Concrete provider. Stores aggregate-on-write frequency data in `localStorage` under `lob-gps:telemetry` as a `{stateKey → {selector → {count, avgDwellTime, lastSeenTimestamp}}}` map. Implements least-recently-updated eviction and corruption recovery.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A simulated 3-step workflow on `messy-app.html` produces exactly 3 Transition Packets with correct `stateKey`, `normalizedSelector`, and `actionType` values.
- **SC-002**: No Transition Packet in any test run contains input values, clipboard data, or innerText. Verified by schema validation on every recorded packet.
- **SC-003**: Data recorded via LocalStorageProvider survives a page reload and is queryable with correct frequency counts.
- **SC-004**: When localStorage is at quota, eviction succeeds and the new packet is stored — no data loss on the write, no throw.
- **SC-005**: A custom mock provider can be substituted at init and receives all `record()` calls — verified by mock assertion.
- **SC-006**: 100% unit test coverage on TransitionPacket creation, query aggregation, LocalStorageProvider CRUD, and eviction logic.
- **SC-007**: All provider error paths (corrupt data, quota exceeded, localStorage unavailable) are exercised in tests and confirmed silent.
