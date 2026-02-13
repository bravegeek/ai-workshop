# Data Model: Telemetry Module

**Date**: 2026-02-12 | **Branch**: `002-telemetry`

## Entities

### ActionType

Enum indicating what type of user interaction was detected.

| Value | Description | Trigger |
|---|---|---|
| `click` | User clicked an interactive element | Mouse click / touch tap |
| `focus` | User focused an input or control | Tab navigation / mouse focus |
| `input` | User typed into a field | Keystroke (value NOT captured) |
| `navigation` | SPA-style route change | `pushState`, `popstate`, hash change |

**Constraints**: Exhaustive for v1. The Mapper is responsible for classifying the action type and including it in the enriched event. Full page navigations end the session and are not captured.

### TransitionPacket

The atomic unit of telemetry — a single interaction event received from the Mapper.

| Field | Type | Required | Description |
|---|---|---|---|
| `stateKey` | `StateKey` (from mapper) | yes | User's workflow position when the interaction occurred |
| `normalizedSelector` | `NormalizedSelector` (from mapper) | yes | Stable CSS selector for the element that was acted upon |
| `actionType` | `ActionType` | yes | Type of interaction |
| `dwellTime` | `number` | yes | Milliseconds since last action (`performance.now()` delta) |
| `timestamp` | `number` | yes | Monotonic timestamp (`performance.now()`) at packet creation |
| `sessionId` | `string` | yes | Random identifier, generated once per page load |

**Constraints**:
- `dwellTime` is computed by the Telemetry module from `performance.now()` deltas between consecutive `record()` calls — not provided by the Mapper.
- `timestamp` uses `performance.now()`, not `Date.now()`, to avoid wall-clock skew.
- `sessionId` is a random string (e.g., `crypto.randomUUID()` or `Math.random().toString(36).slice(2)`), never tied to user identity, never persisted across sessions.
- The packet MUST NOT contain input field values, clipboard data, or innerText of non-interactive elements (FR-002).

### FrequencyEntry

A query result entry representing aggregated interaction data for a single selector from a given StateKey.

| Field | Type | Required | Description |
|---|---|---|---|
| `selector` | `NormalizedSelector` | yes | The element selector |
| `count` | `number` | yes | Number of times this selector was acted upon from the queried StateKey |
| `avgDwellTime` | `number` | yes | Average dwell time (ms) before this action |
| `lastSeenTimestamp` | `number` | yes | Timestamp of the most recent interaction (for Engine tie-breaking) |

**Constraints**:
- `query()` returns `FrequencyEntry[]` sorted by `count` descending.
- `lastSeenTimestamp` is stored as `Date.now()` (not `performance.now()`) for cross-session comparability — `performance.now()` resets on each page load.
- If no data exists for a StateKey, `query()` returns `[]` (never null, never throws).

### AggregateEntry

Internal storage representation for a single selector's aggregated data within a StateKey. Not exposed in the public API.

| Field | Type | Storage Key | Description |
|---|---|---|---|
| `count` | `number` | `c` | Interaction count |
| `avgDwellTime` | `number` | `d` | Running average dwell time (ms) |
| `lastSeenTimestamp` | `number` | `t` | `Date.now()` of most recent interaction |

**Constraints**:
- Storage keys are shortened (`c`, `d`, `t`) for space efficiency.
- `avgDwellTime` uses a running average formula: `(oldAvg * (count - 1) + newDwell) / count`.

### StorageEnvelope

The serialized JSON structure persisted in localStorage.

| Field | Type | Storage Key | Description |
|---|---|---|---|
| `version` | `number` | `v` | Schema version (currently `1`) |
| `data` | `Record<StateKey, Record<NormalizedSelector, AggregateEntry>>` | `data` | The aggregate frequency map |

**Constraints**:
- If `v` is missing or unrecognized, data is treated as corrupt and discarded.
- Serialized size must not exceed the configured storage cap (default: 1MB).

### TelemetryProvider

Abstract interface that all providers implement.

| Method | Signature | Description |
|---|---|---|
| `record` | `(packet: TransitionPacket) => void` | Store/aggregate a transition |
| `query` | `(stateKey: StateKey) => FrequencyEntry[]` | Retrieve frequency data for a StateKey |
| `flush` | `() => void` | Remove all telemetry data |

**Constraints**:
- All methods MUST be synchronous (localStorage is synchronous; in-memory is synchronous).
- All methods MUST NOT throw — errors are caught and silenced internally (FR-009).
- `query()` MUST return results sorted by `count` descending (FR-008).

### TelemetryConfig

Configuration object passed to the Telemetry module at initialization.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `provider` | `TelemetryProvider` | no | `LocalStorageProvider` | The active storage provider |
| `storageCap` | `number` | no | `1_048_576` (1MB) | Max bytes for localStorage data |
| `namespace` | `string` | no | `lob-gps:telemetry` | localStorage key prefix |

## Relationships

```
TelemetryConfig ──configures──> Telemetry
Telemetry ──receives──> TransitionPacket (from Mapper enriched events)
Telemetry ──delegates to──> TelemetryProvider (via record/query/flush)

TelemetryProvider <|── LocalStorageProvider (implements)
LocalStorageProvider ──persists──> StorageEnvelope (in localStorage)
StorageEnvelope ──contains──> AggregateEntry (per stateKey→selector pair)

Telemetry ──returns──> FrequencyEntry[] (to Engine via query)
TransitionPacket ──references──> StateKey, NormalizedSelector (from Mapper types)
FrequencyEntry ──references──> NormalizedSelector (from Mapper types)
```

## State Transitions

### Telemetry Lifecycle

```
[Created] ──init(config)──> [Active]
[Active] ──record(packet)──> [Active] (delegates to provider)
[Active] ──query(stateKey)──> [Active] (returns FrequencyEntry[])
[Active] ──flush()──> [Active] (clears provider data)
[Active] ──swapProvider(new)──> [Active] (flushes old, activates new)
[Active] ──teardown()──> [Disposed]
```

- `record()`, `query()`, and `flush()` can be called any time in `Active` state.
- `swapProvider()` flushes the old provider before activating the new one (US4 scenario 4).
- After `teardown()`, all methods should no-op.

### LocalStorageProvider Modes

```
[Constructed] ──localStorage available──> [localStorage mode]
[Constructed] ──localStorage unavailable──> [memory mode]
[localStorage mode] ──record()──> [localStorage mode] (write to localStorage)
[localStorage mode] ──quota exceeded──> [localStorage mode] (LRU evict, then write)
[localStorage mode] ──corrupt data detected──> [localStorage mode] (discard, reinitialize)
[memory mode] ──record()──> [memory mode] (write to Map)
```

- Mode is determined at construction and does not change during the provider's lifetime.
- Corruption recovery is transparent: discard invalid data, start fresh, continue operating.
