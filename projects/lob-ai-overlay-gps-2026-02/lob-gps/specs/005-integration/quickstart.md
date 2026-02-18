# Quickstart: Integration Layer

**Branch**: `005-integration` | **Date**: 2026-02-17

## Scenario 1: Zero-Config Drop-In (US1)

The simplest integration — a single script tag with no configuration.

```html
<!-- Add to any page, anywhere in <head> or <body> -->
<script src="lob-gps.iife.js"></script>
```

**Expected behavior**:
1. Library waits for DOMContentLoaded (if not ready)
2. Boots Mapper → Telemetry (LocalStorageProvider) → Engine (max 3 suggestions) → UI (bottom-right mini-map)
3. Shadow host `[data-lob-gps]` appears in `document.body`
4. Mapper begins observing DOM mutations
5. `window.LobGPS.isActive` returns `true`
6. `window.LobGPS.version` returns the library version

**Verification**:
```js
console.log(window.LobGPS.isActive);  // true
console.log(window.LobGPS.version);   // "0.1.0"
console.log(document.querySelector('[data-lob-gps]'));  // HTMLElement
```

## Scenario 2: Custom Configuration (US4)

Provide config before the script loads.

```html
<script>
  window.LobGPS = {
    maxSuggestions: 5,
    killSwitch: 'Ctrl+Alt+G',
    miniMapAnchor: 'top-left',
    debug: true,
    curatedPaths: [
      {
        id: 'onboarding',
        name: 'New User Onboarding',
        steps: [
          { stateKey: 'main::',     targetSelector: '#start-btn', label: 'Step 1: Click Start', stepNumber: 1 },
          { stateKey: 'main::#start-btn', targetSelector: '#name-input', label: 'Step 2: Enter your name', stepNumber: 2 },
        ]
      }
    ],
    onError: (err) => myErrorTracker.report(err),
  };
</script>
<script src="lob-gps.iife.js"></script>
```

**Expected behavior**:
1. Library reads the config object from `window.LobGPS`
2. Replaces `window.LobGPS` with the API (methods + properties)
3. Engine uses 5 max suggestions with the curated onboarding path
4. Kill switch responds to Ctrl+Alt+G instead of default
5. Mini-map panel appears at top-left
6. Caught errors log to `console.warn` AND call `onError` AND go to buffer

## Scenario 3: Kill Switch (US2)

```js
// Via keyboard: press Ctrl+Shift+K (default)
// — OR —
window.LobGPS.disable();

// Verify teardown
console.log(window.LobGPS.isActive);  // false
console.log(document.querySelector('[data-lob-gps]'));  // null

// Re-enable (telemetry data preserved)
window.LobGPS.enable();
console.log(window.LobGPS.isActive);  // true
```

## Scenario 4: Runtime Configuration Change (US4 AS5)

```js
// Change max suggestions at runtime
window.LobGPS.configure({ maxSuggestions: 1 });

// Does NOT trigger immediate re-render.
// Takes effect on next StateChangeEvent (Mapper detects DOM mutation).
```

## Scenario 5: Error Inspection (US3)

```js
// After some time with the overlay running...
console.log(window.LobGPS.errors);
// → [Error: "Pulse broke", Error: "Scroll timeout", ...]
// Capped at 100 entries, oldest first.

// Errors also flow to onError callback if configured.
```

## Scenario 6: Permanent Teardown (FR-019)

```js
// On page unload or when done with the library
window.LobGPS.teardown();

// Instance is permanently destroyed
window.LobGPS.enable();  // no-op
console.log(window.LobGPS.isActive);  // false
```

## Scenario 7: Duplicate Script Protection (FR-004)

```html
<!-- Both tags load — only the first initializes -->
<script src="lob-gps.iife.js"></script>
<script src="lob-gps.iife.js"></script>
```

**Expected behavior**: Exactly one shadow host, one set of observers, one `window.LobGPS` instance. No errors.

## Scenario 8: Full Pipeline Cycle (US5)

```text
User clicks #save-btn on messy-app.html
  ↓
Mapper detects DOM mutation (Action Items section appears)
  ↓ StateChangeEvent { previousStateKey, newStateKey, trigger, timestamp }
Pipeline receives event (debounce gate open — first event)
  ↓
Telemetry.record(stateKey, selector, ActionType.CLICK)
  ↓
Engine.query(newStateKey) → Suggestion[]
  ↓
OverlayUI.render(suggestions) → pulse + label + mini-map
  ↓
Debounce gate closes for 100ms
  ↓ (any events during this window are dropped)
Timer fires after 100ms → gate reopens

Total pipeline time: <50ms (from StateChangeEvent to UI.render() call)
```

## Scenario 9: Auto-Disable on Cascading Failures (FR-022)

```text
Pipeline cycle 1: Engine.query() throws → error buffered, consecutiveErrors = 1
Pipeline cycle 2: Engine.query() throws → consecutiveErrors = 2
...
Pipeline cycle 5: Engine.query() throws → consecutiveErrors = 5 (within 10s)
  ↓
Auto-disable triggered:
  - LobGPS transitions to DISABLED state
  - "Auto-disabled after 5 consecutive errors" event added to error buffer
  - isActive → false
  - Overlay removed

// Recovery requires explicit re-enable:
window.LobGPS.enable();  // reinitializes pipeline
```

## Programmatic Usage (ESM Import)

For consumers who import the library as a module (not via `<script>` tag):

```ts
import { LobGPS } from 'lob-ai-overlay-gps';
import type { LobGPSConfig } from 'lob-ai-overlay-gps';

const config: LobGPSConfig = {
  maxSuggestions: 3,
  debug: true,
};

const gps = new LobGPS(config);
// gps.isActive → true (auto-initializes)

// Later:
gps.disable();
gps.enable();
gps.teardown();
```

Note: Programmatic usage does NOT assign to `window.LobGPS`. The consumer manages the instance directly. The `boot.ts` IIFE entry point handles the `window.LobGPS` global assignment.
