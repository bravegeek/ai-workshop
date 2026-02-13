# Tasks: Telemetry Module

**Input**: Design documents from `/specs/002-telemetry/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/telemetry.ts, quickstart.md

**Tests**: Included — Constitution §IX mandates test-first, SC-006 requires 100% unit test coverage.

**Organization**: Tasks grouped by user story. US1-US3 are P1, US4 is P2.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create telemetry module directory and define all types

- [x] T001 Create `src/telemetry/` directory structure per plan.md layout: `index.ts`, `types.ts`, `local-storage-provider.ts`, plus co-located test files `index.test.ts`, `types.test.ts`, `local-storage-provider.test.ts`
- [x] T002 Define all types, enums, and interfaces in `src/telemetry/types.ts` — `ActionType` enum, `TransitionPacket`, `FrequencyEntry`, `TelemetryProvider` interface, `TelemetryConfig`, `AggregateEntry` (internal), `StorageEnvelope` (internal). Import `NormalizedSelector` and `StateKey` branded types from `src/mapper/types.ts`. Use contracts/telemetry.ts and data-model.md as reference.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Type validation tests and shared test utilities that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Write TransitionPacket schema validation tests in `src/telemetry/types.test.ts` — verify required fields (`stateKey`, `normalizedSelector`, `actionType`, `dwellTime`, `timestamp`, `sessionId`) are present and correctly typed; verify prohibited fields (input values, clipboard data, innerText) are absent (FR-002, SC-002). Write a `createMockPacket()` helper for reuse across test files.
- [x] T004 [P] Create a `MockProvider` test utility (inline in test files or as a shared helper) that implements `TelemetryProvider` using an in-memory `Map` — stores packets via `record()`, returns `FrequencyEntry[]` via `query()`, clears via `flush()`. This enables US1 and US2 testing without LocalStorageProvider.

**Checkpoint**: Foundation ready — types defined, schema tests passing, mock provider available for story testing

---

## Phase 3: User Story 1 — Transition Packet Recording (Priority: P1) 🎯 MVP

**Goal**: When the Mapper emits an enriched interaction event, the telemetry module creates a TransitionPacket with correct fields and delegates to the active provider. No data content captured. Errors silenced.

**Independent Test**: Wire telemetry to MockProvider, simulate 3 interactions (focus, click, click), verify 3 packets stored with correct `stateKey`, `normalizedSelector`, `actionType`, `dwellTime`, and no prohibited data.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T005 [US1] Write record() tests in `src/telemetry/index.test.ts` — test all 6 acceptance scenarios: (1) click creates packet with correct stateKey/selector/actionType/dwellTime, (2) normalizedSelector uses Mapper's form not raw IDs, (3) input actionType does NOT include value/innerText/keystrokes, (4) packet contains monotonic timestamp and random sessionId, (5) navigation actionType on SPA route change with updated stateKey, (6) provider.record() throw is caught and silenced. Test dwellTime computation via `performance.now()` deltas between consecutive calls. Test sessionId is random per instantiation and stable within a session.

### Implementation for User Story 1

- [x] T006 [US1] Implement Telemetry class in `src/telemetry/index.ts` — constructor accepts `TelemetryConfig` (optional), initializes `sessionId` (random string via `crypto.randomUUID()` or `Math.random().toString(36)`), tracks `lastRecordTime` for dwellTime deltas. Implement `record(stateKey, normalizedSelector, actionType)` that: computes `dwellTime` from `performance.now()` delta, creates `TransitionPacket`, delegates to `provider.record()` in try-catch (FR-009). Implement `flush()` that delegates to `provider.flush()` in try-catch (FR-014). Implement `teardown()` that sets a disposed flag to no-op all methods.

**Checkpoint**: Telemetry.record() works with MockProvider. 3-step simulation produces 3 correct packets. No prohibited data. Errors silenced.

---

## Phase 4: User Story 2 — Transition Query Interface (Priority: P1)

**Goal**: Expose a query interface returning `FrequencyEntry[]` sorted by count descending for a given StateKey. Empty array for unknown keys. Corruption/errors return empty array.

**Independent Test**: Pre-load MockProvider with known data, call `query(stateKey)`, verify counts match and sort order is descending.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T007 [US2] Write query() tests in `src/telemetry/index.test.ts` — test all 4 acceptance scenarios: (1) 10 transitions from stateKey A → returns [{X, 6}, {Y, 3}, {Z, 1}] sorted by count, (2) unknown stateKey → empty array (not null, not error), (3) results include avgDwellTime, (4) corrupted provider → returns empty array and does not throw. Also verify `lastSeenTimestamp` is included in results.

### Implementation for User Story 2

- [x] T008 [US2] Implement `query(stateKey)` method on Telemetry class in `src/telemetry/index.ts` — delegates to `provider.query()` in try-catch (FR-009), returns empty array on error. Validate return type is `FrequencyEntry[]` sorted by count descending.

**Checkpoint**: Telemetry.query() returns correct frequency data from MockProvider. Empty array on unknown keys. Silent on errors.

---

## Phase 5: User Story 3 — LocalStorage Provider (Priority: P1)

**Goal**: Concrete provider storing aggregate-on-write frequency data in `localStorage` under `lob-gps:telemetry`. Handles persistence, eviction, corruption, and in-memory fallback.

**Independent Test**: Record 100+ transitions via LocalStorageProvider, reload, query back — data survived. Fill to quota — eviction works. Corrupt the key — recovery works. Disable localStorage — in-memory fallback works.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T009 [US3] Write LocalStorageProvider tests in `src/telemetry/local-storage-provider.test.ts` — test all 6 acceptance scenarios: (1) recorded data persists across provider re-instantiation (simulates page reload), (2) all data under namespaced key `lob-gps:telemetry` only, (3) LRU eviction by `lastSeenTimestamp` when over storage cap, (4) corrupt JSON → discard and reinitialize, (5) localStorage unavailable → in-memory fallback, (6) flush() removes all namespaced data. Also test: schema versioning (StorageEnvelope `v` field), aggregate running average for `avgDwellTime`, `lastSeenTimestamp` uses `Date.now()` for cross-session comparability, configurable `storageCap` and `namespace`.

### Implementation for User Story 3

- [x] T010 [US3] Implement core LocalStorageProvider in `src/telemetry/local-storage-provider.ts` — constructor accepts config (`storageCap`, `namespace`), implements `record()` with aggregate-on-write: read StorageEnvelope from localStorage, update `{stateKey → {selector → {c, d, t}}}` map (running average for `d`, increment `c`, update `t` with `Date.now()`), serialize and write back. Implement `query()`: read envelope, extract entries for stateKey, map to `FrequencyEntry[]`, sort by count descending. Implement `flush()`: remove namespaced key from localStorage. Wrap all localStorage access in try-catch (FR-009).
- [x] T011 [US3] Implement LRU eviction in `src/telemetry/local-storage-provider.ts` — after each `record()`, check serialized size against `storageCap`. If over cap: collect all stateKeys with max `lastSeenTimestamp`, sort ascending, remove oldest stateKeys until under cap. If single stateKey exceeds cap, evict its least-recently-updated selectors. Per research.md R2.
- [x] T012 [US3] Implement corruption recovery in `src/telemetry/local-storage-provider.ts` — on read, validate JSON parse succeeds, `v` field matches current schema version (currently `1`), `data` field is an object. If any check fails: discard data, reinitialize with empty envelope. If `v` is lower, run migration (placeholder for future). If `v` is higher (downgrade), treat as corrupt. Per research.md R1.
- [x] T013 [US3] Implement in-memory fallback in `src/telemetry/local-storage-provider.ts` — at construction, test localStorage availability via `setItem`/`removeItem` probe. If throws, set `mode: 'memory'` and use `Map<string, Map<string, AggregateEntry>>` with identical aggregation logic. `flush()` clears the Map. Eviction estimates size via entry count. Per research.md R4.
- [x] T014 [US3] Implement cross-tab StorageEvent handling in `src/telemetry/local-storage-provider.ts` — listen for `StorageEvent` on `window` for the namespaced key. On external write: invalidate internal cache so next `record()` re-reads from localStorage before writing. Cleanup listener on provider disposal. Per research.md R3.

**Checkpoint**: LocalStorageProvider passes all 6 acceptance scenarios. Data persists, eviction works, corruption recovers, fallback activates, flush clears. Wire Telemetry class to LocalStorageProvider and verify record→query roundtrip.

---

## Phase 6: User Story 4 — Provider Interface Contract (Priority: P2)

**Goal**: Formalize the TelemetryProvider interface, support provider substitution at init and runtime swap with flush-before-swap semantics.

**Independent Test**: Create a trivial mock provider, plug into Telemetry, verify record/query/flush route correctly. Swap provider at runtime, verify old provider flushed.

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T015 [US4] Write provider contract tests in `src/telemetry/index.test.ts` — test all 4 acceptance scenarios: (1) any class implementing `TelemetryProvider` is accepted, (2) custom provider receives all `record()` calls, (3) no provider specified → defaults to LocalStorageProvider, (4) `swapProvider()` flushes old provider before activating new one. Verify flush is called on old provider (mock assertion).

### Implementation for User Story 4

- [x] T016 [US4] Implement `swapProvider(provider)` on Telemetry class in `src/telemetry/index.ts` — call `flush()` on current provider (in try-catch), replace with new provider. Implement default provider logic: when `TelemetryConfig.provider` is undefined, instantiate `LocalStorageProvider` with config's `storageCap` and `namespace`.

**Checkpoint**: Mock provider substitution works. Default provider is LocalStorageProvider. Runtime swap flushes old provider.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: E2E tests, public API exports, coverage verification

- [x] T017 Write e2e test in `test/e2e/telemetry.spec.ts` — Playwright test: load `messy-app.html`, wire Mapper + Telemetry, perform 3-step workflow (Account ID focus → Save click → Finalize click), verify 3 transitions recorded. Reload page, re-instantiate Telemetry, query, verify data persisted with correct frequency counts (SC-001, SC-003).
- [x] T018 [P] Update `src/index.ts` to re-export all telemetry public API: `Telemetry` class, `LocalStorageProvider` class, and all public types (`ActionType`, `TransitionPacket`, `FrequencyEntry`, `TelemetryProvider`, `TelemetryConfig`) from `src/telemetry/types.ts`.
- [x] T019 Run full test suite (`bun run test`) and verify 100% unit test coverage on TransitionPacket creation, query aggregation, LocalStorageProvider CRUD, and eviction logic (SC-006). Verify all provider error paths exercised and confirmed silent (SC-007).
- [x] T020 Run quickstart.md validation — verify all code examples compile, dev server starts, usage examples work as documented.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — uses MockProvider from T004
- **US2 (Phase 4)**: Depends on US1 — extends the same Telemetry class in `src/telemetry/index.ts`
- **US3 (Phase 5)**: Depends on Foundational — can run in parallel with US1/US2 (different files)
- **US4 (Phase 6)**: Depends on US1, US2, US3 — tests default-to-LocalStorageProvider and swap logic
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: After Foundational → record() with MockProvider
- **US2 (P1)**: After US1 → query() extends same Telemetry class file
- **US3 (P1)**: After Foundational → LocalStorageProvider is an independent file, can be developed in parallel with US1/US2
- **US4 (P2)**: After US1+US2+US3 → needs Telemetry class and LocalStorageProvider for default/swap testing

### Within Each User Story

- Tests MUST be written and FAIL before implementation (Constitution §IX)
- Type definitions before logic
- Core implementation before error handling edge cases
- Story complete before moving to next priority

### Parallel Opportunities

- **T003 and T004** can run in parallel (different test files)
- **US1/US2 and US3** can run in parallel (US1/US2 work on `index.ts`, US3 works on `local-storage-provider.ts`)
- **T017 and T018** can run in parallel (different files: e2e test vs. index.ts exports)
- Within US3: T010 must complete first, then T011-T014 can proceed sequentially (same file)

---

## Parallel Example: US1 + US3

```bash
# These can be developed in parallel by two agents/developers:

# Agent A: US1 (Telemetry class + record)
# T005: Write record() tests in src/telemetry/index.test.ts
# T006: Implement Telemetry.record() in src/telemetry/index.ts

# Agent B: US3 (LocalStorageProvider)
# T009: Write provider tests in src/telemetry/local-storage-provider.test.ts
# T010: Implement core LocalStorageProvider in src/telemetry/local-storage-provider.ts
# T011-T014: Eviction, corruption, fallback, cross-tab (sequential, same file)
```

---

## Implementation Strategy

### MVP First (US1 + MockProvider)

1. Complete Phase 1: Setup (types)
2. Complete Phase 2: Foundational (type tests, MockProvider)
3. Complete Phase 3: US1 (record with MockProvider)
4. **STOP and VALIDATE**: 3-step simulation produces 3 correct packets, no prohibited data
5. This proves the data pipeline works before adding persistence

### Incremental Delivery

1. Setup + Foundational → Types and test infrastructure ready
2. US1 (record) → Write path works with mock → Validate
3. US2 (query) → Read path works with mock → Validate
4. US3 (LocalStorageProvider) → Persistence, eviction, recovery → Validate
5. US4 (provider contract) → Swap, defaults → Validate
6. Polish → E2E, exports, coverage → Ship

### Key Parallelization

- US1/US2 and US3 can be developed simultaneously (different files)
- US4 is the integration story that wires everything together
- E2E tests confirm the full Mapper → Telemetry pipeline works on `messy-app.html`

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Constitution §IX mandates test-first — all test tasks come before implementation
- SC-006 requires 100% unit test coverage
- All provider errors must be silenced (FR-009) — no throw in any code path
- Aggregate-on-write model per clarification Q1 — no raw packet storage
- Telemetry has no DOM coupling per clarification Q2 — pure data pipeline
- `lastSeenTimestamp` uses `Date.now()` (not `performance.now()`) for cross-session comparability
