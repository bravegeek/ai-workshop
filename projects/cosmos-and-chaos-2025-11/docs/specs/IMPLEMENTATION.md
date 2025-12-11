# Cosmos and Chaos - Implementation Guide

**Last Updated:** 2025-12-05
**Status:** Pre-Implementation
**Target Platform:** Web Browser (Desktop-First, 1920×1080)

This document describes **how to build** the game described in DESIGN.md.

---

## Technical Specifications

### Performance Targets
- **60 FPS** with 25+ cards visible
- **CSS-only effects** (no Canvas/WebGL/SVG filters)
- Desktop-first design, responsive down to 1920×1080
- Grid system: 10×10 total capacity, 5×4 viewport (1000×800px visible)

### Card Sizing (CSS Variables)

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

**Viewport:** 5×4 = 1000×800px (fits 1920×1080 after browser chrome)

**Alternative Size Tiers:**
- Mobile: 160px (3×3 viewport)
- Desktop 1080p: 200px (5×4 viewport) ← **Default**
- Desktop 1440p: 240px (5×5 viewport)
- Ultrawide: 280px (6×5 viewport)

See `card_counter_spec.md` for detailed card layout specifications.

---

## UI Layout: The Command Console

### Zone Layout (Desktop)

```
┌─────────────────────────────────────────────────────┐
│ ┌──────────┐  ┌────────────────────┐  ┌──────────┐ │
│ │          │  │                    │  │          │ │
│ │   Log    │  │    Grid Canvas     │  │   Data   │ │
│ │   Feed   │  │    (5×4 viewport)  │  │   Stack  │ │
│ │  (Left)  │  │    1000×800px      │  │  (Right) │ │
│ │          │  │                    │  │          │ │
│ └──────────┘  └────────────────────┘  └──────────┘ │
└─────────────────────────────────────────────────────┘
```

### Zone A: The Log Feed (Left Sidebar)
- **Content:** Scrolling text log of ship events
- **Style:** Monospace font, terminal green (Wonder) or red (Dread) highlights
- **Width:** ~250px

### Zone B: The Grid Canvas (Center)
- **The Canvas:** 10×10 total grid capacity
- **The Viewport:** 5×4 window (1000×800px)
- **Scrolling:** Manual panning (Right-click drag or Edge Pan)
- **Visuals:** Dark PCB texture, subtle grid dots
- **Traces:** Faint lines connect adjacent slots, light up when cards communicate

### Zone C: The Data Stack (Right Sidebar)
- **Content:** Global Resource Counters (Ore, Energy, Knowledge)
- **Detail:** Hovering shows "Sparkline" graph (Production/Consumption rates)
- **Tech Tree Access:** Button/tab to slide out Research panel
- **Width:** ~250px

---

## Visual Style Guide

### Base Aesthetic
- **Visual Style:** Minimalist Sci-Fi
- **Dark background:** `#0b0c10`
- **Neon accents:** Cyan (Wonder) / Red-Orange (Dread)
- **Performance:** CSS-only animations and transforms

### The Neutral State (0-30% Wonder/Dread)

Baseline experience at game start or when player has no strong alignment.

| Feature | Specification |
| :--- | :--- |
| **Shape** | Perfect Square (`border-radius: 0`) |
| **Border** | 1px Solid Grey (`#666`) |
| **Background** | Dark Grey (`#1a1a1a`) |
| **Typography** | Monospace (Consolas/Courier) |
| **Motion** | Static (No transition) |

### Wonder UI Evolution

| Feature | CSS Implementation |
| :--- | :--- |
| **Shape** | Rounded (`border-radius: 8px`) |
| **Border** | 2px Solid Cyan (`#00d9ff`) |
| **Background** | Slightly lighter (`#2a2a3a`) |
| **Typography** | Sans-Serif (Roboto) |
| **Motion** | Smooth transitions (`transition: all 0.3s ease`) |

### Dread UI Evolution

| Feature | CSS Implementation |
| :--- | :--- |
| **Shape** | Sharp angles (`border-radius: 0`) |
| **Border** | 2px Solid Red (`#ff3333`) |
| **Background** | Pitch Black (`#000`) |
| **Typography** | Monospace / All Caps |
| **Motion** | Instant changes (`transition: none`) |

---

## The Wonder Gradient: UI Feature Unlocks

| Wonder % | Feature Name | Implementation |
| :--- | :--- | :--- |
| **10%** | **Liquid Tooltips** | Remove hover delay. Fade in instantly. Show exact costs. |
| **20%** | **Smart Grid Alignment** | When dragging card, neighbors shift with CSS `transform: translate`. |
| **30%** | **Profit Meters** | Green "+12/sec" text overlays on cards. |
| **40%** | **Smart Batching** | "Buy 1" button changes to "Buy 10" if affordable. |
| **50%** | **The Clean Interface** | `border-radius: 8px`, increased `padding`, soft colors. |
| **60%** | **Auto-Claim** | Finished jobs auto-transfer to inventory (no click required). |
| **70%** | **Focus Mode** | Unaffordable buttons: `opacity: 0.5`. |
| **80%** | **Time-to-Goal** | Tooltip shows: "Affordable in 2m 14s" countdown. |
| **90%** | **Harmony Links** | Colored borders (`border-color: gold`) connect synergistic cards. |
| **100%** | **The Singularity** | Cards auto-organize into perfect geometric patterns. |

---

## The Dread Gradient: UI Corruption Effects

| Dread % | Feature Name | Implementation |
| :--- | :--- | :--- |
| **10%** | **Flickering Readout** | JS: Briefly replace numbers with corrupted text. Color flash red. |
| **20%** | **Unstable Grid Frame** | `border-radius: 0`, `border-color: red`, CSS pulse animation. |
| **30%** | **Impact Resonance** | Click card → adjacent cards: `border-color: red` for 0.5s. |
| **40%** | **Data Scramble** | Tooltips show corrupted characters for 0.5s before correct text. |
| **50%** | **The Harsh Interface** | Darker background, jagged borders, increased contrast. |
| **60%** | **Phantom Inputs** | Randomly highlight buttons (`box-shadow: 0 0 10px red`). |
| **70%** | **System Bleed** | Red border indicators on shared card edges. |
| **80%** | **Feedback Loop** | Dread action → card border: `border-color: #ff0000` flash. |
| **90%** | **Reality Fracture** | Grid borders switch: `border-style: solid/dashed/dotted`. |
| **100%** | **The Breakdown** | Severe visual corruption. High contrast, difficult to read. |

---

## UI Physics Spectrum

The UI "feels" different based on Wonder/Dread alignment.

| Behavior | **Wonder (Luxury)** | **Neutral (Standard)** | **Dread (Rat Rod)** |
| :--- | :--- | :--- | :--- |
| **Drag Feel** | Magnetic Assist (snap from distance) | Standard 1:1 movement | Heavy Inertia (spring physics) |
| **Drag Preview** | Cyan border outline in target slot | Grey dashed border | No preview |
| **Expansion** | Auto-rearrange with CSS transitions | Manual button (disabled if blocked) | Bulldozer (pushes neighbors) |
| **Collision** | Polite Displacement (cards slide away) | Block (snap back) | Block (no overlap) |
| **Idle State** | Breathing (`opacity` pulse) | Static | Jitter (small `transform`) |

### Influence Thresholds (with 10% Hysteresis)

**0% - 30% (Neutral Zone):**
- Standard software behavior. Safe, predictable.

**30% - 70% (The Shift Begins):**
- Wonder Bias: Dragging smoother (magnetic snap radius ↑). Margins widen.
- Dread Bias: Cards feel heavy (drag lag). Margins tighten. Audio "clanks."

**70% - 90% (The Identity Lock):**
- Wonder High: "Smart Grid" activates. Auto-organization. Soft borders, rounded corners.
- Dread High: "Bulldozer" physics. Cards shove each other. Visual corruption/glitches.

**100% (The Extremes):**
- Wonder: Cards organize into perfect geometric patterns automatically.
- Dread: Cards overlap. UI elements become difficult to interact with.

---

## Dread Glitch System: The Escalation Ladder

High Dread manifests as "System Corruption" affecting UI reliability.

### Level 1: The "Dead Pixel" (Dissonance > 20%)
- **Symptom:** Minor visual artifacts. Single number flickers. Tooltip text garbled.
- **Fix:** Auto-corrects. Atmospheric.

### Level 2: The "Stuck Gauge" (Dissonance > 40%)
- **Symptom:** Resource counter freezes. Progress bar stuck at 99%.
- **Fix:** Single tap. Number jumps to correct value.
- **Implementation:** Click listener on frozen element triggers update.

### Level 3: The "Visual Static" (Dissonance > 60%)
- **Symptom:** Moving vertical bars obscure text. Rapid color cycling.
- **Fix:** Tap 1-3 times (RNG-based). Each tap has chance to clear.
- **Implementation:** CSS `animation` for bars/color cycle. JS click counter.

### Level 4: The "Glitch Storm" (Whiteout) (Dissonance > 80%)
- **Trigger:** Random event, probability scales with Dread.
- **Buildup:** Dread card borders bloom white (`border-color: #fff`, `box-shadow: 0 0 20px #fff`).
- **Climax:** Total Whiteout. Background fades to `#fff`. Text to light grey. Lasts X seconds.
- **Functionality:** Buttons still work. Memory test.

### Level 5: The "Reality Quake" (Dissonance > 95%)
- **Trigger:** Very rare OR guaranteed at 100% Dissonance.
- **Effect:** All cards randomly permuted on grid (JS shuffle positions).
- **Consequence:** Muscle memory broken. Adjacency bonuses lost. Must re-organize.

---

## Card System Implementation

### Card Archetypes

| Archetype | **Generators (Engines)** | **Modifiers (Attachments)** | **Globals (System)** |
| :--- | :--- | :--- | :--- |
| **Role** | Primary Resource Producers | Passive buffers / Active converters | System-wide effects |
| **Grid** | Solid Blocks (occupy space) | Fluid (can stack?) | Anchors (fixed/float) |
| **Visual** | Square (1×1 or 2×2), thick borders | Rectangular/Small, thin borders | Circular/Abstract |
| **Examples** | Mining Laser, Refinery, Reactor | Overclock Chip, Prism | Storage Node, AI Hub |

### Card Anatomy (200×200px)

```
┌─────────────────────────────────────┐
│ CARD NAME            T# [✓]     ●  │ 50px Header
├─────────────────────────────────────┤
│                                     │
│             ICON                    │ 100px Body
│            (60×60)                  │
│                                     │
│       PRIMARY COUNTER (24px)        │
│  Secondary Counter  Secondary       │
│  Tertiary stat      Tertiary        │
│                                     │
├─────────────────────────────────────┤
│  ← Input  ↑ Input  → Output ↓ Out  │ 50px Footer
│  Status Bar: ▓▓▓▓▓▓░░░ (##%)       │
└─────────────────────────────────────┘
```

**See `card_counter_spec.md` for:**
- Typography hierarchy (14px/24px/16px/12px/11px fonts)
- All 8 card type layouts (Extractor, Processor, Storage, Reactor, Engine, Sensor, Habitat, Lab)
- Status LED color coding (Green/Yellow/Red)
- I/O indicator format
- Bar indicator types
- Update frequencies (2Hz primary, 1Hz secondary, 0.5Hz tertiary)

---

## Card Evolution & Connectivity

### Evolution Examples

**The Mining Laser (Extractor)**

**Tier 0: Proton Cutter** (1×1)
- Simple manual clicker.
- Visual: Dark background, border flashes on click.

**Tier 2: Resonant Drill** (1×1)
- Automates mining.
- Visual: Gentle opacity pulse.

**Tier 3 Fork:**
- **T17 Wonder: Harmonic Siphon** (2×1 Wide)
  - Pass-through mining.
  - Visual: Soft blue border on right side.
  - Adjacency: Borders pulse in sync with adjacent Crystal Formation.

- **T18 Dread: Rift Bore** (1×2 Tall)
  - "The Leech" - drains neighbors for massive speed.
  - Visual: Red border, heat indicator appears.
  - Adjacency: Burns neighbors (red connection border).

### Connectivity Rules

**Wonder: "The Flow"**
- **Visual:** Compatible cards touching → `border-color` changes to cyan.
- **Mechanic:** Chain Bonus. Mine → Refinery → Storage in sequence = +10% Output per card.
- **Implementation:** JS detects adjacency, calculates chain length, applies multiplier.

**Dread: "The Leech"**
- **Visual:** Connected Dread cards → red borders (`border-color: #ff3333`).
- **Mechanic:** Parasitic Gain. Dread card gets +50% Speed but drains neighbor (-1 Morale/sec or HP damage).
- **Implementation:** JS checks adjacent cards, applies bonus/penalty based on type.

---

## Drag & Drop System

### HTML5 Drag and Drop API

```javascript
// Pseudocode
card.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('cardId', card.id);
  // Wonder: Show cyan border ghost
  // Dread: No preview
});

grid.addEventListener('dragover', (e) => {
  e.preventDefault();
  // Wonder: Magnetic snap (check distance, auto-align)
  // Neutral: Standard behavior
  // Dread: Heavy inertia (delay position update)
});

grid.addEventListener('drop', (e) => {
  const cardId = e.dataTransfer.getData('cardId');
  // Check collision
  // Wonder: Polite displacement (shift neighbors)
  // Neutral: Block if occupied
  // Dread: Block if occupied
  // Update grid state
});
```

**Alternative:** Use library like `interact.js` for more control.

---

## Grid System Implementation

### CSS Grid Layout

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(10, var(--card-size));
  grid-template-rows: repeat(10, var(--card-size));
  gap: 8px;
  width: calc(var(--card-size) * 10 + 8px * 9);
  height: calc(var(--card-size) * 10 + 8px * 9);
}

.viewport {
  width: calc(var(--card-size) * var(--viewport-cols));
  height: calc(var(--card-size) * var(--viewport-rows));
  overflow: hidden;
  position: relative;
}

.card {
  width: var(--card-size);
  height: var(--card-size);
  border: 1px solid #666;
  background: #1a1a1a;
  transition: all 0.3s ease; /* Wonder mode */
}

/* Dread mode */
.dread .card {
  transition: none;
  border-color: #ff3333;
  background: #000;
}

/* Wonder mode */
.wonder .card {
  border-radius: 8px;
  border-color: #00d9ff;
  background: #2a2a3a;
}
```

### Viewport Scrolling

```javascript
// Right-click drag to pan
let isPanning = false;
let startX, startY, scrollLeft, scrollTop;

viewport.addEventListener('mousedown', (e) => {
  if (e.button === 2) { // Right-click
    isPanning = true;
    startX = e.pageX - viewport.offsetLeft;
    startY = e.pageY - viewport.offsetTop;
    scrollLeft = viewport.scrollLeft;
    scrollTop = viewport.scrollTop;
  }
});

viewport.addEventListener('mousemove', (e) => {
  if (!isPanning) return;
  const x = e.pageX - viewport.offsetLeft;
  const y = e.pageY - viewport.offsetTop;
  viewport.scrollLeft = scrollLeft - (x - startX);
  viewport.scrollTop = scrollTop - (y - startY);
});

viewport.addEventListener('mouseup', () => {
  isPanning = false;
});
```

---

## Interaction Models

### Mouse & Keyboard

- **Left Click:** Select Card (highlight, show stats in right sidebar)
- **Left Drag:** Move Card
- **Right Click:** Context Menu (Upgrade, Sell, Reboot, Pause)
- **Hover:** "X-Ray Vision" - fade background, show internal logic/raw numbers
- **Scroll Wheel:** Zoom In/Out (limited range)

### Click States (Rhythmic Interaction)

**State A: Conductor (Functioning)**
```javascript
// Pseudocode
const BPM = 120; // Beats per minute
const beatInterval = 60000 / BPM; // ms

let lastBeat = Date.now();
setInterval(() => {
  lastBeat = Date.now();
  // Pulse screen borders cyan
  document.body.classList.add('beat-pulse-cyan');
  setTimeout(() => {
    document.body.classList.remove('beat-pulse-cyan');
  }, 100);
}, beatInterval);

card.addEventListener('click', (e) => {
  const timeSinceLastBeat = Date.now() - lastBeat;
  if (timeSinceLastBeat < 100) { // Within 100ms of beat
    // Perfect Note! 2x Yield
    card.classList.add('perfect-note');
    produceResource(card, 2);
  } else {
    produceResource(card, 1);
  }
});
```

**State B: Mechanic (Stalled/Glitched)**
```javascript
// When card jams
card.classList.add('jammed');
card.style.borderColor = '#ff3333';
// Add rapid pulse animation

card.addEventListener('click', (e) => {
  if (card.classList.contains('jammed')) {
    // The Kick! Instant fix + surge
    card.classList.remove('jammed');
    card.classList.add('surge-boost');
    produceResource(card, 5);
    setTimeout(() => {
      card.classList.remove('surge-boost');
    }, 1000);
  }
});
```

---

## Card Automation Evolution

Cards visually evolve as automation level increases.

**Stage 1: Manual Tool (Tier 0)**
- Card has prominent "FIRE" button
- Player must click to produce

**Stage 2: Auto-Clicker (Tier 1)**
- Toggle switch appears: "Auto-Fire: ON/OFF"
- Rate gauge: "1/sec"
- Still clickable for manual boost

**Stage 3: Smart Logic (Tier 2)**
- "FIRE" button shrinks
- Target Selection UI: dropdown or toggles
- Card displays current target

**Stage 4: Full Automation (Tier 3+)**
- "Upgrade" button on card
- "Budget" slider/input
- "Auto-Level: ON/OFF" checkbox
- Card autonomously upgrades itself within budget

**Implementation:** Add/remove DOM elements based on card tier. Use CSS to transition sizing.

---

## Adjacency Visualization

### Wonder: Connection Flow

```javascript
// Check if cards are adjacent
function areAdjacent(card1, card2) {
  const dx = Math.abs(card1.gridX - card2.gridX);
  const dy = Math.abs(card1.gridY - card2.gridY);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

// If adjacent and compatible
if (areAdjacent(miner, refinery) && compatible(miner, refinery)) {
  // Change border color of shared edge
  const sharedEdge = getSharedEdge(miner, refinery);
  sharedEdge.style.borderColor = '#00d9ff'; // Cyan

  // Calculate chain bonus
  const chain = getChain(miner);
  const bonus = chain.length * 0.1; // +10% per card
  applyBonus(chain, bonus);
}
```

### Dread: Parasitic Connection

```javascript
// Dread card leeching from neighbor
if (areAdjacent(riftMiner, habitat) && riftMiner.isDread) {
  // Visual: Red border
  const sharedEdge = getSharedEdge(riftMiner, habitat);
  sharedEdge.style.borderColor = '#ff3333'; // Red

  // Mechanics
  riftMiner.speed *= 1.5; // +50% Speed
  habitat.morale -= 1; // -1 Morale/sec

  // Damage over time
  setInterval(() => {
    habitat.health -= 0.1; // Slow HP drain
  }, 1000);
}
```

---

## Technology Tree UI

**Not yet specified in detail. Placeholder notes:**

- Separate panel/modal
- Mermaid diagram for reference (see DESIGN.md)
- Clickable nodes
- Show prerequisites (greyed out if locked)
- Show Wonder/Dread alignment
- "Research" button triggers unlock sequence

---

## Audio Implementation

**Performance Note:** Use Web Audio API for efficiency. Avoid multiple `<audio>` elements.

### Audio Cues by Alignment

**Wonder:**
- Clean, harmonic tones
- Major chords
- Soft, rounded sounds (sine waves)

**Dread:**
- Distorted, harsh tones
- Dissonant chords
- Sharp, aggressive sounds (sawtooth waves)

**Neutral:**
- Simple clicks
- Basic tones

**Implementation:**
```javascript
const audioContext = new AudioContext();

function playWonderTone() {
  const oscillator = audioContext.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
  oscillator.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1);
}

function playDreadTone() {
  const oscillator = audioContext.createOscillator();
  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
  oscillator.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.2);
}
```

---

## Development Roadmap

### Phase 1: Core Grid & Cards (MVP)
1. HTML scaffold (3-zone layout)
2. CSS Grid system (10×10, 5×4 viewport)
3. Basic card template (HTML/CSS)
4. 8 core card types (Tier 0-1 only)
5. Drag & drop (basic, no physics)
6. Manual click production

**Deliverable:** Can place cards on grid, drag them, click to produce resources.

### Phase 2: Automation & Counters
1. Counter updates (2Hz/1Hz/0.5Hz)
2. Status LEDs (green/yellow/red logic)
3. I/O indicators (adjacency detection)
4. Auto-production (Tier 1 upgrades)
5. Basic resource system (Ore, Energy, etc.)

**Deliverable:** Cards auto-produce, display live counters, show health/efficiency.

### Phase 3: Wonder/Dread Systems
1. Dual counter implementation (Resonance/Dissonance)
2. Gradient systems (10%-100% features)
3. UI physics (drag feel, collision, idle states)
4. Visual evolution (CSS class switching)
5. Audio cues (Wonder/Dread tones)

**Deliverable:** Game feels different based on alignment. UI adapts visually and behaviorally.

### Phase 4: Tech Tree & Progression
1. Tech tree UI panel
2. Unlock system (cost/prerequisites)
3. Card evolution (Tier 0 → Tier 3 fork)
4. Paradox Protocol (Witness mechanics)
5. Research system

**Deliverable:** Full progression from Tier 0 to Tier 5. All 48 techs unlockable.

### Phase 5: Advanced Mechanics
1. Adjacency bonuses (Flow/Leech)
2. Dread glitch system (5 levels)
3. Rhythmic click system (Conductor/Mechanic/Flow)
4. Offline progress
5. Victory conditions (3 endings)

**Deliverable:** Complete game loop. All DESIGN.md mechanics implemented.

### Phase 6: Polish & Balance
1. Sound design
2. Animation polish
3. Balance tuning (resource costs, production rates)
4. Tutorial/onboarding
5. Performance optimization

**Deliverable:** Shippable game.

---

## Technical Stack Recommendations

**Minimal Stack (Recommended for Solo Dev):**
- **HTML5** (semantic markup)
- **CSS3** (Grid, Flexbox, Custom Properties, Animations)
- **Vanilla JavaScript** (ES6+)
- **No framework** (keep it simple, 60 FPS easier)

**Optional Libraries:**
- `interact.js` - Better drag & drop control
- `howler.js` - Simplified audio management (if Web Audio API feels too low-level)

**Build Tools (Optional):**
- Vite - Fast dev server, hot reload
- TypeScript - Type safety (if preferred)

**No Need For:**
- React/Vue/Svelte - Adds overhead, harder to hit 60 FPS with 25+ cards
- Canvas/WebGL - CSS is faster for this use case
- Physics engine - Custom drag physics are simple enough

---

## File Structure

```
/cosmos-and-chaos-2025-11/
├── index.html              (Main entry point)
├── css/
│   ├── reset.css           (CSS reset)
│   ├── variables.css       (CSS custom properties)
│   ├── layout.css          (3-zone grid layout)
│   ├── cards.css           (Card styling)
│   ├── wonder.css          (Wonder gradient effects)
│   └── dread.css           (Dread gradient effects)
├── js/
│   ├── main.js             (Entry point, game loop)
│   ├── grid.js             (Grid management)
│   ├── cards.js            (Card logic)
│   ├── drag.js             (Drag & drop)
│   ├── resources.js        (Resource management)
│   ├── tech-tree.js        (Tech unlock system)
│   ├── dual-counters.js    (Resonance/Dissonance)
│   ├── audio.js            (Sound system)
│   └── utils.js            (Helper functions)
├── assets/
│   ├── icons/              (Card icons - SVG preferred)
│   └── sounds/             (Audio files if not using Web Audio API)
├── DESIGN.md               (Game vision - what to build)
├── IMPLEMENTATION.md       (This file - how to build)
├── card_counter_spec.md    (Detailed card layouts)
├── desktop_ui.md           (UI layout details)
└── archive/
    └── session.md          (Historical brainstorming)
```

---

## Performance Optimization Checklist

- [ ] Use CSS `transform` and `opacity` for animations (GPU-accelerated)
- [ ] Avoid `width`, `height`, `top`, `left` animations (triggers layout)
- [ ] Use `will-change` sparingly (only on actively animating elements)
- [ ] Batch DOM updates (read all, then write all)
- [ ] Use `requestAnimationFrame` for game loop
- [ ] Throttle off-screen card updates to 0.2Hz
- [ ] Use `textContent` not `innerHTML` for counter updates
- [ ] Minimize CSS selector complexity
- [ ] Use event delegation for card clicks
- [ ] Debounce window resize events

---

## Next Steps

1. Review this document + DESIGN.md + card_counter_spec.md
2. Create `index.html` scaffold
3. Build CSS Grid system
4. Create first card (T01 Mining Laser - manual clicker)
5. Implement basic click → produce resource
6. Iterate from there

---

**End of Implementation Guide**

*For game design, mechanics, and tech tree details, see DESIGN.md*
*For detailed card specifications, see card_counter_spec.md*
*For desktop layout details, see desktop_ui.md*
