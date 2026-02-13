# Research: Telemetry Module

**Date**: 2026-02-12 | **Branch**: `002-telemetry`

## R1: Aggregate-on-Write Storage Format

### Decision

Store the frequency map as a single JSON object under `localStorage` key `lob-gps:telemetry`. The top-level structure is a versioned envelope wrapping the aggregate map.

### Storage Schema

```json
{
  "v": 1,
  "data": {
    "https://app.example.com/customer::#save-btn": {
      "input[name=\"ref_code\"]": { "c": 6, "d": 1250, "t": 1707123456789 },
      "#finalize-btn": { "c": 3, "d": 800, "t": 1707123400000 }
    }
  }
}
```

Field shortening for storage efficiency:
- `v` → schema version (integer)
- `c` → count
- `d` → avgDwellTime (ms)
- `t` → lastSeenTimestamp (ms, from `performance.now()` + `Date.now()` offset for cross-session comparability)

### Schema Versioning

The `v` field enables forward-compatible migration:
- On read, check `v`. If it matches the current version, parse normally.
- If `v` is lower than current, run a migration function (version-specific transforms).
- If `v` is higher than current (downgrade scenario), treat as corrupt and discard.
- If `v` is missing or data is not valid JSON, treat as corrupt (FR-007).

This handles the deferred clarification concern about schema evolution without requiring a separate migration system.

### Aggregate Update Algorithm

On `record(packet)`:
1. Look up `data[packet.stateKey][packet.normalizedSelector]`.
2. If exists: increment `c`, compute running average for `d` (`(oldAvg * (c-1) + newDwell) / c`), update `t`.
3. If not exists: create `{ c: 1, d: packet.dwellTime, t: timestamp }`.
4. Serialize and write back to localStorage.

### Size Estimation

Per aggregate entry: `~120 bytes` (stateKey ~80 chars + selector ~30 chars + values ~10 chars).
At 1MB cap: `~8,500 entries`. Sufficient for a single LOB app with hundreds of screens.

### Alternatives Considered

- **IndexedDB**: More storage (50MB+), async API. Rejected: adds complexity, localStorage is mandated by constitution for v1.
- **Per-stateKey keys**: One localStorage key per stateKey. Rejected: pollutes namespace, harder to evict and flush.
- **Binary encoding (MessagePack/CBOR)**: More compact. Rejected: adds runtime dependency (Constitution §VII), JSON is sufficient within 1MB.

---

## R2: LRU Eviction Strategy

### Decision

Evict at the stateKey granularity, not individual selector entries. When storage exceeds the configured cap, remove the stateKey whose maximum `lastSeenTimestamp` across all its selector entries is the oldest. Repeat until under cap.

### Why StateKey Granularity

- **Coherence**: A stateKey's selector entries form a related frequency distribution. Evicting individual selectors would leave partial, potentially misleading data for a state.
- **Simplicity**: Fewer iterations needed. Evicting one stateKey removes all its selectors at once.
- **Engine alignment**: The Engine queries by stateKey. A stateKey with partial data is worse than no data (the Engine gracefully handles empty results).

### Eviction Algorithm

1. After each `record()`, check `JSON.stringify(envelope).length` against cap.
2. If over cap, collect all stateKeys with their max `lastSeenTimestamp`.
3. Sort by timestamp ascending (oldest first).
4. Remove stateKeys until size is under cap.
5. If a single stateKey exceeds the cap by itself, evict its least-recently-updated selectors until it fits.

### Cap Enforcement

- Default: 1MB (`1_048_576` bytes).
- Configurable via `TelemetryConfig.storageCap`.
- Size measured by `JSON.stringify()` byte length (UTF-16 → approximate, but consistent and cheap).

### Alternatives Considered

- **LFU (least frequently used)**: Would preserve high-traffic states. Rejected: `lastSeenTimestamp` is already available; LRU is simpler and aligns with the "Most Recent" tie-breaker the Engine uses.
- **Time-based TTL**: Evict entries older than N days. Rejected: wall-clock time is unreliable across sessions, and `performance.now()` resets per page load. Would require `Date.now()`-based timestamps, adding complexity.
- **Selector-level eviction only**: Rejected for coherence reasons above.

---

## R3: Cross-Tab Write Conflict Handling

### Decision

Last-write-wins with read-before-write. No locking, no merge protocol. Accept that concurrent writes from multiple tabs may lose individual increments.

### Rationale

- localStorage is synchronous and single-threaded per tab, but multiple tabs share the same storage.
- Two tabs can both read, modify, and write back — causing one tab's increment to be lost.
- For frequency data, losing occasional increments is acceptable: the data is statistical, not transactional. A count of 42 vs 43 doesn't meaningfully change Engine suggestions.
- The spec explicitly states "last-write-wins with frequency merging is acceptable for v1."

### Mitigation

- Use `StorageEvent` listeners (fires when another tab modifies localStorage) to detect concurrent writes. On receiving a StorageEvent for the telemetry key, reload the in-memory cache from localStorage before the next `record()`.
- This reduces (but doesn't eliminate) lost writes. Full elimination would require a locking protocol, which is not warranted for v1.

### Alternatives Considered

- **SharedWorker as write coordinator**: Single writer, eliminates conflicts. Rejected: adds significant complexity, SharedWorker has limited browser support in some enterprise environments.
- **BroadcastChannel for write coordination**: Simpler than SharedWorker. Rejected: still adds protocol complexity not warranted for v1 statistical data.
- **Optimistic locking (version counter)**: Detect conflicts and retry. Rejected: retry loops add latency and complexity for marginal benefit on statistical data.

---

## R4: In-Memory Fallback Design

### Decision

When `localStorage` is unavailable (private browsing, disabled, SecurityError on access), the `LocalStorageProvider` internally falls back to a `Map<string, Map<string, AggregateEntry>>` with identical aggregation logic. Data is lost on page unload — this is acceptable because the spec (FR-006) only requires "in-memory storage for the current session."

### Detection

Test localStorage availability at provider construction time:
1. Try `localStorage.setItem('lob-gps:test', '1')`.
2. If it succeeds, `localStorage.removeItem('lob-gps:test')` and use localStorage mode.
3. If it throws (`SecurityError`, `QuotaExceededError` on a test write), fall back to in-memory mode.

### Implementation

- The provider maintains a `mode: 'localStorage' | 'memory'` flag set at construction.
- All internal read/write methods dispatch through the flag.
- The in-memory Map uses the same aggregate structure, so `query()` returns identical results.
- `flush()` in memory mode clears the Map.
- Eviction in memory mode follows the same LRU algorithm but checks `Map` size (estimated via entry count × average entry size) rather than serialized string length.

### Alternatives Considered

- **Separate MemoryProvider class**: Would be cleaner architecturally but adds an extra public class to maintain. Since the fallback is transparent (same interface, same behavior, just volatile), keeping it internal to LocalStorageProvider is simpler and matches the spec's language (FR-006 says LocalStorageProvider "degrades to," not "delegates to").
- **SessionStorage fallback**: Similar API, same size limits, but survives tab refresh within a session. Rejected: sessionStorage has the same availability issues as localStorage (both throw in private browsing on some browsers), so it doesn't actually expand compatibility.
