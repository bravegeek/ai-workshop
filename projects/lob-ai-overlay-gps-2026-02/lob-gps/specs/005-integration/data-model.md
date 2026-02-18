# Data Model: Integration Layer

**Branch**: `005-integration` | **Date**: 2026-02-17

## Entities

### LobGPS (Public API Facade)

The singleton global API object exposed as `window.LobGPS`.

**Properties (read-only)**:

| Field | Type | Description |
|-------|------|-------------|
| `version` | `string` | Semantic version from package.json (build-time inlined) |
| `isActive` | `boolean` | `true` when overlay is running, `false` when disabled or torn down |
| `errors` | `Error[]` | Copy of the ring buffer contents, oldest to newest |

**Methods**:

| Method | Signature | Description |
|--------|-----------|-------------|
| `enable()` | `() => void` | Reinitializes overlay after `disable()`. No-op if active or torn down. |
| `disable()` | `() => void` | Tears down all modules, preserves telemetry. No-op if already disabled or torn down. |
| `configure(options)` | `(options: Partial<LobGPSConfig>) => void` | Merges options into active config. Takes effect on next pipeline cycle. No-op if disabled or torn down. |
| `teardown()` | `() => void` | Permanently destroys the instance. `enable()` becomes a no-op after this. |

### LobGPSState (Lifecycle State Machine)

```text
                 ┌─────────────────────┐
                 │                     │
    init ──────► │      ACTIVE         │ ◄──── enable()
                 │                     │
                 └────────┬────────────┘
                          │
              disable()   │   teardown()
           ┌──────────────┼──────────────┐
           ▼              │              ▼
    ┌─────────────┐       │      ┌──────────────┐
    │  DISABLED   │───────┘      │  TORN_DOWN   │
    │             │──────────────►│  (terminal)  │
    └─────────────┘  teardown()  └──────────────┘
           │
           │ enable()
           ▼
    ┌─────────────┐
    │   ACTIVE    │
    └─────────────┘
```

| State | `isActive` | `enable()` | `disable()` | `configure()` | `teardown()` |
|-------|-----------|------------|-------------|---------------|-------------|
| ACTIVE | `true` | no-op | → DISABLED | applies config | → TORN_DOWN |
| DISABLED | `false` | → ACTIVE | no-op | no-op | → TORN_DOWN |
| TORN_DOWN | `false` | no-op | no-op | no-op | no-op |

Auto-disable (FR-022) transitions from ACTIVE → DISABLED.

### LobGPSConfig

Unified configuration that fans out to module-specific configs at init time.

| Group | Field | Type | Default | Maps to |
|-------|-------|------|---------|---------|
| Engine | `maxSuggestions` | `number` | `3` | `EngineConfig.maxSuggestions` |
| Engine | `curatedPaths` | `CuratedPath[]` | `[]` | `EngineConfig.curatedPaths` |
| Telemetry | `telemetryProvider` | `TelemetryProvider` | `new LocalStorageProvider(...)` | `TelemetryConfig.provider` |
| Telemetry | `storageCap` | `number` | `1_048_576` | `TelemetryConfig.storageCap` |
| Telemetry | `namespace` | `string` | `"lob-gps:telemetry"` | `TelemetryConfig.namespace` |
| Mapper | `useFingerprinting` | `boolean` | `false` | `MapperConfig.useFingerprinting` |
| Mapper | `dynamicIdDenylist` | `string[]` | `[]` | `MapperConfig.dynamicIdDenylist` |
| Mapper | `dynamicIdAllowlist` | `string[]` | `[]` | `MapperConfig.dynamicIdAllowlist` |
| Mapper | `maxAncestorDepth` | `number` | `5` | `MapperConfig.maxAncestorDepth` |
| UI | `miniMapAnchor` | `MiniMapAnchor` | `"bottom-right"` | `UIConfig.miniMapAnchor` |
| UI | `zIndex` | `number` | (auto) | `UIConfig.zIndex` |
| Integration | `killSwitch` | `string` | `"Ctrl+Shift+K"` | Kill switch listener key combo |
| Integration | `debug` | `boolean` | `false` | Enables `console.warn` for caught errors |
| Integration | `onError` | `(error: Error) => void` | `undefined` | External error callback (additive with buffer) |
| Integration | `errorThreshold` | `number` | `5` | Consecutive errors before auto-disable |
| Integration | `errorWindowMs` | `number` | `10_000` | Time window for error threshold |

### Pipeline (Internal Orchestrator)

| Field | Type | Description |
|-------|------|-------------|
| `mapper` | `Mapper` | Active Mapper instance |
| `telemetry` | `Telemetry` | Active Telemetry instance (persists across disable/enable) |
| `engine` | `Engine` | Active Engine instance |
| `ui` | `OverlayUI` | Active UI instance |
| `debounceTimer` | `number \| null` | Leading-edge debounce cooldown timer ID |
| `debounceGateOpen` | `boolean` | `true` when next event should execute, `false` during cooldown |
| `consecutiveErrors` | `number` | Counter for auto-disable threshold |
| `errorWindowStart` | `number` | `performance.now()` of first error in current window |

**Pipeline Cycle**:
1. StateChangeEvent received from Mapper
2. Debounce gate check — drop if within cooldown
3. Record transition in Telemetry
4. Query Engine for suggestions
5. Render suggestions via UI
6. Each step wrapped in independent try-catch

### ErrorBuffer (Capped Ring Buffer)

| Field | Type | Description |
|-------|------|-------------|
| `buffer` | `Error[]` | Fixed-length array, size 100 |
| `writeIndex` | `number` | Next write position (wraps at 100) |
| `count` | `number` | Total errors written (for knowing if buffer has wrapped) |

**Operations**:
- `push(error: Error)`: Write at `writeIndex`, increment and wrap
- `toArray(): Error[]`: Return chronologically ordered copy (oldest first)
- `clear()`: Reset buffer, index, and count

### KillSwitchDescriptor (Internal)

Parsed representation of a key combo string.

| Field | Type | Description |
|-------|------|-------------|
| `ctrl` | `boolean` | Ctrl key required |
| `shift` | `boolean` | Shift key required |
| `alt` | `boolean` | Alt key required |
| `meta` | `boolean` | Meta/Cmd key required |
| `key` | `string` | The letter/key, uppercased (e.g., `"K"`) |

## Relationships

```text
LobGPS (1) ──────── manages ──────── (1) Pipeline
LobGPS (1) ──────── owns ─────────── (1) ErrorBuffer
LobGPS (1) ──────── owns ─────────── (1) KillSwitchDescriptor
LobGPS (1) ──────── stores ────────── (1) LobGPSConfig (resolved)
Pipeline (1) ────── creates ────────── (1) Mapper
Pipeline (1) ────── receives ───────── (1) Telemetry (shared, survives disable/enable)
Pipeline (1) ────── creates ────────── (1) Engine
Pipeline (1) ────── creates ────────── (1) OverlayUI
```

Key relationship: **Telemetry** is shared across disable/enable cycles (FR-014). When `disable()` is called, the Pipeline tears down Mapper, Engine, and UI, but Telemetry persists. On `enable()`, a new Pipeline is created with the existing Telemetry instance.
