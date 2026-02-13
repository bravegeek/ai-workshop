# Data Model: Engine Module

**Date**: 2026-02-13 | **Branch**: `003-engine`

## Entities

### Suggestion

The engine's output unit — a single recommended next action.

| Field | Type | Required | Description |
|---|---|---|---|
| `selector` | `NormalizedSelector` (from mapper) | yes | Stable CSS selector for the suggested target element |
| `label` | `string` | yes | Human-readable "Why" explanation. Curated: verbatim from path. Predicted: tiered template with confidence %. |
| `confidence` | `number` | yes | 0–1 range. Predicted: `count / totalTransitionsFromState`. Curated: always `1.0`. |
| `source` | `'curated' \| 'predicted'` | yes | Origin of the suggestion |
| `avgDwellTime` | `number` | yes | Average milliseconds users spent before this action. Curated: `0`. Predicted: from FrequencyEntry. |
| `curatedPathId` | `string \| undefined` | no | Present only when `source` is `'curated'`. The `id` of the parent CuratedPath. |

**Constraints**:
- `label` is never empty, never null, never a raw selector string.
- `confidence` for predicted suggestions: `count / sum(all counts for this StateKey)`.
- `confidence` for curated suggestions: always `1.0`.
- `avgDwellTime` for curated suggestions: always `0`.
- Predicted labels follow the tiered format: `≥0.5` → `"Most common next action (N%)"`, `≥0.2` → `"Frequently used (N%)"`, `<0.2` → `"Sometimes used (N%)"`.

### CuratedPath

An expert-defined workflow sequence loaded at engine construction time.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | yes | Unique identifier for the path |
| `name` | `string` | yes | Human-readable name for the workflow |
| `steps` | `CuratedStep[]` | yes | Ordered sequence of steps in this path |

**Constraints**:
- `steps` must be ordered by `stepNumber` ascending.
- A path with 0 steps is valid but produces no suggestions.
- Paths are immutable for the engine's lifetime.

### CuratedStep

A single step in a curated path.

| Field | Type | Required | Description |
|---|---|---|---|
| `stateKey` | `StateKey` (from mapper) | yes | The workflow position where this step is relevant |
| `targetSelector` | `NormalizedSelector` (from mapper) | yes | The element the user should interact with next |
| `label` | `string` | yes | Human-readable label explaining this step (e.g. "Step 3: Review billing details") |
| `stepNumber` | `number` | yes | Position in the path sequence (1-based) |

**Constraints**:
- `label` must be non-empty.
- When the current StateKey matches a step's `stateKey` (exact `===`), the engine suggests `targetSelector` of the **next** step in the path (by `stepNumber` order).
- If the user is at the last step, no curated suggestion is produced from that path.

### EngineConfig

Configuration object passed to the Engine at construction.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `maxSuggestions` | `number` | no | `3` | Maximum suggestions returned per query |
| `curatedPaths` | `CuratedPath[]` | no | `[]` | Expert-defined workflows. Order matters: lower index = higher priority for dedup tie-breaking. |
| `telemetryProvider` | `TelemetryProvider` (from telemetry) | yes | — | The read interface for historical transition data |
| `onError` | `(error: Error) => void` | no | `undefined` | Optional error callback for observability. Called inside a try-catch — a failing callback does not propagate. |

**Constraints**:
- `telemetryProvider` is required — the engine cannot function without a data source.
- `curatedPaths` array order is semantically significant (first-registered wins dedup conflicts).
- `onError` is wrapped in its own try-catch by the engine. A throwing callback is silenced.

## Relationships

```
EngineConfig ──configures──> Engine
Engine ──reads from──> TelemetryProvider.query() (returns FrequencyEntry[])
Engine ──indexes──> CuratedPath[] (via CuratedStep.stateKey → next step Map)
Engine ──produces──> Suggestion[] (via query method)

CuratedPath ──contains──> CuratedStep[] (ordered by stepNumber)
CuratedStep ──references──> StateKey, NormalizedSelector (from Mapper types)
Suggestion ──references──> NormalizedSelector (from Mapper types)
FrequencyEntry ──consumed by──> Engine (ranking + confidence computation)
```

## State Transitions

### Engine Lifecycle

```
[Created] ──init(config)──> [Ready]
[Ready] ──query(stateKey)──> [Ready] (returns Suggestion[], stateless)
```

- The engine has no `Observing`, `Disposed`, or other states. It is constructed once and queried repeatedly.
- There is no `teardown()` method. The engine holds no observers, timers, or subscriptions.
- To "disable" the engine, the integration layer stops calling `query()`.
- To update curated paths, construct a new Engine instance.

### Internal Query Flow

```
query(stateKey)
├── TelemetryProvider.query(stateKey) → FrequencyEntry[]
├── Curated index lookup(stateKey) → CuratedStep[] (next steps)
├── Rank predicted suggestions (sort by count desc, then lastSeenTimestamp desc)
├── Generate labels (curated: passthrough, predicted: confidence tier)
├── Merge (curated first, then predicted, dedup by selector)
├── Truncate to maxSuggestions
└── Return Suggestion[]

On any error → onError?.(error) → return []
```
