# lob-gps

GPS-style UI guidance for legacy line-of-business applications. Observes user interactions, learns navigation patterns, and renders non-intrusive visual overlays (pulse animations, labels, mini-map) that guide users toward their next likely action.

No host app modifications required. Zero runtime dependencies.

## How it works

Five coordinated modules:

- **Mapper** — Watches the DOM for meaningful changes and generates stable CSS selectors and state keys for each interaction point
- **Telemetry** — Records interactions and tracks frequency per state key, persisted in `localStorage`
- **Engine** — Ranks recorded interactions by frequency and merges them with any hand-authored curated paths to produce ordered suggestions
- **UI** — Renders a Shadow DOM overlay (pulse, label, mini-map) on top of the host page without interfering with its CSS or events
- **Integration** — Wires the modules together, manages lifecycle, and handles errors

The pipeline on each state change: `Mapper → (debounce 100ms) → Telemetry → Engine → UI`

## Install

```bash
bun install
```

## Development

Start the Vite dev server:

```bash
bun run dev
```

Run unit tests:

```bash
bun run test
```

Run end-to-end tests (Playwright):

```bash
bun run test:e2e
```

Type-check:

```bash
bun run lint
```

Build (CJS + ESM + types into `dist/`):

```bash
bun run build
```

## Usage

### Drop-in script tag (zero config)

Include `boot.ts` (or the built `dist/boot.js`) and LobGPS initializes automatically on `DOMContentLoaded`:

```html
<script type="module" src="/dist/boot.js"></script>
```

After the first few interactions on a page, the overlay will start appearing.

### Pre-configure before boot

Set `window.LobGPS` to a config object before the boot script runs:

```html
<script>
  window.LobGPS = {
    maxSuggestions: 3,
    debug: true,
    killSwitch: 'Ctrl+Shift+K',
    onError: (err) => console.error('[lob-gps]', err),
  };
</script>
<script type="module" src="/dist/boot.js"></script>
```

After boot, `window.LobGPS` is replaced with the live API proxy (see below).

### Curated paths

Hand-author explicit guidance paths that take priority over frequency-based predictions:

```js
window.LobGPS = {
  curatedPaths: [
    {
      id: 'submit-order',
      name: 'Submit Order',
      steps: [
        {
          stateKey: '/order-form::#customer-id',
          targetSelector: '#next-btn',
          label: 'Continue to review',
          stepNumber: 1,
        },
        {
          stateKey: '/order-review::',
          targetSelector: '#submit-btn',
          label: 'Submit order',
          stepNumber: 2,
        },
      ],
    },
  ],
};
```

`stateKey` format is `{urlKey}::{normalizedSelector}`. Use the programmatic API (see below) with `debug: true` to log state keys as you navigate.

### Programmatic API

After boot, control the overlay at runtime via `window.LobGPS`:

```js
window.LobGPS.enable();          // Re-enable if disabled
window.LobGPS.disable();         // Disable overlay (telemetry data preserved)
window.LobGPS.configure({ maxSuggestions: 1 }); // Update config at runtime
window.LobGPS.teardown();        // Permanent cleanup — cannot re-enable

window.LobGPS.version;           // "0.1.0"
window.LobGPS.isActive;          // true | false
window.LobGPS.errors;            // Error[] — recent errors from the error buffer
```

### ES module import

Use the modules directly in your own build:

```ts
import { LobGPS } from 'lob-ai-overlay-gps';

const gps = new LobGPS({
  maxSuggestions: 3,
  debug: true,
});
```

## Configuration reference

| Option | Type | Default | Description |
|---|---|---|---|
| `maxSuggestions` | `number` | `3` | Max suggestions shown at once |
| `curatedPaths` | `CuratedPath[]` | `[]` | Hand-authored guidance paths |
| `telemetryProvider` | `TelemetryProvider` | `LocalStorageProvider` | Custom storage backend |
| `storageCap` | `number` | `1048576` (1MB) | localStorage cap in bytes |
| `namespace` | `string` | `lob-gps:telemetry` | localStorage key namespace |
| `useFingerprinting` | `boolean` | `false` | Use semantic page fingerprint instead of URL in state keys |
| `dynamicIdDenylist` | `string[]` | `[]` | Additional regex patterns to treat as dynamic IDs |
| `dynamicIdAllowlist` | `string[]` | `[]` | Patterns that override denylist |
| `maxAncestorDepth` | `number` | `5` | DOM path depth limit for selector generation |
| `miniMapAnchor` | `MiniMapAnchor` | `bottom-right` | Mini-map position |
| `zIndex` | `number` | auto | z-index for overlay elements |
| `killSwitch` | `string` | `Ctrl+Shift+K` | Keyboard combo to toggle disable |
| `debug` | `boolean` | `false` | Log pipeline events to console |
| `onError` | `(err: Error) => void` | `undefined` | Error callback |
| `errorThreshold` | `number` | `5` | Errors before auto-disable |
| `errorWindowMs` | `number` | `10000` | Time window for error threshold (ms) |

## Custom telemetry provider

Implement `TelemetryProvider` to use any storage backend:

```ts
import type { TelemetryProvider, TransitionPacket, FrequencyEntry, StateKey } from 'lob-ai-overlay-gps';

const myProvider: TelemetryProvider = {
  record(packet: TransitionPacket): void {
    // persist packet
  },
  query(stateKey: StateKey): FrequencyEntry[] {
    // return aggregated entries for stateKey
  },
  flush(): void {
    // optional: force-write buffered data
  },
};

window.LobGPS = { telemetryProvider: myProvider };
```

## Known limitations (v0.1.0)

- No iframe support
- No Shadow DOM introspection on host elements
- Selector generation must complete within 5ms (FR-013); very deep or unusual DOM trees may fall back to DOM-path selectors
- Telemetry stores interaction counts only — no input values or sensitive data are recorded
