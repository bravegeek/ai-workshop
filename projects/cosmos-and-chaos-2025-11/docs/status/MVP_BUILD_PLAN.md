# Cosmos and Chaos - MVP Build Plan

**Created:** 2025-12-08
**Status:** Ready to Begin
**Target:** Phase 1 - Core Grid & Cards

---

## MVP Readiness Assessment

### ✓ Design Complete
- Core game concept and mechanics fully specified
- All 48 technologies mapped
- Card evolution system defined
- Technical specifications documented
- UI layout and visual style guide complete

### ✓ MVP Scope Defined
Phase 1 provides a solid foundation:
- Playable grid system
- Manual resource production
- Basic card placement and movement
- Foundation for all future systems

---

## Phase 1: Core Grid & Cards (MVP)

### Goal
Build a functional prototype where players can:
1. Place cards on a grid
2. Drag cards to reposition them
3. Click cards to produce resources manually
4. See resource counters update

**Estimated Complexity:** Medium
**Deliverable:** Playable proof-of-concept demonstrating core interaction loop

---

## Step-by-Step Build Plan

### Step 1: Project Setup
**Files to Create:**
- `index.html` - Main entry point
- `css/reset.css` - CSS reset
- `css/variables.css` - CSS custom properties
- `css/layout.css` - 3-zone grid layout
- `css/cards.css` - Card styling
- `js/main.js` - Entry point & game loop
- `js/grid.js` - Grid management
- `js/cards.js` - Card logic
- `js/resources.js` - Resource tracking
- `js/utils.js` - Helper functions

**Success Criteria:**
- [ ] Empty project structure created
- [ ] index.html loads and displays "Cosmos and Chaos"
- [ ] CSS files linked and loading
- [ ] JS modules connected

---

### Step 2: HTML Scaffold (3-Zone Layout)

**Implementation:**
```html
<body>
  <div class="command-console">
    <aside class="log-feed"><!-- Zone A --></aside>
    <main class="grid-canvas"><!-- Zone B --></main>
    <aside class="data-stack"><!-- Zone C --></aside>
  </div>
</body>
```

**Zone A: Log Feed (Left Sidebar)**
- Width: 250px
- Scrolling event log
- Monospace font
- Terminal aesthetic

**Zone B: Grid Canvas (Center)**
- 10×10 grid capacity
- 5×4 viewport (1000×800px visible)
- Dark PCB background
- Pan/scroll capability

**Zone C: Data Stack (Right Sidebar)**
- Width: 250px
- Global resource counters
- Tech tree access (button only for MVP)

**Success Criteria:**
- [ ] 3-zone layout renders correctly
- [ ] Zones maintain proportions
- [ ] Dark background applied
- [ ] Basic styling matches design aesthetic

---

### Step 3: CSS Grid System

**Implementation:**
```css
:root {
  --card-size: 200px;
  --viewport-cols: 5;
  --viewport-rows: 4;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(10, var(--card-size));
  grid-template-rows: repeat(10, var(--card-size));
  gap: 8px;
}

.viewport {
  width: calc(var(--card-size) * var(--viewport-cols));
  height: calc(var(--card-size) * var(--viewport-rows));
  overflow: hidden;
}
```

**Success Criteria:**
- [ ] 10×10 grid renders
- [ ] 5×4 viewport shows correct area (1000×800px)
- [ ] Grid cells are 200×200px
- [ ] 8px gap between cells
- [ ] Can scroll/pan to see hidden areas

---

### Step 4: Basic Card Template

**Card Anatomy (200×200px):**
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
│                                     │
├─────────────────────────────────────┤
│  Status Bar: ▓▓▓▓▓▓░░░ (##%)       │ 50px Footer
└─────────────────────────────────────┘
```

**CSS Styling:**
- Border: 1px solid #666
- Background: #1a1a1a
- Monospace font (Consolas/Courier)
- Card class: `.card`

**Success Criteria:**
- [ ] Card component created
- [ ] 200×200px size maintained
- [ ] 3-section layout (header/body/footer)
- [ ] Typography hierarchy working
- [ ] Dark aesthetic matches design

---

### Step 5: The 8 Core Cards (Tier 0-1)

**Cards to Implement:**

#### 1. Extractor (Mining)
- **T01 Proton Cutter** (Tier 0)
  - Manual clicker
  - Button: "FIRE"
  - Produces: +1 Ore per click
  - Counter: Total Ore mined

#### 2. Sensor (Scanning)
- **T02 Ore Scanner** (Tier 0)
  - Manual scanner
  - Button: "SCAN"
  - Reveals: Resource type info
  - Counter: Scans performed

#### 3. Storage (Logistics)
- **T03 Cargo Bay** (Tier 0)
  - Passive storage
  - No button
  - Capacity: 1000 units
  - Counter: Used/Max

#### 4. Processor (Refining)
- **T04 Refinery Module** (Tier 1)
  - Manual converter
  - Button: "REFINE"
  - Consumes: 10 Ore → 1 Metal
  - Counter: Metal produced

#### 5. Reactor (Energy)
- **Basic Reactor** (Tier 0)
  - Manual generator
  - Button: "GENERATE"
  - Produces: +5 Energy per click
  - Counter: Total Energy

#### 6. Engine (Propulsion)
- **Basic Thruster** (Tier 0)
  - Passive stat display
  - No interaction yet
  - Shows: Speed value
  - Counter: N/A (future)

#### 7. Habitat (Life Support)
- **Basic Quarters** (Tier 0)
  - Passive stat display
  - Shows: Crew count, Morale
  - Counter: Crew: 10 / Morale: 100%

#### 8. Lab (Research)
- **Basic Lab** (Tier 0)
  - Manual research
  - Button: "RESEARCH"
  - Produces: +1 Science per click
  - Counter: Total Science

**Success Criteria:**
- [ ] All 8 cards created with unique data
- [ ] Each card displays correct name/icon
- [ ] Counters visible (even if static)
- [ ] Buttons render where applicable

---

### Step 6: Resource System

**Resources to Track:**
- **Ore** - Basic mining output
- **Metal** - Refined ore
- **Energy** - Power generation
- **Science** - Research points

**Implementation:**
```javascript
// js/resources.js
const gameState = {
  resources: {
    ore: 0,
    metal: 0,
    energy: 0,
    science: 0
  }
};

function addResource(type, amount) {
  gameState.resources[type] += amount;
  updateResourceDisplay(type);
}
```

**Display in Data Stack (Zone C):**
```
┌──────────────┐
│ ORE:     247 │
│ METAL:    12 │
│ ENERGY:  156 │
│ SCIENCE:  34 │
└──────────────┘
```

**Success Criteria:**
- [ ] Resource object created
- [ ] Add/subtract functions working
- [ ] Display updates in real-time
- [ ] Numbers formatted correctly

---

### Step 7: Click Production

**Functionality:**
- Click card button → produce resource
- Update card counter
- Update global resource counter
- Add event to log feed

**Implementation:**
```javascript
// js/cards.js
card.addEventListener('click', (e) => {
  if (e.target.classList.contains('fire-button')) {
    // Produce resource
    addResource('ore', 1);

    // Update card counter
    card.querySelector('.ore-count').textContent = gameState.resources.ore;

    // Log event
    addLogEntry('Mined +1 Ore');

    // Visual feedback
    card.classList.add('flash');
    setTimeout(() => card.classList.remove('flash'), 100);
  }
});
```

**Success Criteria:**
- [ ] Clicking "FIRE" produces ore
- [ ] Clicking "REFINE" converts ore to metal
- [ ] Clicking "GENERATE" produces energy
- [ ] Clicking "RESEARCH" produces science
- [ ] All counters update correctly
- [ ] Log feed shows events

---

### Step 8: Drag & Drop (Basic)

**Implementation Strategy:**
Use HTML5 Drag and Drop API (no physics yet)

```javascript
// js/drag.js
card.draggable = true;

card.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('cardId', card.id);
  card.classList.add('dragging');
});

gridSlot.addEventListener('dragover', (e) => {
  e.preventDefault(); // Allow drop
});

gridSlot.addEventListener('drop', (e) => {
  e.preventDefault();
  const cardId = e.dataTransfer.getData('cardId');
  const card = document.getElementById(cardId);

  // Check if slot is empty
  if (!gridSlot.hasChildNodes()) {
    gridSlot.appendChild(card);
    updateGridState();
  }

  card.classList.remove('dragging');
});
```

**Visual Feedback:**
- Dragged card: `opacity: 0.5`
- Valid drop target: `border: 2px dashed cyan`
- Invalid drop: `border: 2px dashed red`

**Success Criteria:**
- [ ] Cards can be dragged
- [ ] Cards can be dropped on empty grid slots
- [ ] Cards cannot overlap (blocking)
- [ ] Visual feedback during drag
- [ ] Grid state updates after drop

---

## MVP Deliverable Checklist

### Core Functionality
- [ ] 3-zone UI layout renders correctly
- [ ] 10×10 grid with 5×4 viewport working
- [ ] All 8 core cards (Tier 0-1) implemented
- [ ] Cards can be placed on grid
- [ ] Cards can be dragged and repositioned
- [ ] Manual click production works for all interactive cards
- [ ] Resource counters update in real-time
- [ ] Log feed shows events

### Visual Requirements
- [ ] Dark PCB aesthetic (#0b0c10 background)
- [ ] Cards: 200×200px, proper typography
- [ ] Neutral UI state (grey borders, monospace font)
- [ ] Basic visual feedback on interactions

### Technical Requirements
- [ ] 60 FPS maintained (check with DevTools)
- [ ] No framework dependencies
- [ ] Clean, readable vanilla JS
- [ ] Modular file structure

---

## What's NOT in MVP (Deferred)

### Phase 2+ Features:
- ❌ Auto-production / automation
- ❌ Wonder/Dread gradient systems
- ❌ UI physics (magnetic snap, inertia)
- ❌ Status LEDs / I/O indicators
- ❌ Tech tree UI
- ❌ Card evolution beyond Tier 1
- ❌ Adjacency bonuses
- ❌ Audio system
- ❌ Rhythmic click mechanics
- ❌ Offline progress
- ❌ Victory conditions

These will be added in subsequent phases.

---

## Known Gaps to Address During Development

### 1. Card Specifications (Minor)
**Status:** Extractor fully specified (Tier 0-2), others need detail

**Action Items:**
- Define exact functionality for Basic Reactor (Tier 0)
- Define exact functionality for Basic Thruster (Tier 0)
- Define exact functionality for Basic Quarters (Tier 0)
- Define exact functionality for Basic Lab (Tier 0)

**Solution:** Make tactical decisions during implementation. Keep it simple:
- All Tier 0 cards = manual clickers or passive displays
- All produce/track one resource type
- All have large button + simple counter

### 2. Resource Pricing (Minor)
**Status:** Some costs specified, need consistency

**Action Items:**
- Define unlock costs for all 8 Tier 0-1 cards
- Define conversion ratios (10 Ore = 1 Metal?)
- Define click production amounts

**Solution:** Use placeholder values, tune during playtesting:
- Tier 0 cards: Free (starting cards)
- Tier 1 cards: 100-500 of primary resource
- Click production: +1 for Tier 0, +5 for Tier 1

### 3. Grid Placement Rules (Minor)
**Status:** Not explicitly defined

**Action Items:**
- Can cards be placed anywhere initially?
- Are some slots locked/unlocked?
- Do cards start on grid or in inventory?

**Solution:** MVP approach:
- All 8 cards start already placed on grid (fixed starting layout)
- All 100 slots available
- Drag to reposition only

---

## Development Sequence

### Week 1: Foundation
1. Project setup (Step 1)
2. HTML scaffold (Step 2)
3. CSS grid system (Step 3)
4. Basic card template (Step 4)

**Milestone:** Can view empty grid with placeholder cards

### Week 2: Interactivity
5. Implement 8 core cards (Step 5)
6. Resource system (Step 6)
7. Click production (Step 7)

**Milestone:** Can click cards to produce resources

### Week 3: Polish MVP
8. Drag & drop (Step 8)
9. Visual polish
10. Bug fixes & performance check

**Milestone:** MVP complete and playable

---

## Success Metrics

**MVP is successful if:**
1. You can click a Mining Laser and see Ore increase
2. You can click a Refinery and convert Ore → Metal
3. You can drag cards to reposition them on the grid
4. The game runs at 60 FPS with all 8 cards visible
5. The visual aesthetic matches the dark PCB design
6. A new player can understand the basic loop in < 1 minute

**MVP is ready for Phase 2 if:**
- All checklist items completed
- No critical bugs
- Performance target met (60 FPS)
- Code is clean and modular for expansion

---

## Risk Assessment

### Low Risk ✓
- HTML/CSS layout (straightforward)
- Basic card template (well-specified)
- Resource tracking (simple state management)
- Click handlers (standard JS)

### Medium Risk ⚠
- Drag & drop implementation (can be finicky)
- Grid state management (keep it simple)
- 60 FPS with all animations (test early)

### Mitigation Strategies:
- Start with simplest drag implementation (HTML5 API)
- Use CSS transforms (not position changes) for performance
- Profile with DevTools early and often
- Keep grid state as simple JS object, optimize later

---

## Technology Decisions Confirmed

**Stack:**
- HTML5 (semantic markup)
- CSS3 (Grid, Custom Properties, Animations)
- Vanilla JavaScript (ES6+)
- No frameworks, no build tools (for MVP)

**Optional for MVP:**
- `interact.js` - Only if HTML5 drag is insufficient
- Local web server - `python -m http.server` or VS Code Live Server

**Definitely Not for MVP:**
- React/Vue/Svelte
- Canvas/WebGL
- TypeScript (keep it simple)
- Build pipeline (Vite/Webpack)

---

## Next Action

**Choose your path:**

### Option A: Begin Implementation (Recommended)
Start with Step 1 (Project Setup). Create the file structure and basic HTML scaffold.

**Command:** "Start building the MVP - create project structure"

### Option B: Refine Specifications
Fill in missing Tier 0 card details before coding.

**Command:** "Define the remaining 4 cards (Reactor, Engine, Habitat, Lab) for Tier 0"

### Option C: Prototype First
Build a single-card proof-of-concept before full MVP.

**Command:** "Create a one-card prototype (Mining Laser only) to test the core loop"

---

**Recommendation:** Option A. Your design is solid. Start building and make tactical decisions as you go. Perfect is the enemy of done.

---

**End of MVP Build Plan**

*Ready to begin implementation when you are.*
