# Card Counter Specification

**Date:** 2025-12-04
**Design Decision:** Counter-based cards (no animations)
**Card Size:** 240x240px (configurable via CSS variable)

## Design Philosophy

**Counters > Animations** because:
- Instant readability for attention economy gameplay
- Lower performance overhead (60 FPS easier with 25 cards)
- Command console aesthetic (dashboards show metrics)
- Quick scanning across viewport
- Clear decision-making data

## Card Layout Template (240x240px)

```
┌─────────────────────────────────────┐
│ CARD NAME            T# [✓]     ●  │ 50px Header
├─────────────────────────────────────┤
│                                     │
│             ICON                    │
│            (60x60)                  │
│                                     │
│       PRIMARY COUNTER (24px)        │ 140px Body
│                                     │
│  Secondary Counter  Secondary       │
│  Tertiary stat      Tertiary        │
│                                     │
├─────────────────────────────────────┤
│  ← Input  ↑ Input  → Output ↓ Out  │ 50px Footer
│  Status Bar: ▓▓▓▓▓▓░░░ (##%)       │
└─────────────────────────────────────┘
```

## Typography Hierarchy

**Header (50px height):**
- Card name: 14px bold, max 16 characters
- Tier badge: 20x20px
- Automation indicator: 16x16px (✓ = auto, ⏰ = queued, ✋ = manual)
- Status LED: 8x8px (● green/yellow/red)

**Body (140px height):**
- Icon: 60x60px centered
- Primary counter: 24px bold (main metric)
- Secondary counters: 16px regular (supporting metrics)
- Tertiary stats: 12px regular (detailed info)

**Footer (50px height):**
- I/O labels: 11px regular
- Bar labels: 11px regular
- Arrows/icons: 16x16px

## The 8 Core Card Types - Counter Definitions

### 1. Extractor (Mining)

**Primary Counter:** Ore output rate
**Secondary:** Efficiency %, Jam count
**Tertiary:** Heat %, Automation status

**T0 - Basic Mining Laser (Manual)**
```
┌─────────────────────────────────────┐
│ Mining Laser          T0        ●  │
├─────────────────────────────────────┤
│             ⛏️                       │
│                                     │
│          [  FIRE  ]                 │ Button (100x40px)
│                                     │
│         ORE: 247                    │ Total mined
│                                     │
│    Last: +5        Clicks: 49      │
│                                     │
├─────────────────────────────────────┤
│  ← None  ↑ None  → None  ↓ None   │
│  Durability: ▓▓▓▓▓▓▓░░░  (82%)     │
└─────────────────────────────────────┘
```

**T2 - Deep Drill (Automated)**
```
┌─────────────────────────────────────┐
│ Deep Drill            T2 ✓      ●  │
├─────────────────────────────────────┤
│             ⛏️                       │
│                                     │
│         +42 ORE/min                 │
│                                     │
│    Efficiency: 94%    Jams: 2      │
│    Heat: 23%          Auto: ON     │
│                                     │
├─────────────────────────────────────┤
│  ← None   ↑ None   → C5   ↓ None  │
│  Health: ▓▓▓▓▓▓▓░░░  (87%)         │
└─────────────────────────────────────┘
```

**T3 - Harmonic Siphon (Wonder, 2x1 wide)**
```
┌───────────────────────────────────────────────────────────┐
│ Harmonic Siphon          T3 WONDER              ●        │
├───────────────────────────────────────────────────────────┤
│        ⛏️                              Harmonics: 3       │
│                                        ● ● ●             │
│   +85 ORE/min              Resonance: ▓▓▓▓▓▓▓▓▓░ (98%)   │
│                                                           │
│   Efficiency: 142%         Neighbors: C4, C6, D5         │
│   Pass-Through: YES        Bonus: +42 ORE/min            │
│                                                           │
├───────────────────────────────────────────────────────────┤
│  ← C4 Refinery  ↑ None  → C6 Storage  ↓ D5 Reactor      │
└───────────────────────────────────────────────────────────┘
```

### 2. Processor (Refining)

**Primary Counter:** Conversion rate (Input → Output)
**Secondary:** Queue depth, Efficiency %
**Tertiary:** Recipe name, Waste

**T0 - Basic Smelter**
```
┌─────────────────────────────────────┐
│ Smelter               T0        ●  │
├─────────────────────────────────────┤
│             🔥                       │
│                                     │
│       5 ORE → 2 ALLOY               │
│                                     │
│    Queue: 3/10       Eff: 100%     │
│    Recipe: Basic     Time: 12s     │
│                                     │
├─────────────────────────────────────┤
│  ← C3 Ore  ↑ None  → C5 Bay ↓ None│
│  Progress: ▓▓▓▓▓▓░░░░  (67%)       │
└─────────────────────────────────────┘
```

**T3 - Exotic Matter Kiln (Wonder)**
```
┌─────────────────────────────────────┐
│ Exotic Kiln        T3 WONDER    ●  │
├─────────────────────────────────────┤
│             🔥                       │
│                                     │
│     1 ORE → 5 EXOTIC                │
│                                     │
│    Queue: 12/20      Yield: 250%   │
│    Clean: 100%       Time: 45s     │
│                                     │
├─────────────────────────────────────┤
│  ← C3 Ore  ↑ None  → D3 Lab ↓ None│
│  Quality: ▓▓▓▓▓▓▓▓▓▓  (100%)       │
└─────────────────────────────────────┘
```

### 3. Storage (Logistics)

**Primary Counter:** Capacity fraction
**Secondary:** Fill %, Throughput
**Tertiary:** Filter status, Priority

**T0 - Cargo Bay**
```
┌─────────────────────────────────────┐
│ Cargo Bay             T1        ●  │
├─────────────────────────────────────┤
│             📦                       │
│                                     │
│          247 / 1000                 │
│                                     │
│    Fill: 25%         Sort: OFF     │
│    In: +15/m         Out: -8/m     │
│                                     │
├─────────────────────────────────────┤
│  ← C3 Ore  ↑ None  → C5 Ref ↓ None│
│  Capacity: ▓▓░░░░░░░░  (25%)       │
└─────────────────────────────────────┘
```

**T3 - Klein Bottle (Wonder)**
```
┌─────────────────────────────────────┐
│ Klein Bottle       T3 WONDER    ●  │
├─────────────────────────────────────┤
│             ∞                        │
│                                     │
│         8,472 / ∞                   │
│                                     │
│    Infinite: YES    Throttle: 5/s  │
│    Filter: ORE      Priority: MED  │
│                                     │
├─────────────────────────────────────┤
│  ← ALL    ↑ ALL    → ALL    ↓ ALL │
│  Flow Rate: Limited (5 items/s)    │
└─────────────────────────────────────┘
```

### 4. Reactor (Energy)

**Primary Counter:** Energy generation rate
**Secondary:** Buffer level, Net production
**Tertiary:** Fuel status, Temperature

**T1 - Battery Bank**
```
┌─────────────────────────────────────┐
│ Battery               T1        ●  │
├─────────────────────────────────────┤
│             🔋                       │
│                                     │
│         500 / 500 E                 │
│                                     │
│    Charge: 100%      In: +15/s     │
│    Drain: -8/s       Net: +7/s     │
│                                     │
├─────────────────────────────────────┤
│  ← C2 Solar  ↑ None → ALL ↓ None  │
│  Buffer: ▓▓▓▓▓▓▓▓▓▓  (100%)        │
└─────────────────────────────────────┘
```

**T3 - Zero-Point Prism (Wonder)**
```
┌─────────────────────────────────────┐
│ Zero-Point         T3 WONDER    ●  │
├─────────────────────────────────────┤
│             ⚡                        │
│                                     │
│         +25 ENERGY/s                │
│                                     │
│    Buffer: FULL      Tuned: 98%    │
│    Passive: YES      Stable: YES   │
│                                     │
├─────────────────────────────────────┤
│  Distributing → All Adjacent Cards  │
│  Stability: ▓▓▓▓▓▓▓▓▓░  (98%)      │
└─────────────────────────────────────┘
```

### 5. Engine (Propulsion)

**Primary Counter:** Travel time or Jump status
**Secondary:** Fuel level, Cooldown
**Tertiary:** Destination, Damage

**T1 - Ion Drive**
```
┌─────────────────────────────────────┐
│ Ion Drive             T1        ●  │
├─────────────────────────────────────┤
│             🚀                       │
│                                     │
│       Next: 45 seconds              │
│                                     │
│    Fuel: 85%         Speed: 1.0x   │
│    Dest: Sector 7    ETA: 0:45     │
│                                     │
├─────────────────────────────────────┤
│  ← C2 Tank  ↑ None → None ↓ None  │
│  Thrust: ▓▓▓▓▓▓▓▓░░  (85%)         │
└─────────────────────────────────────┘
```

**T2 - Blink Drive (Dread)**
```
┌─────────────────────────────────────┐
│ Blink Drive        T2 DREAD    ●  │
├─────────────────────────────────────┤
│             ⚡                        │
│                                     │
│         INSTANT JUMP                │
│                                     │
│    Cooldown: 30s     Damage: 15%   │
│    Charges: 3        Risk: HIGH    │
│                                     │
├─────────────────────────────────────┤
│  ← None  ↑ None  → None  ↓ None   │
│  Hull Integrity: ▓▓▓▓▓▓▓░░░ (85%)  │
└─────────────────────────────────────┘
```

### 6. Sensor (Map/Detection)

**Primary Counter:** Scan range or Detection count
**Secondary:** Filter status, Reveal chance
**Tertiary:** Next scan time, Anomaly count

**T0 - LIDAR**
```
┌─────────────────────────────────────┐
│ LIDAR                 T0        ●  │
├─────────────────────────────────────┤
│             📡                       │
│                                     │
│       Range: 3 sectors              │
│                                     │
│    Detected: 5       Filter: ALL   │
│    Next Scan: 10s    Quality: 60%  │
│                                     │
├─────────────────────────────────────┤
│  ← None  ↑ None  → None  ↓ None   │
│  Scan Progress: ▓▓▓▓░░░░  (45%)    │
└─────────────────────────────────────┘
```

**T3 - Anomaly Oracle (High Tier)**
```
┌─────────────────────────────────────┐
│ Anomaly Oracle        T3        ●  │
├─────────────────────────────────────┤
│             🔮                       │
│                                     │
│       Anomalies: 3                  │
│                                     │
│    Revealed: Wonder x2, Dread x1   │
│    Next: 5s          Accuracy: 95% │
│                                     │
├─────────────────────────────────────┤
│  ← None  ↑ None  → None  ↓ None   │
│  Oracle Power: ▓▓▓▓▓▓▓▓▓░ (95%)    │
└─────────────────────────────────────┘
```

### 7. Habitat (Crew/Morale)

**Primary Counter:** Crew count
**Secondary:** Morale level, Capacity
**Tertiary:** Growth rate, Conditions

**T1 - Crew Quarters**
```
┌─────────────────────────────────────┐
│ Crew Quarters         T1        ●  │
├─────────────────────────────────────┤
│             👥                       │
│                                     │
│           5 / 10 crew               │
│                                     │
│    Morale: 75% 😊    Growth: +1/hr │
│    Comfort: Good     Health: 100%  │
│                                     │
├─────────────────────────────────────┤
│  ← None  ↑ None  → None  ↓ None   │
│  Happiness: ▓▓▓▓▓▓▓░░░  (75%)      │
└─────────────────────────────────────┘
```

**T3 - Arcology (Wonder)**
```
┌─────────────────────────────────────┐
│ Arcology           T3 WONDER    ●  │
├─────────────────────────────────────┤
│             🏙️                       │
│                                     │
│         50 / 100 crew               │
│                                     │
│    Morale: 98% 😁    Bonus: +25%   │
│    Utopia: ACTIVE    Prod: +50%    │
│                                     │
├─────────────────────────────────────┤
│  Happiness Buffs → All Cards       │
│  Paradise: ▓▓▓▓▓▓▓▓▓▓  (98%)       │
└─────────────────────────────────────┘
```

### 8. Lab (Research/Knowledge)

**Primary Counter:** Research progress or Knowledge rate
**Secondary:** Active research name, Time remaining
**Tertiary:** Artifacts, Discoveries

**T1 - Computer Core**
```
┌─────────────────────────────────────┐
│ Computer Core         T1        ●  │
├─────────────────────────────────────┤
│             💻                       │
│                                     │
│       +5 KNOWLEDGE/min              │
│                                     │
│    Research: T2 Drill    ETA: 2m   │
│    Progress: 67%     Queue: 2      │
│                                     │
├─────────────────────────────────────┤
│  ← None  ↑ None  → None  ↓ None   │
│  Research: ▓▓▓▓▓▓▓░░░  (67%)       │
└─────────────────────────────────────┘
```

**T4 - The Museum (Wonder)**
```
┌─────────────────────────────────────┐
│ The Museum         T4 WONDER    ●  │
├─────────────────────────────────────┤
│             🏛️                       │
│                                     │
│       Artifacts: 12                 │
│                                     │
│    Preserved: 12     Buffs: +60%   │
│    Knowledge: +25/m  Bonus: ALL    │
│                                     │
├─────────────────────────────────────┤
│  Preserving → All Knowledge        │
│  Collection: ▓▓▓▓▓▓▓▓  (12/15)     │
└─────────────────────────────────────┘
```

## Status LED Color Coding

**Green (● #52c41a):**
- Efficiency > 80%
- No issues
- Running smoothly

**Yellow (● #faad14):**
- Efficiency 50-80%
- Sub-optimal performance
- Warning state

**Red (● #f5222d):**
- Efficiency < 50%
- Critical issue (jammed, overheating, offline)
- Immediate attention required

**Pulsing Red:**
- Emergency state
- Cascading crisis
- Must respond in 30s

## I/O Indicator Format

```
← [Source] [Resource]
↑ [Source] [Resource]
→ [Destination] [Resource]
↓ [Destination] [Resource]
```

Examples:
- `← C3 Ore` (receiving Ore from card at C3)
- `→ ALL Energy` (distributing Energy to all adjacent)
- `↑ None` (no connection on top edge)

## Bar Indicator Types

**Health Bar:** Physical durability
- Green: > 80%
- Yellow: 50-80%
- Red: < 50%

**Efficiency Bar:** Performance metric
- Green: > 80%
- Yellow: 60-80%
- Red: < 60%

**Capacity Bar:** Fill level
- Green: < 70%
- Yellow: 70-90%
- Red: > 90% (danger of overflow)

**Progress Bar:** Time-based completion
- Blue: Active process
- Green: Complete (tap to collect)

## Minified State (Automated Cards)

When cards are fully automated and performing well, they can be visually "minified" to reduce attention demand:

```
┌──────────┐
│ ⛏️  T2   │ 20px (icon + tier)
│    ●     │ 8px (status LED)
│  +42/m   │ 20px (primary counter only)
└──────────┘
Visual scale: 0.5 (120px effective)
Grid space: Still occupies 1x1 (240px)
```

## Performance Considerations

**Update Frequency:**
- Primary counters: 2 Hz (twice per second)
- Secondary counters: 1 Hz (once per second)
- Tertiary stats: 0.5 Hz (every 2 seconds)
- I/O indicators: On change only
- Bars: Smooth CSS transitions (60 FPS)

**DOM Updates:**
- Use `textContent` not `innerHTML`
- Batch updates per frame
- Only update visible cards
- Throttle off-screen cards to 0.2 Hz

## Accessibility

**Font Sizes:**
- Minimum readable: 12px
- Primary data: 24px (easily scannable)
- Supporting data: 16px
- Detail data: 12px

**Color Contrast:**
- Text on dark background: #c5c6c7 (high contrast)
- Status colors meet WCAG AA standards
- LED indicators also use position (always same corner)

**Keyboard Navigation:**
- Tab through cards
- Enter to open inspector
- Arrow keys to navigate grid
- Number keys to jump to card slots

## CSS Variable Architecture

**Implementation Note (2025-12-05):**
Use CSS variables for card sizing from day one to enable rapid experimentation and responsive design.

```css
:root {
  --card-size: 200px;
  --card-header: 50px;
  --card-body: 100px;
  --card-footer: 50px;
  --viewport-cols: 5;
  --viewport-rows: 4;
}
```

**Rationale:**
- Easier to scale down later than discover insufficient space
- Enables responsive sizing tiers without HTML changes
- Allows for A/B testing of card density

**Recommended Default: 200px with 5×4 viewport (1000×800px)**
- Fits comfortably on 1920×1080 after browser chrome (~900-950px usable height)
- Leaves ~100px vertical breathing room
- 11% more space than 180px for counter hierarchy
- Shows 20 cards at once (sufficient for early/mid game)

**Alternative Size Tiers:**
- Mobile: 160px (3×3 viewport = 480×480px)
- Desktop 1080p: 200px (5×4 viewport = 1000×800px) ← **Recommended Default**
- Desktop 1440p: 240px (5×5 viewport = 1200×1200px)
- Ultrawide: 280px (6×5 viewport = 1680×1400px)

## Implementation Priority

1. **Phase 1:** Basic counter display (all 8 card types, T0-T1)
2. **Phase 2:** Status LEDs + I/O indicators
3. **Phase 3:** Bars (health, efficiency, capacity)
4. **Phase 4:** Minified state for automated cards
5. **Phase 5:** Polish (hover states, transitions, color coding)
