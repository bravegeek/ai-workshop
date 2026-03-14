# presbyopia.js — Product & Technical Specification
**Version:** 0.1 draft
**Status:** In progress
**Last updated:** 2026-03-12

---

## Part I — Product Specification

### 1. Problem

The US median age is ~39. Presbyopia (age-related loss of near-focus ability) begins around 40 and affects the majority of adults over 45. Mobile screens are designed for younger eyes: small touch targets, hardcoded small font sizes, and high UI density create compounding friction for users who need reading glasses.

The specific failure mode this library addresses: **websites that hardcode font sizes in CSS pixels** (`font-size: 11px`) rather than relative units. OS-level font scaling has no effect on these. Mobile browsers' pinch-to-zoom works but breaks layout. No standards-compliant drop-in fix exists.

### 2. Goals

- Make mobile web meaningfully more usable for presbyopic users without requiring them to configure anything.
- Be trivially includable in any webpage — one `<script>` tag.
- Treat accessibility as a first-class output, not a bolt-on. Every feature is anchored to a published standard.
- Use sensors and compute already present on modern smartphones — no new hardware required.
- Produce no visible layout damage on well-formed pages.

### 3. Non-Goals

- This is not a screen reader or full accessibility suite. It targets one specific impairment profile: presbyopia.
- This library does not correct vision. It corrects the interface.
- It does not replace proper accessible design. It is a progressive enhancement layer for sites that already exist.
- No server-side component. Client-only.
- No opinion about design systems, frameworks, or component libraries.
- Not a browser extension (though the same logic could be packaged as one later).

### 4. Users

**Primary:** Adults 40–65 browsing on a mobile device without reading glasses nearby. They do not self-identify as having an accessibility need. They are frustrated, not disabled.

**Secondary:** Web developers who want to ship a more accessible site without a full accessibility audit. Include one script tag, done.

**Tertiary:** Accessibility engineers using this as a reference implementation or baseline.

### 5. User Stories

#### v0.1 — Font Floor

> As a user reading a website on my phone, I want text that is too small to read without glasses to be automatically scaled up to a comfortable size, so I can read without squinting or zooming.

Acceptance criteria:
- Any rendered text below the floor size is scaled up.
- Content is not lost or hidden as a result of scaling.
- The change is reversible (destroy() restores original state).
- Dynamically injected content is also caught.
- Works without any user interaction or configuration.

#### v0.1 — Tap Target Expansion

> As a user tapping links and buttons on my phone, I want small controls to have a larger effective touch area, so I can tap them accurately without zooming in.

Acceptance criteria:
- Interactive elements below 44×44px receive an expanded hit area.
- Visual layout is not altered (no padding bloat, no reflow).
- Works for native elements and ARIA-role equivalents.
- Works without any user interaction or configuration.

#### v0.2 — Distance-Adaptive Scaling (planned)

> As a user who instinctively holds my phone further from my face when text is hard to read, I want the interface to detect this and increase text size automatically, so I don't have to manually change settings.

Acceptance criteria:
- Detects arm-extension posture via `DeviceMotion` API (accelerometer + gyroscope).
- Triggers a temporary font scale bump on detection.
- No camera or microphone permission required.
- Respects `prefers-reduced-motion`.
- Can be disabled per-instance.

#### v0.2 — Touch Imprecision Detection (planned)

> As a user whose hands are less steady or whose near vision affects tap accuracy, I want the interface to detect when I am struggling with touch targets and expand them further, so my experience improves without me doing anything.

Acceptance criteria:
- Tracks touch event patterns (wobble radius, near-miss retries).
- Dynamically increases target expansion for elements the user is struggling with.
- Thresholds configurable; conservative defaults to avoid false positives.

### 6. Success Criteria

| Metric | Target |
|---|---|
| Script size (gzipped) | < 5 KB for v0.1 core |
| Time to first effect | < 100ms after DOMContentLoaded |
| Layout shift introduced | CLS delta < 0.05 |
| Test coverage | 100% of public API surface |
| WCAG compliance | All features anchored to specific success criteria |
| Browser support | All evergreen browsers + Safari iOS 15+ |
| Zero dependencies | No runtime imports outside the browser platform |

### 7. Non-Stigmatizing Framing

The library and its documentation deliberately avoid the word "accessibility" in user-facing language. Users who reject the "Accessibility" settings label on iOS/Android are the target audience. The correct frame is **comfort** and **clarity**, not disability accommodation.

Internal code, tests, and this spec use accurate accessibility terminology because that is the correct engineering frame.

---

## Part II — Technical Specification

### 8. Architecture

The library is composed of independent, instantiable modules. Each module:
- Has a constructor that accepts an options object.
- Exposes `init(root?)` and `destroy()`.
- Uses `MutationObserver` to handle dynamic content.
- Manages its own DOM side effects and cleans them up completely on `destroy()`.

The `Presbyopia` class is a thin orchestrator that composes modules.

```
Presbyopia
├── FontFloor       (WCAG 1.4.4)
└── TapTargets      (WCAG 2.5.5)

[v0.2]
├── MotionScaling   (DeviceMotion API)
└── TouchPrecision  (Touch Events API)
```

### 9. Module Contracts

#### 9.1 FontFloor

**Purpose:** Enforce a minimum rendered font size across the DOM.

**Standard:** WCAG 1.4.4 Resize Text (Level AA) — text must be resizable to 200% without loss of content or functionality.

**Algorithm:**
1. On `init(root)`: scan all descendant elements of `root` (default: `document.body`).
2. For each element not in the skip list:
   a. Read inline `style.fontSize` first (fast path).
   b. Fall back to `getComputedStyle(el).fontSize`.
   c. If the computed size is > 0 and < `floorPx`, apply override.
3. Override uses `el.style.setProperty("font-size", value, "important")` to beat `!important` rules in author CSS.
4. Mark overridden elements with `data-pres-ff="1"` for efficient cleanup.
5. Attach `MutationObserver` on `root` to catch dynamically added content.

**Skip list:** `SCRIPT, STYLE, SVG, CANVAS, VIDEO, AUDIO, IMG, INPUT, SELECT, TEXTAREA, HEAD, META, LINK` — elements that either render no visible text or manage their own text sizing.

**Options:**
```typescript
interface FontFloorOptions {
  floorPx?: number;  // default: 16
}
```

**State management:**
- `destroy()` removes all inline overrides and `data-pres-ff` attributes.
- `destroy()` disconnects the MutationObserver.
- Multiple `init()` calls on the same instance are idempotent (observer is not duplicated).

**Edge cases:**
- Elements with `font-size: 0` (used for spacing tricks) are skipped.
- Inline override on a parent may affect inheritance for children — children are scanned separately and overridden individually if needed.
- `getComputedStyle` may fail in some environments (worker contexts, detached elements); these are silently skipped.

#### 9.2 TapTargets

**Purpose:** Expand the effective touch hit area of interactive elements that are below the minimum target size.

**Standard:** WCAG 2.5.5 Target Size (Level AAA) — target size for pointer inputs should be at least 44×44 CSS pixels.

**Algorithm:**
1. On `init(root)`: inject a `<style>` element with the expansion CSS (once, guarded by ID).
2. Scan all elements matching `INTERACTIVE_SELECTORS` within `root`.
3. For each matching element: measure `getBoundingClientRect()`.
4. If `width < minPx` or `height < minPx`: add class `pres-tt`.
5. Attach `MutationObserver` on `root` to catch dynamically added interactive elements.

**Expansion technique:** `::after` pseudo-element, absolutely positioned, centered, with `min-width` and `min-height` equal to `minPx`. This expands the touch area without altering visual layout or triggering reflow.

```css
.pres-tt {
  position: relative !important;
  overflow: visible !important;
}
.pres-tt::after {
  content: "";
  display: block;
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  min-width: 44px; min-height: 44px;
  width: 100%; height: 100%;
  cursor: inherit;
  pointer-events: auto;
}
```

**Interactive selectors covered:**
`a[href]`, `button`, `input`, `select`, `textarea`, `[role="button"]`, `[role="link"]`, `[role="checkbox"]`, `[role="radio"]`, `[role="menuitem"]`, `[role="tab"]`, `[tabindex]`

**Options:**
```typescript
interface TapTargetOptions {
  minPx?: number;  // default: 44 (WCAG 2.5.5)
}
```

**State management:**
- `destroy()` removes the injected `<style>` element.
- `destroy()` removes `pres-tt` class from all marked elements.
- `destroy()` disconnects the MutationObserver.
- Stylesheet injection is idempotent (checked by ID `pres-tt-styles`).

**Known limitations:**
- `overflow: visible !important` on the parent may conflict with intentional `overflow: hidden` on some components (e.g., pill buttons with clipped content). This is a known trade-off; visual regression testing on target sites is advised.
- `getBoundingClientRect()` returns `{0, 0}` for elements that are not yet painted (e.g., display:none). These elements receive the class unnecessarily but without visual effect.

#### 9.3 Presbyopia (orchestrator)

```typescript
interface PresbyopiaOptions {
  fontFloor?: number | false;   // default: 16; false disables module
  tapTargets?: number | false;  // default: 44; false disables module
}

class Presbyopia {
  constructor(options?: PresbyopiaOptions)
  init(root?: Document | Element): this  // chainable
  destroy(): void
}
```

**Auto-init:** When loaded as an IIFE `<script>` tag with `data-auto` attribute, instantiates with defaults and calls `init()` after `DOMContentLoaded`.

```html
<!-- Zero-config drop-in -->
<script src="presbyopia.iife.js" data-auto></script>
```

### 10. Browser API Dependencies

| API | Used by | MDN Baseline | Fallback |
|---|---|---|---|
| `MutationObserver` | FontFloor, TapTargets | Widely available | Omit dynamic content support |
| `getComputedStyle` | FontFloor | Widely available | Inline style fallback |
| `Element.style.setProperty` | FontFloor | Widely available | None needed |
| `getBoundingClientRect` | TapTargets | Widely available | None (skip check) |
| `CSS ::after pseudo-element` | TapTargets | Widely available | None needed |
| `DeviceMotionEvent` | MotionScaling (v0.2) | Widely available | Feature detection, graceful skip |
| `Touch Events` | TouchPrecision (v0.2) | Widely available (not desktop) | Feature detection, graceful skip |

All v0.1 APIs are `Widely available` per MDN Baseline. No polyfills required.

### 11. Build Output

| File | Format | Use case |
|---|---|---|
| `dist/presbyopia.js` | ESM | Import in bundled applications |
| `dist/presbyopia.iife.js` | IIFE (`window.presbyopia`) | Direct `<script>` tag inclusion |
| `dist/index.d.ts` | TypeScript declarations | Type-safe consumption |

Build command: `bun build`
Bundler: Bun native bundler (zero config, no webpack/rollup/vite)
Target: ESNext
Source maps: included

### 12. Testing

**Runner:** `bun test`
**DOM environment:** `happy-dom` via `@happy-dom/global-registrator`
**Coverage target:** All public methods, all option variants, MutationObserver behavior, destroy/cleanup

Test files mirror source files:
```
test/font-floor.test.ts   → src/font-floor.ts
test/tap-targets.test.ts  → src/tap-targets.ts
test/index.test.ts        → src/index.ts
```

### 13. WCAG Anchoring

| Feature | WCAG SC | Level | Criterion summary |
|---|---|---|---|
| Font floor | 1.4.4 Resize Text | AA | Text resizable to 200% without loss of content |
| Tap target expansion | 2.5.5 Target Size | AAA | Pointer target size ≥ 44×44 CSS px |
| Motion scaling (v0.2) | 1.4.4 + 1.4.10 Reflow | AA | Reflow support; content usable at 320px width |
| `prefers-reduced-motion` respect (v0.2) | 2.3.3 Animation from Interactions | AAA | Motion can be disabled |

### 14. Versioning Roadmap

#### v0.1 (current)
- FontFloor module
- TapTargets module
- Presbyopia orchestrator
- ESM + IIFE builds
- Full test suite

#### v0.2 (planned)
- MotionScaling module (DeviceMotion API — no permissions)
- TouchPrecision module (Touch Events — no permissions)

#### v0.3 (exploratory)
- Perceptual sharpening filter — software reading glasses via canvas/CSS filter targeting text elements; requires calibration flow
- Depends on: computational vision correction research (arXiv 2501.01450 et al.)

#### Out of scope (for now)
- Browser extension packaging
- React/Vue/Angular component wrappers
- CDN hosting
- Analytics or telemetry of any kind

---

## Part III — Open Questions & Known Issues

### 15. Open Design Questions

These are unresolved issues that should be answered before v0.1 ships or v0.2 is scoped.

#### 15.1 Deployment Model Ambiguity

The spec targets two incompatible deployment models without resolving the tension:

- **Site-owner install**: site owner adds `<script>` tag. Users on non-participating sites get nothing. This is a developer product.
- **User-install**: user installs a bookmarklet or extension. This is a consumer product with different distribution, trust, and UX requirements.

The current spec assumes site-owner install but frames the value proposition around end-user benefit. These need to be decoupled. A decision on primary deployment model should precede any distribution or packaging work.

#### 15.2 Distribution Gap

CDN hosting is listed as out of scope, but it is the core use case for a drop-in `<script>` tag library. npm works only for developers with a build pipeline — not the target "add one tag" user. This is unresolved. Options to evaluate: jsDelivr/unpkg auto-hosting via npm publish, self-hosted CDN, or reframing the product as bundler-only.

#### 15.3 Font Floor Value Is Unvalidated

The 16px floor is derived from WCAG norms and convention, not from research with actual presbyopic users. It is unclear whether 16px is meaningfully better than 14px or 18px for the target population, whether a single floor works across screen densities and physical device sizes, or whether any floor should apply uniformly to body text, captions, and labels alike. User testing with the target demographic (adults 40–65) should validate or replace this default before v1.

#### 15.4 SPA Compatibility

`DOMContentLoaded` fires once per page load. In single-page applications, route transitions replace large portions of the DOM without triggering a reload. The `MutationObserver` will catch individual node insertions but may not correctly handle full subtree replacements where the root element itself is swapped. This needs explicit testing against React/Vue/Svelte SPA patterns, which are the dominant architecture on modern mobile sites.

#### 15.5 Interoperability with Existing Accessibility Tools

The library does not document behavior when running alongside:
- Commercial accessibility overlays (AccessiBe, UserWay, EqualWeb)
- Browser-native accessibility features (iOS Dynamic Type, Android font scaling)
- Screen readers (VoiceOver, TalkBack)

DOM mutations from multiple tools operating simultaneously have undefined interaction effects. At minimum, the library should detect and log conflicts; ideally it should define a priority model.

---

### 16. Known Technical Risks

#### 16.1 WCAG Anchoring Is Misleading

Section 13 presents a table mapping features to WCAG success criteria. This could be read as claiming the library makes a site WCAG-compliant. It does not. The library compensates for WCAG violations from outside the site's own code. A site that hardcodes `font-size: 11px` remains non-compliant after this library runs — the non-compliance is just partially masked at runtime. The WCAG table should include an explicit disclaimer to prevent developers from using script inclusion as a substitute for accessible design.

#### 16.2 FontFloor `!important` Override Creates Cascade Instability

Applying `font-size: X !important` as an inline style on every qualifying element is the highest-specificity override available. Implications:

- It defeats any subsequent `!important` rule in author stylesheets that might have been intentional.
- Overriding a parent element's font size changes the computed base for any `em`-relative values on its children (line-height, margin, padding). Scanning children individually and overriding them separately does not fix this — it layers additional overrides on top of an already-mutated inheritance chain.
- The interaction with CSS custom properties (`--font-size: 11px; font-size: var(--font-size)`) is not addressed.

#### 16.3 TapTargets `overflow: visible !important` Breaks Real Layouts

The `::after` expansion technique requires `overflow: visible` on the host element. This will visually break:
- Pill buttons and any element where `overflow: hidden` clips to a border-radius
- Fixed-height scroll containers
- Elements where overflow clipping is a deliberate design choice

The spec acknowledges this as a "known trade-off" but understates the frequency. Overflow clipping is common. Additionally, the expanded `::after` hit area may overlap adjacent interactive elements, creating invisible phantom tap zones — a usability regression, not an improvement.

#### 16.4 v0.2 MotionScaling Inference Is Speculative

The plan to detect presbyopic arm-extension posture via `DeviceMotionEvent` accelerometer data is not grounded in published research. Users extend their arms to share screens, rest phones on surfaces, gesture while talking, and shift posture for ergonomic reasons unrelated to vision. The false positive rate for this inference is likely high. Before this feature is scoped, a literature review or user study should establish whether accelerometer data can reliably distinguish presbyopia-driven arm extension from other causes at a usable precision/recall threshold.

#### 16.5 v0.3 Perceptual Sharpening Is Not a Roadmap Item

The v0.3 entry references ongoing academic research and requires a calibration flow — which directly contradicts the zero-config premise of the library. It should be moved to a separate ideas or research log until there is a concrete design proposal. Listing it on the roadmap creates a false impression of commitment and scope.

---

## Part IV — Next Steps (Before Resuming)

*Shelved 2026-03-13. Resume here.*

### Priority 1 — Resolve the Deployment Model

Before any further implementation, answer: who actually installs this, and how does it reach a presbyopic user?

Trace the full path from "55-year-old struggles to read a restaurant menu on their phone" to "this library helps them." Count the steps and decision-makers. If the chain runs through the restaurant's web developer having heard of this library and shipped an update, that's a low-probability path and the product premise may need rethinking.

The outcome of this exercise will determine whether the library stays a site-owner developer tool, pivots to a browser extension/bookmarklet, or something else. The technical spec is contingent on this answer — don't invest further in packaging, distribution, or the developer UX until the deployment model is resolved.

### Priority 2 — Test FontFloor on Real Sites Before More Code

Pick ten real mobile sites with a mix of content types (news, e-commerce, government form, restaurant menu, blog). Apply the current FontFloor logic and observe:
- Does layout break?
- Is 16px actually a useful floor, or does it create visual regressions?
- How common is the `em`-relative cascade problem in practice?

This should be done before writing more implementation. The current algorithm design is based on assumptions; real sites will validate or invalidate them quickly.
