# Data Model: Mapper Module

**Date**: 2026-02-10 | **Branch**: `001-mapper`

## Entities

### SelectorTier

Enum indicating which hierarchy level produced the selector.

| Value | Description | Priority |
|---|---|---|
| `ID` | Stable, unique `id` attribute (non-dynamic) | 1 (highest) |
| `DATA_TESTID` | `data-testid` attribute | 2 |
| `ARIA_LABEL` | `aria-label` attribute | 3 |
| `TEXT_CONTENT` | Closest stable ancestor + tag, with `textHint` metadata | 4 |
| `DOM_PATH` | Structural path using tag names and `:nth-of-type()` | 5 (lowest) |

**Constraints**: Values are ordered by stability. The generator tries each tier in order and stops at the first that produces a unique selector.

### NormalizedSelector

A `string` type alias representing a stable, native `querySelector`-compatible CSS selector.

**Constraints**:
- Never contains dynamic IDs or GUIDs (stripped by normalization).
- For TEXT_CONTENT tier, the string is a standard CSS selector (e.g., `#form-section button`) — no custom pseudo-selectors.
- Must resolve to exactly one element via `document.querySelector()`, or be paired with `textHint` for disambiguation.

### SelectorResult

The return type of selector generation.

| Field | Type | Required | Description |
|---|---|---|---|
| `selector` | `NormalizedSelector` | yes | The generated CSS selector string |
| `tier` | `SelectorTier` | yes | Which hierarchy level produced this selector |
| `ambiguous` | `boolean` | yes | `true` if the selector matches more than one element after all refinement attempts |
| `textHint` | `string \| undefined` | no | Visible text of the target element. Present only for `TEXT_CONTENT` tier selectors. Used as secondary disambiguation filter. |

**Constraints**:
- If `ambiguous` is `false`, `document.querySelectorAll(selector).length === 1` is guaranteed.
- If `ambiguous` is `true`, the selector is the best-effort result. Callers decide whether to use or discard.

### StateKey

A `string` type alias representing the user's current position in the application workflow.

**Format**: `{locationComponent}::{actionComponent}`

| Component | URL Mode | Fingerprint Mode |
|---|---|---|
| `locationComponent` | `origin + pathname` (e.g., `https://app.example.com/customer`) | FNV-1a hash of semantic anchors (8 hex chars, e.g., `a3f2c1b0`) |
| `actionComponent` | The `NormalizedSelector` of the last user action, or empty string for initial page load | Same |
| Separator | `::` | `::` |

**Examples**:
- URL mode, initial load: `https://app.example.com/customer::`
- URL mode, after clicking save: `https://app.example.com/customer::#save-btn`
- Fingerprint mode, after clicking save: `a3f2c1b0::#save-btn`

**Constraints**:
- Deterministic: same URL + same action = same StateKey across sessions.
- The `::` separator must not appear in either component (URLs don't contain `::`, selectors don't contain `::` in practice).

### StateChangeEvent

Emitted when the mapper detects a meaningful DOM transition.

| Field | Type | Required | Description |
|---|---|---|---|
| `previousStateKey` | `StateKey` | yes | The StateKey before the transition |
| `newStateKey` | `StateKey` | yes | The StateKey after the transition |
| `trigger` | `StateChangeTrigger` | yes | What caused the state change |
| `timestamp` | `number` | yes | `performance.now()` value at detection time |

### StateChangeTrigger

Enum indicating what type of DOM mutation triggered the state change.

| Value | Description |
|---|---|
| `CHILD_LIST` | Elements were added or removed from the DOM |
| `VISIBILITY` | A container's visibility changed (display/visibility/hidden attribute toggle) |

**Constraints**: Only these two trigger types are considered "meaningful state changes" per the spec (FR-007). Attribute changes and text content changes are excluded.

### MapperConfig

Configuration object passed to the Mapper at initialization.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `useFingerprinting` | `boolean` | no | `false` | When `true`, StateKeys use semantic fingerprint instead of URL |
| `dynamicIdDenylist` | `string[]` | no | `[]` | Additional RegExp pattern strings for IDs to classify as dynamic |
| `dynamicIdAllowlist` | `string[]` | no | `[]` | RegExp pattern strings for IDs to force-classify as stable (takes precedence over denylist and built-in patterns) |
| `maxAncestorDepth` | `number` | no | `5` | Maximum DOM levels to walk when building path selectors |

**Constraints**:
- Pattern strings are compiled via `new RegExp(pattern)` at initialization. Invalid patterns should throw at construction time.
- `dynamicIdAllowlist` takes precedence over `dynamicIdDenylist`, which takes precedence over built-in framework patterns.

## Relationships

```
MapperConfig ──configures──> Mapper
Mapper ──produces──> SelectorResult (via generateSelector)
Mapper ──produces──> StateKey (via generateStateKey)
Mapper ──emits──> StateChangeEvent (via observe/on)

SelectorResult ──contains──> NormalizedSelector
SelectorResult ──contains──> SelectorTier
StateChangeEvent ──contains──> StateKey (x2: previous + new)
StateChangeEvent ──contains──> StateChangeTrigger
```

## State Transitions

### Mapper Lifecycle

```
[Created] ──init(config)──> [Ready]
[Ready] ──observe()──> [Observing]
[Observing] ──DOM mutation──> [Observing] (emits StateChangeEvent)
[Observing] ──teardown()──> [Disposed]
[Ready] ──teardown()──> [Disposed]
```

- `generateSelector()` and `generateStateKey()` can be called in `Ready` or `Observing` states.
- `teardown()` is idempotent — calling it multiple times is safe.
- Once `Disposed`, no further operations are valid (methods should no-op or throw).
