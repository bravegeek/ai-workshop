# Research: Integration Layer

**Branch**: `005-integration` | **Date**: 2026-02-17

## R1: IIFE Bundle Entry Point for `<script>` Tag Usage

**Decision**: Add a separate `src/boot.ts` entry point that tsup compiles to an IIFE bundle (`dist/lob-gps.iife.js`). This file reads `window.LobGPS` as config, instantiates the LobGPS class, and replaces `window.LobGPS` with the API object.

**Rationale**: The existing `src/index.ts` produces ESM/CJS bundles for programmatic consumption (import/require). Drop-in `<script>` tags need an IIFE that self-executes. Keeping `boot.ts` separate from `index.ts` avoids polluting the library export with auto-initialization side effects.

**Alternatives considered**:
- Single entry with `if (typeof window !== 'undefined')` guard: Rejected because it would auto-init on import in Node.js test environments, SSR contexts, or when used as a library dependency.
- UMD format: Rejected because tsup's UMD support is limited and IIFE covers the `<script>` tag use case directly.

**Implementation**: tsup.config.ts gains a second entry:
```ts
{
  entry: { 'lob-gps': 'src/boot.ts' },
  format: ['iife'],
  globalName: 'LobGPS',
  noExternal: [/.*/],  // bundle everything
  // ... same minify, sourcemap, target settings
}
```

## R2: Leading-Edge Debounce Pattern

**Decision**: Implement a simple leading-edge debounce using `setTimeout`. On first StateChangeEvent, execute immediately and set a 100ms cooldown timer. Events during cooldown are dropped. When the timer fires, it resets the gate.

**Rationale**: Leading-edge gives instant response (no perceived delay on first interaction). The 100ms window batches rapid MutationObserver cascades (a single user click can trigger multiple DOM mutations). AbortController is not needed for debounce — the debounce gate is a simple boolean + timer.

**Alternatives considered**:
- `requestAnimationFrame` throttle: Rejected because rAF fires at 16ms intervals (~60fps), which is too frequent for batch protection and doesn't match the 100ms window requirement.
- Trailing-edge debounce: Rejected because it adds 100ms latency to every first interaction.
- RxJS-style operators: Rejected — zero runtime dependencies constraint.

## R3: Config Object Handoff Pattern (FR-016)

**Decision**: On boot, `boot.ts` reads `window.LobGPS` via `typeof window.LobGPS === 'object' ? { ...window.LobGPS } : {}`. It shallow-copies the config to prevent mutation, then constructs the `LobGPS` instance. After construction, `window.LobGPS` is reassigned to the API proxy object (with `enable()`, `disable()`, etc.). Original config values are stored internally in the LobGPS instance.

**Rationale**: Shallow copy prevents the host app from mutating config after init. Replacing the global with the API object gives consumers a clean interface (`window.LobGPS.disable()`). The pre-existing object is just a plain config bag — no methods, no prototype.

**Alternatives considered**:
- `data-*` attributes on the `<script>` tag: Rejected because parsing attributes is more complex and less flexible than a plain JS object.
- Separate `window.LobGPSConfig`: Rejected because it adds a second global (violates FR-003).

## R4: Kill Switch Key Combo Parsing

**Decision**: Parse the kill switch string (e.g., `"Ctrl+Shift+K"`) into a structured descriptor `{ ctrl: boolean, shift: boolean, alt: boolean, meta: boolean, key: string }`. On `keydown`, compare the event against the descriptor. Use `event.key` for the letter, normalized to uppercase. The listener is attached to `document` with `{ capture: true }` so it fires before host app handlers.

**Rationale**: `event.key` is standardized and locale-aware. Capture phase ensures the kill switch fires even if the host app stops propagation in the bubble phase. `preventDefault()` is called after match to prevent the host app from also handling the combo.

**Alternatives considered**:
- `event.code`: Rejected because it's physical-key-based (e.g., `KeyK` regardless of keyboard layout), which can be confusing for international users.
- `event.keyCode`: Deprecated.

## R5: Error Buffer Ring Implementation

**Decision**: Use a fixed-length array with a write pointer. When the buffer is full, the pointer wraps to index 0 and overwrites the oldest entry. `errors` getter returns a copy of the buffer in chronological order (from oldest to newest).

**Rationale**: Simpler and more memory-predictable than a linked list or dynamic array with `shift()`. No allocations after initialization (the array is pre-allocated at size 100). The getter returns a copy to prevent external mutation.

**Alternatives considered**:
- Dynamic array with `if (length > 100) shift()`: Works but `shift()` is O(n) and causes array reindexing on every eviction.
- Circular buffer as a class: This is what we're doing, just kept minimal (no external dependency).

## R6: Version String Source

**Decision**: Import `version` from `package.json` at build time. tsup/esbuild resolves JSON imports, so `import { version } from '../../package.json'` works in the source and gets inlined as a string literal in the bundle.

**Rationale**: Single source of truth — the version in package.json is authoritative. No manual updating needed. Build tools inline the value, so there's no runtime JSON parsing or file read.

**Alternatives considered**:
- Hardcoded constant: Rejected because it requires manual updating on every release.
- Build-time `define` replacement: Works but adds tsup config complexity for no benefit over JSON import.

## R7: Duplicate Instance Detection (FR-004)

**Decision**: Check `window.__lobGpsInstance` (a Symbol-keyed property) before initialization. If it exists, the second script load no-ops. The Symbol is non-enumerable and non-configurable to prevent accidental collision.

**Rationale**: A Symbol property is invisible to `for...in`, `Object.keys()`, and `JSON.stringify()` — it won't pollute the global namespace or be accidentally discovered by host app code. This is stricter than checking `window.LobGPS` because the host app might set that as config.

**Alternatives considered**:
- Check `window.LobGPS instanceof LobGPS`: Doesn't work when the class is bundled separately in two script tags — different class references.
- Check `window.LobGPS.isActive !== undefined`: Fragile — could match a config object that happens to have that property.
- `document.querySelector('[data-lob-gps]')`: Works for detecting the shadow host, but fails if the overlay was disabled (host removed from DOM). The Symbol check survives disable/enable cycles.

## R8: DOMContentLoaded Handling (FR-013)

**Decision**: In `boot.ts`, check `document.readyState`. If `'loading'`, add a `DOMContentLoaded` listener. If `'interactive'` or `'complete'`, initialize immediately. This handles `async`, `defer`, and synchronous script loading.

**Rationale**: `document.readyState` is the standard way to determine if the DOM is ready. This pattern is used by jQuery, Google Analytics, and most drop-in scripts. It covers all three loading modes without additional complexity.

**Alternatives considered**:
- Always use `DOMContentLoaded` listener: Fails if the event already fired (common with `defer` scripts at bottom of `<body>`).
- `setTimeout(init, 0)`: Unreliable — may fire before DOM is fully parsed.
