# Data Model: UI Module

**Date**: 2026-02-17 | **Branch**: `004-ui`

## Entities

### UIConfig

Configuration object passed to the OverlayUI at construction.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `zIndex` | `number` | no | `2147483646` | Base z-index for the shadow host element. Uses `MAX_SAFE_INTEGER - 1` as default to sit above most host app content without claiming the absolute maximum. |
| `miniMapAnchor` | `MiniMapAnchor` | no | `'bottom-right'` | Which viewport corner the mini-map panel anchors to |
| `onError` | `(error: Error) => void` | no | `undefined` | Optional error callback. Called inside a try-catch — a failing callback does not propagate. Integration layer uses this to populate `window.LobGPS.errors[]`. |

**Constraints**:
- `zIndex` must be a positive integer.
- `onError` is wrapped in its own try-catch by the UI module. A throwing callback is silenced.
- Config is provided at construction and is immutable for the UI instance's lifetime.

### MiniMapAnchor

Union type for mini-map positioning.

| Value | Description |
|---|---|
| `'top-left'` | Panel anchored to top-left corner of viewport |
| `'top-right'` | Panel anchored to top-right corner of viewport |
| `'bottom-left'` | Panel anchored to bottom-left corner of viewport |
| `'bottom-right'` | Panel anchored to bottom-right corner of viewport (default) |

### OverlayHost

The Shadow DOM container manager. Not exposed publicly — internal to the UI module.

| Field | Type | Description |
|---|---|---|
| `hostElement` | `HTMLDivElement` | The `<div>` appended to `document.body` |
| `shadowRoot` | `ShadowRoot` | Open shadow root (`mode: 'open'`) attached to `hostElement` |
| `stylesheet` | `CSSStyleSheet` | Constructable Stylesheet adopted by the shadow root |

**Lifecycle states**:

```
[None] ──create()──> [Active]
[Active] ──teardown()──> [Disposed]
[Disposed] ──(terminal)──> (no further operations)
```

**Constraints**:
- `create()` appends a `<div>` to `document.body` and attaches an open shadow root.
- `teardown()` removes the host element, clears the shadow root, and is idempotent.
- If Shadow DOM is unsupported, `create()` fails silently and the UI degrades to no-op.

### PulseState

Internal state tracked per active pulse.

| Field | Type | Description |
|---|---|---|
| `targetElement` | `Element` | The host DOM element being highlighted |
| `pulseElement` | `HTMLDivElement` | The highlight overlay element (inside shadow root) |
| `labelElement` | `HTMLDivElement \| null` | The micro-label element (inside shadow root), if rendered |
| `animationFrameId` | `number` | Current rAF handle for position tracking |
| `abortController` | `AbortController` | Controls event listener cleanup for this pulse |

**Constraints**:
- Only one pulse is active at a time. New suggestions dismiss the current pulse before rendering.
- When the pulse is dismissed, `cancelAnimationFrame(animationFrameId)` is called and the abort controller is signaled.
- `targetElement` is a reference to a host DOM element (read-only access for `getBoundingClientRect()`).

### ScrollState

Internal state tracked during an active auto-scroll.

| Field | Type | Description |
|---|---|---|
| `scrollContainer` | `Element \| Window` | The scrollable ancestor being scrolled |
| `targetElement` | `Element` | The element to scroll into view |
| `abortController` | `AbortController` | Controls cancellation (user scroll detection + cleanup) |
| `reducedMotion` | `boolean` | Whether `prefers-reduced-motion: reduce` is active |

**Constraints**:
- Auto-scroll completes before pulse begins (sequential, not simultaneous).
- If the user initiates manual scrolling during auto-scroll, the scroll cancels immediately.
- `reducedMotion` determines scroll behavior: `instant` vs `smooth`.

## Relationships

```
UIConfig ──configures──> OverlayUI
OverlayUI ──manages──> OverlayHost (shadow DOM lifecycle)
OverlayUI ──creates──> PulseRenderer (per render cycle)
OverlayUI ──creates──> ScrollController (per render cycle)
OverlayUI ──creates──> LabelRenderer (per render cycle)
OverlayUI ──creates──> MiniMap (persistent, updated per render cycle)

OverlayUI ──receives──> Suggestion[] (from Engine, via Integration layer)
PulseRenderer ──reads──> Element.getBoundingClientRect() (host DOM, read-only)
ScrollController ──reads──> Element.scrollHeight, Element.clientHeight (host DOM, read-only)
LabelRenderer ──reads──> Element.getBoundingClientRect() (host DOM, read-only)
MiniMap ──triggers──> ScrollController + PulseRenderer (on entry click)

PulseState ──tracks──> active pulse per suggestion
ScrollState ──tracks──> active scroll per suggestion
```

## State Transitions

### OverlayUI Lifecycle

```
[Created] ──init(config)──> [Ready]
[Ready] ──render(suggestions)──> [Rendering]
[Rendering] ──complete──> [Ready]
[Ready] ──teardown()──> [Disposed]
[Rendering] ──teardown()──> [Disposed]
```

- `render()` can be called repeatedly. Each call dismisses the previous pulse/label before rendering new ones.
- `teardown()` is idempotent. It cleans up the shadow host, all event listeners, and any active pulse/scroll state.
- After `Disposed`, `render()` calls are no-ops.

### Render Flow (per suggestion cycle)

```
render(suggestions)
├── Validate suggestions (filter non-existent/hidden targets — FR-022)
├── Dismiss current pulse + label if active (FR-019)
├── If suggestions is empty or all filtered out → no-op (hide mini-map)
├── Update MiniMap entries (if mini-map enabled)
├── For top suggestion:
│   ├── Check target visibility
│   ├── If off-screen → ScrollController.scrollTo(target)
│   │   ├── Detect scrollable ancestor
│   │   ├── Smooth scroll (or instant if prefers-reduced-motion)
│   │   ├── Listen for user scroll → cancel
│   │   └── Wait for scroll complete → continue
│   ├── PulseRenderer.pulse(target)
│   │   ├── Create pulse element in shadow root
│   │   ├── Position over target (getBoundingClientRect)
│   │   ├── Start rAF position tracking loop
│   │   ├── Start animation (or static highlight if reduced motion)
│   │   └── Listen for dismiss triggers (click, touchstart, timeout)
│   └── LabelRenderer.show(target, label)
│       ├── Create label element in shadow root
│       ├── Position near target
│       ├── Flip if near viewport edge
│       └── Sync dismiss with pulse
└── On any error per operation → catch, silence, continue next (FR-023)
```

### Pulse Dismiss Triggers

```
[Active Pulse]
├── User clicks target element → dismiss
├── User clicks elsewhere → dismiss
├── User touches (touchstart) → dismiss
├── New render() call → dismiss (replaced)
├── Target element removed from DOM → dismiss
├── teardown() called → dismiss
└── Kill switch triggered (via Integration) → dismiss (teardown path)
```
