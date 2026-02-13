# Research: Engine Module

**Date**: 2026-02-13 | **Branch**: `003-engine`

## R1: Ranking Algorithm Design

### Decision

Use a single-pass sort with a composite comparator. No complex data structures needed — the input is a small array (`FrequencyEntry[]`, typically <100 items) and the sort is deterministic.

### Algorithm

1. Query `TelemetryProvider.query(stateKey)` → `FrequencyEntry[]` (already sorted by count desc per Telemetry FR-008, but engine must not depend on this).
2. Compute `totalTransitions = sum(entry.count for entry in entries)`.
3. Map each `FrequencyEntry` to a `Suggestion` with:
   - `confidence = entry.count / totalTransitions`
   - `source = "predicted"`
   - `label` = generated from confidence tier
   - `avgDwellTime = entry.avgDwellTime`
4. Sort by `count` descending, then by `lastSeenTimestamp` descending for ties.
5. Truncate to `maxSuggestions`.

### Rationale

- Single-pass mapping + `Array.sort()` is O(n log n) on tiny arrays — effectively instant.
- No need for a priority queue, heap, or streaming sort.
- The deterministic tie-breaking (frequency then recency) is trivially expressed as a comparator.

### Alternatives Considered

- **Priority queue**: Overkill for arrays of <100 items. Adds complexity for no performance benefit.
- **Pre-sorted trust**: Could skip sorting since Telemetry returns pre-sorted data, but the spec says the engine MUST produce correct results regardless of input order. Defensive sort is cheap and correct.

---

## R2: Curated Path Step Resolution

### Decision

Build a `Map<StateKey, CuratedStep[]>` index at engine construction time from the flattened steps of all registered curated paths. At query time, look up the current StateKey in O(1) and collect the "next step" for each matching path.

### Algorithm

1. At construction: iterate `EngineConfig.curatedPaths` in order. For each path, iterate `steps` sorted by `stepNumber`. For each step, record `{stateKey → nextStep}` in the index, preserving path registration order.
2. At query time: `index.get(currentStateKey)` → `CuratedStep[]` (the next steps from each matching path).
3. Deduplicate by `targetSelector`: if two curated steps suggest the same selector, keep the one from the lower-indexed path (first-registered wins).
4. Convert to `Suggestion` objects with `source: "curated"`, `confidence: 1.0`, `avgDwellTime: 0`, `label` from step definition, `curatedPathId` from parent path.

### Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Index structure | `Map<StateKey, CuratedStep[]>` | O(1) lookup at query time; built once at construction |
| Step ordering | By `stepNumber` ascending | A curated path `[S1→S2→S3→S4]` at S2 suggests S3 (the next step) |
| Last step behavior | No suggestion | If user is at the last step (S4), no curated "next" exists |
| Index key | Full StateKey string | Exact match per FR-010 |

### Edge Cases

- **Empty curated paths array**: Index is empty. Query returns no curated suggestions. This is the cold-start case.
- **Path with 1 step**: The single step's StateKey will never produce a "next step" suggestion (it's already the last). Effectively a no-op path.
- **Duplicate stateKeys within a single path**: Not expected (a path shouldn't visit the same state twice), but handled gracefully — the last occurrence wins within that path.

### Alternatives Considered

- **Linear scan at query time**: Iterating all paths' steps on every query. Works for small path counts but doesn't scale. Map index is marginally more code but O(1) lookup.
- **Trie/prefix matching**: Only relevant if we allowed partial StateKey matching. We use exact match (FR-010), so a Map is sufficient.

---

## R3: Label Generation Strategy

### Decision

Three-tier label system based on confidence thresholds. Curated labels are passthrough (verbatim from path definition). Predicted labels use fixed templates with the confidence percentage interpolated.

### Label Templates

| Tier | Confidence Range | Template | Example |
|---|---|---|---|
| High | `≥ 0.50` | `"Most common next action (N%)"` | `"Most common next action (84%)"` |
| Medium | `≥ 0.20` and `< 0.50` | `"Frequently used (N%)"` | `"Frequently used (35%)"` |
| Low | `< 0.20` | `"Sometimes used (N%)"` | `"Sometimes used (8%)"` |
| Curated | N/A | Verbatim from `CuratedStep.label` | `"Step 3: Review billing details"` |

### Percentage Computation

`N = Math.round(confidence * 100)` — always a whole number, never decimal.

### Rationale

- Fixed templates are trivially testable (string equality assertions).
- Three tiers map to intuitive meanings: majority action, notable minority, rare.
- Confidence percentage gives precise context without exposing raw counts.
- Curated labels bypass the tier system entirely — they're authored by domain experts.

### Alternatives Considered

- **Dynamic label phrasing**: e.g., "84% of users click here next". More informative but harder to test and localize. Fixed templates are simpler for v1.
- **No percentage**: Just "Most common" / "Frequently used". Rejected because the percentage adds precision that helps users calibrate trust.

---

## R4: Merge and Deduplication Strategy

### Decision

Two-phase merge: collect curated suggestions first, then append predicted suggestions, deduplicating by selector and enforcing the max limit.

### Algorithm

1. Collect curated suggestions (from R2 step resolution). These are already deduplicated by target selector.
2. Collect predicted suggestions (from R1 ranking). These are sorted by frequency.
3. Create a `Set<NormalizedSelector>` from curated suggestion selectors.
4. Filter predicted suggestions: exclude any whose selector is already in the curated set (FR-008).
5. Concatenate: `[...curated, ...filteredPredicted]`.
6. Truncate to `maxSuggestions` (FR-007, default 3).

### Rationale

- Curated-first concatenation naturally satisfies FR-002 (curated before predicted).
- Set-based dedup is O(n) and simple.
- Truncation after merge means curated suggestions can "push out" lower-ranked predicted ones if the max limit is tight.

### Edge Cases

- **More curated than maxSuggestions**: Only curated suggestions are returned (predicted get no slots). This is correct — curated always takes priority.
- **Zero curated, zero predicted**: Returns `[]` (FR-012).
- **Curated and predicted both suggest same selector**: Curated wins (FR-008). The predicted version is dropped entirely (not merged).

---

## R5: Error Handling and onError Callback

### Decision

Wrap the entire `query()` method body in a try-catch. On error, invoke the `onError` callback (if configured) inside its own try-catch, then return `[]`.

### Pattern

```
query(stateKey):
  try:
    entries = provider.query(stateKey)
    curated = resolveCurated(stateKey)
    predicted = rank(entries)
    merged = merge(curated, predicted)
    return merged
  catch (error):
    try:
      onError?.(error)
    catch:
      // callback failure is silenced
    return []
```

### Rationale

- Single top-level try-catch is sufficient because the engine is pure computation. No async, no cleanup needed.
- Double-wrapping the `onError` callback prevents a buggy integration layer from breaking the engine's fail-safe guarantee.
- Returning `[]` on error matches the cold-start behavior — the UI simply shows nothing.

### Alternatives Considered

- **Per-function try-catch** (wrap ranker, curated, merger separately): More granular error isolation but adds complexity. A single query call is fast enough that partial results aren't useful — if ranking fails, the whole result is suspect.
- **Error accumulation** (return partial results + errors): Rejected in clarification — the query returns `Suggestion[]` only. Errors go through the callback.
