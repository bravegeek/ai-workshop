# Research: Mapper Module

**Date**: 2026-02-10 | **Branch**: `001-mapper`

## R1: Dynamic ID Detection Patterns

### Decision

Use a two-tier detection strategy: (1) high-confidence framework-specific regex patterns checked first, (2) generic structural patterns (GUID, numeric suffix, hex suffix) as fallback. All patterns use ECMAScript regex dialect compiled via `new RegExp()`.

### Framework-Specific Patterns (High Confidence)

| Pattern Name | Regex | Examples Match | Examples Don't Match | Confidence |
|---|---|---|---|---|
| Ember numeric | `/^ember\d+$/` | `ember123`, `ember0` | `ember-app`, `emberly` | HIGH |
| Ember compound | `/^ember-[\w]+-\d+(-[a-z0-9]+)*$/` | `ember-id-7721-a`, `ember-view-123` | `ember-cli`, `ember-power-select` | MEDIUM |
| Angular CDK | `/^cdk-[\w]+-\d+$/` | `cdk-overlay-0`, `cdk-describedby-message-1` | `cdk-overlay-container` | HIGH |
| Angular Material | `/^mat-[\w]+-\d+$/` | `mat-input-3`, `mat-select-7` | `mat-button` | HIGH |
| Angular ng-attrs | `/^_ng(?:content\|host)-[a-z0-9-]+$/` | `_ngcontent-abc-c42`, `_nghost-xyz-c18` | `ng-model` | HIGH |
| React useId | `/^:r[a-z0-9]+:$/` | `:r0:`, `:r1a2b:` | `:root:`, `r0` | HIGH |
| React useId (prefixed) | `/^[\w-]+:r[a-z0-9]+:$/` | `myapp:r0:`, `prefix:r1a:` | `:r0:` | HIGH |
| jQuery UI id | `/^ui-id-\d+$/` | `ui-id-1`, `ui-id-42` | `ui-id-panel` | HIGH |
| jQuery UI widget | `/^ui-[\w]+-\d+$/` | `ui-tabs-1`, `ui-accordion-3` | `ui-corner-all` | HIGH |
| rc-component | `/^rc[-_][\w]+-\d+[-\w]*$/` | `rc-select-0`, `rc-tabs-1-tab-2` | `rc-car` | MED-HIGH |
| Reach UI | `/^reach-[\w]+-\d+$/` | `reach-tabs-1`, `reach-dialog-2` | `reach-router` | MED-HIGH |
| Downshift | `/^downshift-\d+-[\w]+$/` | `downshift-0-input`, `downshift-1-menu` | `downshift` | HIGH |

### Generic Structural Patterns (Medium Confidence)

| Pattern Name | Regex | Notes |
|---|---|---|
| UUID any version | `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i` | Full UUID format |
| UUID embedded | `/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i` | UUID as substring |
| UUID compact | `/^[0-9a-f]{32}$/i` | 32 hex chars (also matches MD5 hashes) |
| Pure numeric | `/^\d+$/` | Database PKs, counters |
| Long numeric suffix (4+) | `/[-_]\d{4,}$/` | `field_8832` but NOT `heading-1` |
| Hex suffix (6+) | `/[-_][0-9a-f]{6,}$/i` | Hash suffixes |

### Design Decisions

- **Detection order**: Framework-specific patterns first (O(1) per pattern), then generic patterns. Exit on first match.
- **Numeric suffix threshold**: 4+ digits to avoid false positives on intentional IDs like `step-3` or `col-12`. This is configurable via the allowlist/denylist.
- **Attributes vs IDs**: Vue `data-v-*` and Svelte `svelte-*` patterns are primarily class/attribute patterns, not `id` values. Include them only if we extend detection beyond ID attributes.
- **Allowlist takes precedence**: An ID matching an allowlist pattern is always stable, even if it also matches a dynamic pattern.

### Alternatives Considered

- **Single permissive regex**: Rejected. A catch-all pattern would have too many false positives. The tiered approach gives precise confidence levels.
- **Machine learning classifier**: Rejected. Overkill for a finite, enumerable set of patterns. Adds runtime dependency.

---

## R2: DOM Path Selector Strategy

### Decision

Walk up from target element to the nearest stable ancestor (max 5 levels), building a direct-child-combinator CSS selector using `:nth-of-type()` for sibling disambiguation.

### Algorithm

1. Starting from target element, walk up the DOM tree.
2. At each level, check for a stable anchor in priority order: stable `id` > `data-testid` > `aria-label` > semantic landmark tag (`<nav>`, `<main>`, `<header>`, `<aside>`).
3. If a stable anchor is found within 5 levels, root the selector there.
4. If no anchor is found, root at `body` (selector is more fragile but functional).
5. Build the path using direct child combinator `>` with `tag:nth-of-type(n)` for each step.

### Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Index type | `:nth-of-type()` over `:nth-child()` | Resilient to sibling insertions of different tag types (ad injection, A/B wrappers) |
| Combinator | `>` (direct child) | More precise than descendant ` ` combinator |
| Max depth | 5 ancestors | Balance between specificity and brittleness |
| Class names | Not used in selectors | Framework-generated classes (CSS modules, Tailwind, styled-components) are unstable across builds |
| Validation | `querySelectorAll(selector)` at generation time | Sub-millisecond cost, confirms uniqueness |

### Step Selector Logic

For each step from target toward anchor:
- Get tag name (lowercase).
- Count same-type siblings. If only one of that tag type, use bare tag name (no index).
- If multiple same-type siblings, append `:nth-of-type(n)`.

### Example Output

```
[data-testid="product-card"] > div > div > span:nth-of-type(1)
```

---

## R3: Page Fingerprinting via Semantic Anchors

### Decision

Collect semantic text from `document.title`, `h1`-`h3` headings, and active nav items. Normalize, sort deterministically, join with delimiter, hash with FNV-1a (32-bit) to produce an 8-character hex fingerprint.

### Semantic Anchor Priority

| Priority | Element | Rationale |
|---|---|---|
| 1 | `document.title` | Canonical page identifier |
| 2 | `<h1>` | Primary page heading, almost always unique per page |
| 3 | `<h2>`, `<h3>` | Section headings, disambiguate similar pages |
| 4 | Active nav item (`[aria-current="page"]`, `nav .active`) | Identifies current page within navigation |

### Excluded Elements

- **Buttons**: Too numerous, state-dependent text (e.g., "Follow"/"Following"), frequently repeated.
- **`<h4>`-`<h6>`**: Too granular, change with content, add noise.
- **Ads, chat widgets, cookie banners**: Noise (filtered by container blacklist).

### Hash Function: FNV-1a 32-bit

- Deterministic, fast (~10 lines of code), no dependencies.
- 32-bit output = 8 hex characters. Compact for use as a StateKey component.
- Collision probability acceptable: ~0.05% with 65K distinct pages (birthday problem on 2^32 space).
- Alternative considered: `SubtleCrypto.digest("SHA-256")` — works but is async and overkill. CRC32 is viable but FNV-1a has slightly better distribution.

### Noise Filtering

1. **Visibility check**: Skip elements with `offsetParent === null` or `display: none`.
2. **Content-length filter**: Skip headings with empty text or text > 100 characters.
3. **Container blacklist**: Ignore elements inside `iframe`, `[role="dialog"]`, `[role="alertdialog"]`, `<aside>` (if the aside is for ads/promos), and overlay-injected elements (marked with `data-lob-gps-ignore`).
4. **Timing**: Fingerprint after initial DOM is stable, not after third-party script injection.

### Alternatives Considered

- **SimHash/MinHash**: Overkill. Designed for near-duplicate detection, not exact page identity.
- **Full DOM hash**: Too brittle — any minor DOM change invalidates the fingerprint.
- **Existing libraries**: No widely-adopted library exists for semantic page fingerprinting. Build custom (20-40 lines of code).

---

## R4: MutationObserver Debouncing and Observation

### Decision

Use `requestAnimationFrame`-based coalescing for mutation batching. Use a two-observer architecture: a structural observer on `document.body` for childList changes, and targeted attribute observers for visibility tracking on known containers.

### Debouncing Pattern

- MutationObserver callback accumulates records into a pending array.
- On first record in a batch, schedule a `requestAnimationFrame` callback.
- In the rAF callback, swap the pending array (to prevent infinite loops from self-triggered mutations) and process the batch.
- This naturally coalesces all mutations within a single frame (~16ms at 60fps).

### Observer Architecture

| Observer | Target | Config | Purpose |
|---|---|---|---|
| Structural | `document.body` | `childList: true, subtree: true` | Detect elements added/removed |
| Attribute | Specific containers | `attributes: true, attributeFilter: ['style', 'class', 'hidden']` | Detect visibility changes |

**Why two observers**: A single `subtree + attributes` observer on `document.body` is expensive on pages with heavy animation or React re-renders. Separating structural from attribute observation limits the blast radius.

### Visibility Detection

MutationObserver alone is **insufficient** for full visibility detection because:
- It cannot detect CSS-rule-driven visibility changes (media queries, stylesheet additions).
- It cannot detect ancestor visibility changes (parent gets `display: none`, child receives no mutation).

For the mapper's scope (FR-007), the spec limits "meaningful state changes" to childList mutations and style/class changes on containers with interactive children. This is achievable with MutationObserver alone by observing:
- `childList + subtree` on `document.body` for structural additions/removals.
- `attributes` with `attributeFilter: ['style', 'class', 'hidden']` on known container elements for visibility toggles.

After detecting a mutation, verify actual visibility with `getComputedStyle(el).display !== 'none'` (deferred to rAF to avoid layout thrashing).

**Future enhancement**: `IntersectionObserver` could replace the attribute observer for more robust visibility detection, but it's not required by the v1 spec.

### Error Resilience

- Wrap every MutationObserver callback in try-catch. Silently log errors (FR-010).
- Guard with `element.isConnected` before operating on mutation targets (elements may have been removed between callback scheduling and rAF execution).
- Capture native `MutationObserver` and `requestAnimationFrame` references at module load time to protect against host page overrides.
- Track error count; if errors exceed a threshold, disconnect observer to prevent infinite error loops.

### Teardown

`observer.disconnect()` stops future notifications and empties the internal queue. Additional cleanup required:
- Cancel pending `requestAnimationFrame` callbacks via `cancelAnimationFrame(id)`.
- Clear the pending mutation records array.
- Set a `disposed` flag to guard any in-flight rAF callbacks.
- Use `WeakMap` for element tracking to avoid memory leaks from removed DOM elements.
- Detach all event listeners added during observation.

---

## R5: Text-Content Tier — Closest Stable Ancestor

### Decision

For TEXT_CONTENT tier selectors, walk up from the target element to find the closest ancestor with a stable attribute (same priority as DOM Path: `id` > `data-testid` > `aria-label`). Generate a CSS selector scoped to that ancestor + tag match. Store visible text as a `textHint` metadata field on `SelectorResult`.

### Algorithm

1. Get the target element's tag name and visible `textContent.trim()`.
2. Walk up the DOM (max 5 levels) looking for a stable ancestor.
3. Build the selector: `{ancestorSelector} {tag}` (descendant combinator, not direct child — the target may not be a direct child of the anchor).
4. Validate uniqueness via `querySelectorAll`. If multiple matches, try narrowing with direct child combinators or `:nth-of-type`.
5. If still ambiguous, the `textHint` serves as the disambiguation key for callers.

### Interaction with FR-009

The mapper may read `textContent` of interactive elements (buttons, links) for the `textHint` field. This is permitted because FR-009 prohibits reading `innerText` of **non-interactive** elements. Interactive elements' visible text is essential for the TEXT_CONTENT selector tier.

### Alternatives Considered

- **XPath with `text()` function**: Rejected. Not `querySelector`-compatible, requires a separate query engine.
- **Custom `:contains()` pseudo-selector**: Rejected (per clarification session 2026-02-10). Would require a custom query resolver, breaking native `querySelector` compatibility.
