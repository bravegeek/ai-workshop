# Research: UI Module

**Date**: 2026-02-17 | **Branch**: `004-ui`

## R1: Shadow DOM Styling Strategy

### Decision

Use Constructable Stylesheets (`new CSSStyleSheet()` + `shadowRoot.adoptedStyleSheets`) as the primary styling mechanism. Define all styles in a single `styles.ts` module as a `CSSStyleSheet` instance. No fallback to inline `<style>` blocks — Constructable Stylesheets have been supported in all evergreen browsers since Chrome 73 (2019), Firefox 101 (2022), and Safari 16.4 (2023). The project targets modern evergreen browsers, so full support is guaranteed.

### Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Styling mechanism | Constructable Stylesheets | Single shared stylesheet instance. Avoids creating `<style>` elements in the shadow DOM per render cycle. More performant for dynamic style updates. |
| Style definition location | `styles.ts` module | All CSS-in-JS as template literal strings passed to `CSSStyleSheet.replaceSync()`. Co-locating all styles in one file makes visual consistency easier to audit. |
| `prefers-reduced-motion` | CSS `@media` query inside stylesheet + JS `matchMedia` check | CSS handles the animation swap (pulse keyframes vs static). JS reads `matchMedia` to choose scroll behavior (`smooth` vs `instant`). |
| Style scoping | Shadow DOM natural scoping | No BEM, no CSS modules, no class prefixes needed — Shadow DOM prevents all leakage in both directions. |

### Implementation Pattern

```
const sheet = new CSSStyleSheet();
sheet.replaceSync(`
  :host { all: initial; position: fixed; z-index: var(--lob-z); pointer-events: none; }
  .pulse { ... }
  @media (prefers-reduced-motion: reduce) { .pulse { animation: none; } }
`);
shadowRoot.adoptedStyleSheets = [sheet];
```

### Alternatives Considered

- **Inline `<style>` blocks**: Works everywhere but creates DOM nodes. No stylesheet sharing if we ever need multiple shadow roots. Slightly worse performance for dynamic updates. Not needed since Constructable Stylesheets have universal modern browser support.
- **CSS-in-JS library (e.g., goober)**: Adds a runtime dependency. Banned by Constitution §VII (zero runtime deps) and §Tech Constraints (<50KB bundle).

---

## R2: Pulse Animation Implementation

### Decision

Use CSS `@keyframes` animation defined in the Constructable Stylesheet for the pulse effect. Position the pulse overlay element using `position: fixed` coordinates calculated from `getBoundingClientRect()` of the host DOM target. Use `requestAnimationFrame` loop to track position changes (scroll, resize, layout shifts). Use `pointer-events: none` on the pulse element so clicks pass through to the target.

### Algorithm

1. Read `targetElement.getBoundingClientRect()` → `{top, left, width, height}`.
2. Create a `<div class="pulse">` inside the shadow root.
3. Set `position: fixed; top: Ypx; left: Xpx; width: Wpx; height: Hpx; pointer-events: none;`.
4. Start a `requestAnimationFrame` loop that re-reads `getBoundingClientRect()` and updates position on each frame.
5. Apply CSS animation: `animation: lob-pulse 1.5s ease-in-out infinite;` — a glow/ring effect using `box-shadow` or `outline` expansion.
6. If `prefers-reduced-motion: reduce`, the CSS `@media` query disables animation and shows a static `box-shadow` highlight instead.

### Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Positioning | `position: fixed` + `getBoundingClientRect()` | Fixed position relative to viewport. `getBoundingClientRect()` already returns viewport-relative coordinates. No need to compute scroll offsets. |
| Position tracking | `requestAnimationFrame` loop | Handles scroll, resize, and layout shifts in a single mechanism. More reliable than listening to multiple events separately. ~16ms granularity is smooth enough. |
| Click-through | `pointer-events: none` on pulse element | Native CSS solution. User can click directly through the highlight to the target element. No event forwarding needed. |
| Animation style | CSS `@keyframes` with `box-shadow` | GPU-accelerated (`box-shadow` is composited). No JS animation ticking. CSS handles reduced-motion media query automatically. |
| Dismiss triggers | `click` + `touchstart` on `document` | Single event listener on document (inside shadow root for own elements, plus one on host document for target element clicks). AbortController cleanup. |

### Alternatives Considered

- **Web Animations API**: Programmatic control via `element.animate()`. More flexible for dynamic timing, but CSS keyframes are sufficient for a fixed pulse effect and simpler to define. WAAPI would be overkill.
- **IntersectionObserver for position tracking**: Only fires on visibility threshold changes, not continuous position updates. Doesn't handle element movement within the viewport. rAF is the right tool here.
- **ResizeObserver for size tracking**: Only tracks the target element's own size changes. Doesn't track position changes from scroll or ancestor layout shifts. rAF covers both size and position.
- **`position: absolute` with scroll offset math**: Requires computing cumulative scroll offsets up the DOM tree. Error-prone with nested scrollable containers. `position: fixed` + `getBoundingClientRect()` is simpler and correct.

---

## R3: Scrollable Ancestor Detection

### Decision

Walk up the DOM tree from the target element, checking each ancestor for `overflow: auto|scroll|overlay` and `scrollHeight > clientHeight` (or `scrollWidth > clientWidth`). Return the first matching ancestor. If none found, return the document's scrolling element (`document.scrollingElement` or `document.documentElement`).

### Algorithm

```
findScrollableAncestor(element):
  let el = element.parentElement
  while el:
    style = getComputedStyle(el)
    overflowY = style.overflowY
    overflowX = style.overflowX
    if (overflowY in ['auto', 'scroll', 'overlay'] && el.scrollHeight > el.clientHeight) OR
       (overflowX in ['auto', 'scroll', 'overlay'] && el.scrollWidth > el.clientWidth):
      return el
    el = el.parentElement
  return document.scrollingElement || document.documentElement
```

### Scroll Execution

- Use `scrollContainer.scrollTo({ top: targetTop, behavior: 'smooth' })` for smooth scrolling.
- If `prefers-reduced-motion: reduce`, use `behavior: 'instant'`.
- The target position is calculated to center the element in the scrollable container's viewport when possible, with a minimum margin from the top edge.

### User Scroll Cancellation

- Listen for `wheel`, `touchstart`, and `keydown` (arrow keys, Page Up/Down, Home/End) events on the scroll container.
- When detected during programmatic scroll, call `abort()` on the scroll's AbortController, which removes the listeners and cancels any ongoing `scrollTo` animation.
- The `scrollend` event (supported in modern browsers) or a fallback `requestAnimationFrame` poll detects scroll completion.

### Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Ancestor detection | `getComputedStyle` walk | Native API, handles all overflow modes. More reliable than checking CSS classes or element types. |
| Scroll API | `Element.scrollTo({ behavior })` | Native smooth scroll with instant fallback. No JS animation loop needed. |
| Scroll completion | `scrollend` event with rAF fallback | `scrollend` is supported in Chrome 114+, Firefox 109+, Safari 17+. rAF fallback for edge cases. |
| Cancel detection | `wheel` + `touchstart` + `keydown` | Covers mouse, touch, and keyboard scroll. No need to detect programmatic scroll (we control that). |

### Alternatives Considered

- **`element.scrollIntoView({ behavior: 'smooth' })`**: Simpler API but less control over scroll position (can't center the element or add margins). Also scrolls all ancestors, which may be undesirable if only the nearest scrollable container should scroll.
- **Custom JS scroll animation**: Gives full control over easing and timing, but reinvents `scrollTo({ behavior: 'smooth' })`. Constitution prefers using native APIs where possible for performance (§VIII).

---

## R4: Label Positioning and Flip Logic

### Decision

Position the micro-label as a fixed-position element adjacent to the pulse highlight. Default placement: below the target element, horizontally centered. If the label would clip the viewport edge, flip to the opposite side (below → above, right → left).

### Algorithm

```
positionLabel(targetRect, labelRect, viewport):
  // Default: below target, centered horizontally
  top = targetRect.bottom + LABEL_GAP
  left = targetRect.left + (targetRect.width - labelRect.width) / 2

  // Vertical flip: if label goes below viewport, place above target
  if top + labelRect.height > viewport.height:
    top = targetRect.top - labelRect.height - LABEL_GAP

  // Horizontal clamp: keep within viewport bounds
  if left < VIEWPORT_MARGIN:
    left = VIEWPORT_MARGIN
  if left + labelRect.width > viewport.width - VIEWPORT_MARGIN:
    left = viewport.width - VIEWPORT_MARGIN - labelRect.width

  return { top, left }
```

### RTL Support

- Read `getComputedStyle(document.documentElement).direction` to detect RTL.
- When `direction: rtl`, mirror the horizontal positioning logic (default to right-aligned rather than left-aligned relative to the target).
- The label's `text-align` and `direction` CSS properties are set to match the host document's direction.

### WCAG AA Contrast

- Use a fixed color scheme: dark background (`#1a1a2e` or similar, near-black) with white text.
- This provides >7:1 contrast ratio (AAA) which exceeds the AA minimum of 4.5:1.
- The label background uses a subtle `border-radius` and `padding` for readability.
- Font size minimum: 12px (aligned with spec FR-009).

### Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Label position | Fixed, below target, centered | Most natural reading position. Below is preferred because users typically look down the page for next actions. |
| Flip logic | Vertical flip only + horizontal clamp | Keeps logic simple. Full 4-quadrant flip adds complexity with minimal UX benefit. Horizontal clamping prevents edge overflow without full flip. |
| Label style | Dark chip with white text | Maximum contrast. Consistent across all host app backgrounds. No dependency on host app colors. |
| Inert behavior | `pointer-events: none` on label | Label is non-interactive (Constitution §IV passive guidance). Clicks pass through. |

### Alternatives Considered

- **Tooltip library (e.g., Floating UI/Popper)**: Excellent positioning logic but adds a runtime dependency (banned by Constitution §VII). The positioning algorithm above is <50 lines and handles the key cases.
- **`position: absolute` relative to target**: Would need to inject a wrapper element around the target in the host DOM — violates FR-012 (read-only host DOM).
- **4-quadrant flip (top/bottom/left/right)**: Adds complexity for edge cases that rarely occur in practice. Below + above with horizontal clamp covers >95% of layouts.

---

## R5: Mini-Map Panel Design

### Decision

A small fixed-position panel inside the shadow root, anchored to a configurable viewport corner (default: bottom-right). Contains a list of suggestion entries with labels and source indicators. Entries are clickable (triggers scroll + pulse) and keyboard-navigable.

### Layout

```
┌──────────────────────────┐
│  LOB GPS                 │  ← header (small, subtle)
├──────────────────────────┤
│  ★ Step 2: Save          │  ← curated entry (★ = curated icon)
│  ◆ Frequently used (35%) │  ← predicted entry (◆ = predicted icon)
│  ◆ Sometimes used (8%)   │  ← predicted entry
└──────────────────────────┘
```

### ARIA and Keyboard Navigation

| Element | ARIA Role | Keyboard |
|---|---|---|
| Panel container | `role="complementary"`, `aria-label="Navigation suggestions"` | — |
| Entry list | `role="list"` | — |
| Each entry | `role="listitem"`, `tabindex="0"` | Tab to focus, Enter/Space to activate |
| Close/collapse | `role="button"`, `aria-label="Collapse suggestions"` | Enter/Space |

### Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Panel position | `position: fixed` with configurable corner | Stays visible during scroll. Corner anchor prevents overlap with typical main-content areas. |
| Anchor config | `miniMapAnchor: 'bottom-right' | ...` | Four corners. Default bottom-right matches common "chat widget" UX convention. |
| Size | Fixed width (~240px), auto height | Wide enough for label text, narrow enough to not obscure content. Auto height adapts to suggestion count. |
| Collapse state | Collapsible to a small icon | Reduces visual noise when not needed. Expanded by default on first render. |
| Source indicator | `★` (curated) / `◆` (predicted) | Simple text icons. No image assets needed. Screen-reader-friendly with ARIA labels. |
| Panel z-index | Same as shadow host (configured via `UIConfig.zIndex`) | Inherits from shadow host. No separate z-index management needed. |

### Alternatives Considered

- **Draggable panel**: Better flexibility but adds significant complexity (drag handlers, position persistence, collision detection). Deferred to v2 per spec clarification.
- **Popover API (`popover` attribute)**: Modern browser feature but doesn't work well inside Shadow DOM. Positioning behavior is inconsistent across browsers.
- **Floating action button (FAB) with expand**: Common mobile pattern but less discoverable on desktop. A visible panel with entries is more informative.

---

## R6: Element Visibility and Existence Validation

### Decision

Before rendering a pulse, validate the target element using a two-step check: (1) `document.querySelector(selector)` returns a non-null element, and (2) the element is "visible" (non-zero bounding rect, not `display: none`, not `visibility: hidden`).

For active pulse monitoring (target removed during pulse), use the rAF position-tracking loop that's already running — on each frame, re-read `getBoundingClientRect()`. If the rect collapses to zero (element removed or hidden), dismiss the pulse. No separate MutationObserver needed.

### Algorithm

```
isElementVisible(element):
  if !element.isConnected: return false
  rect = element.getBoundingClientRect()
  if rect.width === 0 && rect.height === 0: return false
  style = getComputedStyle(element)
  if style.display === 'none': return false
  if style.visibility === 'hidden': return false
  return true
```

### Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Pre-render validation | `querySelector` + visibility check | Fast (<1ms). Prevents rendering pulses on non-existent or hidden elements. |
| Active monitoring | rAF loop rect check | Already running for position tracking. Zero additional overhead. Detects removal within one frame (~16ms). |
| No MutationObserver | Reuse rAF loop | MutationObserver adds complexity (subtree monitoring, callback batching) for a check that rAF already handles. The Mapper module already has MutationObserver for state changes — adding another from the UI would be redundant. |

### Performance Budget

- `querySelector`: <0.1ms for ID selectors, <1ms for complex selectors (already benchmarked in Mapper module).
- `getBoundingClientRect`: <0.1ms per call.
- `getComputedStyle`: <0.5ms per call.
- Total validation: <2ms — well within the 50ms rendering budget.

### Alternatives Considered

- **MutationObserver on target element's parent**: Would catch removal but adds observer management overhead. The rAF loop already detects removal via zero-rect. Simpler and no additional event listener cleanup needed.
- **IntersectionObserver**: Detects visibility changes but fires asynchronously and may not catch element removal in the same frame. rAF is synchronous per frame and more reliable.

---

## R7: Event Listener Cleanup Strategy

### Decision

Use `AbortController` + `addEventListener({ signal })` for all event listeners. Each logical operation (pulse lifecycle, scroll lifecycle, mini-map) gets its own `AbortController`. On dismiss or teardown, calling `controller.abort()` removes all associated listeners automatically.

### Pattern

```
// Per-pulse lifecycle
const pulseController = new AbortController();
const signal = pulseController.signal;

document.addEventListener('click', handleDismiss, { signal });
document.addEventListener('touchstart', handleDismiss, { signal });
window.addEventListener('resize', handleResize, { signal });

// On dismiss or new render:
pulseController.abort();  // removes all three listeners

// Per-module teardown
const moduleController = new AbortController();
// ... all module-level listeners use moduleController.signal ...
// On teardown:
moduleController.abort();
```

### Hierarchy

```
OverlayUI (module-level AbortController)
├── PulseRenderer (per-pulse AbortController — aborted on dismiss)
├── ScrollController (per-scroll AbortController — aborted on complete/cancel)
├── LabelRenderer (shares PulseRenderer's controller — label dies with pulse)
└── MiniMap (persistent AbortController — aborted only on teardown)
```

### Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Cleanup mechanism | `AbortController` + `{ signal }` | Native API. No manual tracking arrays. Automatic cleanup on `abort()`. Prevents memory leaks by design. |
| Granularity | Per-operation controllers | Pulse listeners cleaned on dismiss. Scroll listeners cleaned on complete. Module listeners cleaned on teardown. Each level is independent. |
| Label controller sharing | Shared with pulse controller | Label lifecycle is tied to pulse lifecycle (FR-008 + US4 AS5). One controller for both simplifies coordination. |
| Memory leak prevention | No long-lived references to host elements | `PulseState.targetElement` is cleared on dismiss. rAF handles are cancelled. No closures capture stale elements. |

### Alternatives Considered

- **Manual `removeEventListener` tracking**: Requires maintaining arrays of `[element, event, handler]` tuples. Error-prone (easy to miss a removal). AbortController is cleaner and more idiomatic.
- **WeakRef for host element references**: Would auto-GC stale references but adds complexity. Since we actively dismiss pulses (via rAF zero-rect detection or explicit dismiss), dangling references shouldn't occur. Not needed for v1.
