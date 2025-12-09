# Card Evolution Specifications

**Last Updated:** 2025-12-05
**Purpose:** Definitive reference for how each of the 8 core cards evolves from Tier 0 through Tier 5

---

## Evolution Philosophy

Each card follows this progression:
- **Tier 0:** Manual, basic functionality
- **Tier 1:** Basic automation unlocked
- **Tier 2:** Efficiency improvements, first choices appear
- **Tier 3:** **THE FORK** - Wonder vs Dread variant (or both via Paradox Protocol)
- **Tier 4:** Ultimate expression of chosen path
- **Tier 5:** Endgame reality-bending (only some cards reach this tier)

**Key Principle:** Each tier should feel like a meaningful upgrade, not just "+10% stats."

---

## 1. The Extractor (Mining)

### T0: Basic Mining Laser → "Proton Cutter"
**Card Name:** Proton Cutter
**Size:** 1×1
**Type:** Manual Clicker

**Functionality:**
- Player clicks "FIRE" button to mine 1 Ore
- No automation
- No passive generation

**Visual:**
- Dark background (#1a1a1a)
- Large "FIRE" button (100×40px)
- Counter: "ORE: 247" (total mined)
- Secondary: "Last: +5" / "Clicks: 49"
- Icon: ⛏️ (60×60px)

**Audio:** Simple "click" sound

**Unlock Cost:** Free (starting card)

---

### T1: Automated Mining → "Servo Drill"
**Card Name:** Servo Drill
**Size:** 1×1
**Type:** Auto-Clicker

**Functionality:**
- **NEW:** Auto-fires every 2 seconds (0.5 Ore/sec)
- **NEW:** Toggle switch: "Auto-Fire: ON/OFF"
- Player can still manual click for +1 Ore bonus
- **NEW:** Rate gauge appears: "0.5/sec"

**Visual Changes:**
- "FIRE" button shrinks to 60×30px
- Toggle switch appears (top-right of body)
- Rate counter: "+0.5 ORE/sec"
- Icon remains: ⛏️

**Audio:** Automated "tick" sound every 2 seconds

**Unlock Cost:** 100 Ore

---

### T2: Advanced Drilling → "Deep Drill"
**Card Name:** Deep Drill
**Size:** 1×1
**Type:** Smart Auto-Miner

**Functionality:**
- Auto-fires every 1 second (1 Ore/sec)
- **NEW:** "Target Filter" - can specify which resource type to prioritize
- **NEW:** Efficiency stat: 94% (affected by card health, jams)
- **NEW:** Jam mechanic: 5% chance per tick to jam (requires click to fix)
- Jams increase "Heat" stat

**Visual Changes:**
- "FIRE" button removed (fully automated)
- Filter dropdown appears: "Target: [ORE] [CRYSTAL] [GAS]"
- Primary counter: "+60 ORE/min"
- Secondary: "Efficiency: 94%" / "Jams: 2"
- Tertiary: "Heat: 23%" / "Auto: ON"
- Icon: Upgraded drill symbol

**Audio:** Deeper "thunk" sound on extraction

**Unlock Cost:** 500 Ore, 10 Energy

---

### T3A: Resonant Frequency Mining (Wonder) → "Harmonic Siphon"
**Card Name:** Harmonic Siphon
**Size:** **2×1 (Horizontal)**
**Type:** Wonder Mining (Clean, High-Yield)

**Functionality:**
- Auto-fires every 0.7 seconds (~1.4 Ore/sec = 85 Ore/min)
- **NEW:** "Pass-Through" - Resources can flow through this card
  - If placed between Source (asteroid) and Refinery, acts as conduit
- **NEW:** "Harmonic Resonance" - Gets bonus from adjacent Wonder cards
  - Each adjacent Wonder card: +10% yield
  - Max 4 adjacencies = +40% yield
- **NEW:** No jams, no heat, 100% uptime
- **Friction:** Produces "Silica Dust" (waste byproduct)
  - Must be filtered or storage clogs

**Visual Changes:**
- Card becomes **2×1 wide**
- Left side shows input arrow (from asteroid/map)
- Right side shows output arrow (to storage/refinery)
- Border pulses soft cyan (#00d9ff)
- Primary: "+85 ORE/min"
- Secondary: "Efficiency: 142%" / "Harmonics: 3"
- Tertiary: "Pass-Through: YES" / "Bonus: +42 ORE/min"
- Footer shows connections: "← C4 Refinery" "→ C6 Storage" "↓ D5 Reactor"
- Icon: Sound wave pattern overlaid on drill

**Audio:** Harmonic tone (musical note) on extraction

**Stats:** +3 Wonder / +0 Dread

**Unlock Cost:** 2,000 Ore, 50 Energy, Requires T10

**Special:** Unlocks "Resonance Chain" mechanic (adjacency bonuses stack)

---

### T3B: Rift Mining (Dread) → "Rift Bore"
**Card Name:** Rift Bore
**Size:** **1×2 (Vertical, Tall)**
**Type:** Dread Mining (Fast, Dangerous)

**Functionality:**
- Auto-fires every 0.4 seconds (~2.5 Ore/sec = 150 Ore/min)
- **NEW:** "Void Bleed" - Requires Xeno-Bloom as fuel catalyst
  - Consumes 1 Xeno-Bloom per 10 Ore extracted
  - If Bloom runs out, mining stops (emergency stop)
- **NEW:** "The Leech" - Drains adjacent cards for speed boost
  - Each adjacent card: +25% speed, but deals 1 HP damage/sec to neighbor
  - Can drain Habitat (−1 Morale/sec), Reactor (−5 Energy/sec), or Storage (−10 capacity/sec)
- **Friction:** Produces "Planck Cinders" (reality ash)
  - Cinders generate Passive Dissonance (+1% per 100 cinders stored)
  - Can be ejected via "Airlock Purge" button (creates temporary glitch field)

**Visual Changes:**
- Card becomes **1×2 tall** (vertical expansion)
- Top section: Heat vent indicator (0-100%)
- Heat bar pulses red when >80%
- Primary: "+150 ORE/min"
- Secondary: "Leech: +50%" / "Fuel: 85%"
- Tertiary: "Heat: 78%" / "Cinders: 42"
- Footer: "Airlock Purge" button (ejects cinders)
- Borders touching adjacent cards turn RED
- Icon: Jagged rift/tear symbol

**Audio:** Violent ripping sound, distorted bass

**Stats:** +0 Wonder / +4 Dread

**Unlock Cost:** 2,000 Ore, 50 Energy, Requires T10

**Special:** Unlocks "Parasitic Adjacency" mechanic (drain neighbors for power)

---

### T4A: Harmonic Extraction (Wonder) → "Quantum Excavator"
**Card Name:** Quantum Excavator
**Size:** 2×2 (Square, Large)
**Type:** Wonder Mining (Perfect Efficiency)

**Functionality:**
- Auto-fires every 0.5 seconds (~2 Ore/sec = 120 Ore/min)
- **NEW:** "Quantum Tunneling" - Teleports ore directly from source
  - No waste products (no Silica Dust)
  - 100% efficiency always
  - Cannot jam or overheat
- **NEW:** "Entanglement Network" - Shares yield with ALL Wonder mining cards
  - If you have 3 Wonder miners, they all get +10% from this card's presence
- **Passive:** Generates +5 Resonance per minute

**Visual Changes:**
- Card becomes **2×2 large**
- Holographic ore particles appear to phase through card surface
- Border: Soft cyan glow, rounded corners (border-radius: 12px)
- Primary: "+120 ORE/min"
- Secondary: "Efficiency: 100%" / "Network: +30%"
- Tertiary: "Resonance: +5/min" / "Entangled: 3 cards"
- Icon: Quantum particle grid

**Audio:** Soft chime, ethereal hum

**Stats:** +2 Wonder / +0 Dread

**Unlock Cost:** 10,000 Ore, 500 Energy, 100 Knowledge, Requires T17

---

### T4B: Replicator Swarm (Dread) → "The Grey Goo"
**Card Name:** The Grey Goo
**Size:** 1×1 (but "bleeds" visually into adjacent tiles)
**Type:** Dread Mining (Exponential, Hungry)

**Functionality:**
- **NEW:** "Exponential Yield" - Output grows by 1% per tick (compounding)
  - Starts at 50 Ore/min
  - After 100 ticks: ~135 Ore/min
  - After 300 ticks: ~1,006 Ore/min (exponential curve)
  - **Resets to 50 Ore/min if swarm "starves"**
- **NEW:** "The Hunger Protocol"
  - Swarm requires mass to replicate
  - Player selects fuel source from dropdown: [Ore / Alloy / Biomass / Void Ichor / Crew]
  - Consumes fuel at rate of 1 unit per 10 Ore produced
  - If fuel runs out, swarm auto-switches to next valuable resource (WARNING!)
- **Friction:** Swarm is unstable
  - Generates +2% Dissonance per minute
  - Can escape containment if Dissonance >80% (attacks random card)

**Visual Changes:**
- Card visually "drips" into adjacent tiles (CSS overflow effect)
- Border is jagged, animated red tendrils
- Primary: "+135 ORE/min (growing)"
- Secondary: "Growth: +1%/tick" / "Hunger: 85%"
- Tertiary: "Fuel: Biomass" / "Consumed: 42 units"
- Special UI: "Feeding Trough" dropdown (select fuel)
- Icon: Swarm of nanobots

**Audio:** Chittering, consuming sounds (unsettling)

**Stats:** +0 Wonder / +5 Dread

**Unlock Cost:** 10,000 Ore, 500 Energy, 100 Knowledge, Requires T18

**Special:** Unlocks "Hunger Protocol" mechanic. Part of Dread Narrative Arc.

---

### T5: (No Tier 5 Mining Card)
Mining caps at Tier 4. Endgame reality-bending is handled by Theoretical Physics (T31, T32).

---

## 2. The Processor (Refining)

### T0: (No Tier 0 Processor)
Players start with raw ore collection only. Refining unlocked at Tier 1.

---

### T1: Refinery Module → "Basic Smelter"
**Card Name:** Basic Smelter
**Size:** 1×1
**Type:** Manual Converter

**Functionality:**
- Player clicks "PROCESS" button
- Converts 5 Ore → 2 Alloy (40% conversion rate)
- Processing time: 12 seconds per batch
- No automation
- Queue: Can hold 10 batches in waiting

**Visual:**
- Large "PROCESS" button
- Recipe display: "5 ORE → 2 ALLOY"
- Queue indicator: "3/10"
- Secondary: "Efficiency: 100%" / "Time: 12s"
- Icon: 🔥 Furnace

**Audio:** Smelting whoosh

**Unlock Cost:** 200 Ore

---

### T2: Molecular Reassembly → "Molecular Forge"
**Card Name:** Molecular Forge
**Size:** 1×1
**Type:** Auto-Converter

**Functionality:**
- Automatically processes batches (no click required)
- Converts 5 Ore → 2 Alloy every 10 seconds
- **NEW:** "Upcycling" - Can convert 1000 Ore → 1 Random Crystal (very inefficient)
  - Introduces material transformation concept
- **NEW:** Recipe selector: [ORE→ALLOY] [ORE→CRYSTAL]
- Queue expanded: 20 batches

**Visual Changes:**
- "PROCESS" button removed
- Recipe dropdown appears
- Primary: "5 ORE → 2 ALLOY"
- Secondary: "Queue: 12/20" / "Rate: 6/min"
- Tertiary: "Recipe: Basic" / "Uptime: 98%"

**Audio:** Automated hum, occasional "ping" on completion

**Unlock Cost:** 1,000 Ore, 50 Alloy

---

### T3: Exotic Matter Refinery → "Exotic Matter Kiln"
**Card Name:** Exotic Matter Kiln
**Size:** 1×1
**Type:** Balanced Converter (Witness Key)

**Functionality:**
- Converts 1 Ore → 5 Exotic Matter every 45 seconds (massive yield increase)
- **NEW:** "Dissonance Injection" (Witness Mechanic)
  - Can consume Dissonance to boost Refining Speed
  - 10% Dissonance consumed = -50% processing time (22s instead of 45s)
  - Allows Witness players to "burn off" Dread side-effects productively
- Quality: 100% clean (no waste)

**Visual Changes:**
- Border can shift between cyan (Wonder) and red (Dread) based on Dissonance consumption
- Primary: "1 ORE → 5 EXOTIC"
- Secondary: "Queue: 12/20" / "Yield: 250%"
- Tertiary: "Clean: 100%" / "Injection: 15%"
- Icon: Matter transmutation symbol

**Audio:** Dual-tone (harmonic + distorted blend)

**Stats:** +1 Wonder / +1 Dread

**Unlock Cost:** 5,000 Ore, 200 Alloy, 50 Knowledge

**Special:** Key card for Witness playstyle. Bridges Wonder and Dread systems.

---

### T4: (Processor caps at Tier 3 for now)
Higher tier refining folded into T29 "Grand Unification Theory" (Universal Matter).

---

## 3. The Storage (Logistics)

### T0: Cargo Bay I → "Bulk Hold"
**Card Name:** Bulk Hold
**Size:** 2×2 (Large from start - storage needs space)
**Type:** Passive Capacity

**Functionality:**
- Increases max storage capacity: 1,000 units (all resource types share pool)
- No filtering
- No throughput limits
- Basic counter display

**Visual:**
- Large 📦 icon (80×80px on 2×2 card)
- Primary: "247 / 1000" (current / max)
- Secondary: "Fill: 25%" (visual bar)
- No I/O indicators yet

**Audio:** None (passive)

**Unlock Cost:** Free (starting card)

---

### T1: Automated Sorting → "Smart Vault"
**Card Name:** Smart Vault
**Size:** 2×2
**Type:** Filtered Storage

**Functionality:**
- Capacity: 2,000 units
- **NEW:** Resource filtering - can set priority rules
  - "Store Ore first, then Alloy, then Crystals"
  - Ejects lowest priority when full
- **NEW:** I/O tracking
  - Shows inflow/outflow rates: "+15/m" / "-8/m"

**Visual Changes:**
- Filter UI appears (small dropdown or toggles)
- Primary: "247 / 2000"
- Secondary: "Fill: 12%" / "Sort: ON"
- Tertiary: "In: +15/m" / "Out: -8/m"
- Footer I/O: "← C3 Ore" "→ C5 Ref"

**Audio:** Soft sorting "clicks"

**Unlock Cost:** 500 Ore, 20 Alloy

---

### T2A: Matter Compression (Wonder) → "Klein Bottle"
**Card Name:** Klein Bottle
**Size:** **1×1 (Shrinks!)**
**Type:** Wonder Storage (Infinite Capacity, Flow-Limited)

**Functionality:**
- **NEW:** Infinite capacity (no hard limit)
- **Friction:** "Bandwidth Throttle" - Can only retrieve 5 items/sec
  - You have infinite storage, but can't spend it all instantly
  - Creates strategic tension: "Do I have TIME to pull resources?"
- **NEW:** Non-Euclidean geometry
  - Visually represents impossible space (Escher-like)
- Filter: Can filter by resource type

**Visual Changes:**
- Card **shrinks to 1×1** (contains infinity in small space)
- Icon: ∞ (infinity symbol)
- Primary: "8,472 / ∞"
- Secondary: "Infinite: YES" / "Throttle: 5/s"
- Tertiary: "Filter: ORE" / "Priority: MED"
- Footer: "← ALL" "↑ ALL" "→ ALL" "↓ ALL" (connects to everything)

**Audio:** Ethereal whoosh (resources entering/leaving impossible space)

**Stats:** +2 Wonder / +0 Dread

**Unlock Cost:** 3,000 Ore, 100 Alloy, 50 Knowledge

**Special:** "Pressure Feed" mechanic - Efficiency scales with how FULL it is (paradox: infinite storage, but wants to stay full)

---

### T2B: External Cargo Webbing (Dread) → "Void Locker"
**Card Name:** Void Locker
**Size:** **3×3 (Expands!)**
**Type:** Dread Storage (Bi-Directional Capacity)

**Functionality:**
- Capacity: Base 5,000 units
- **NEW:** "The Hoard" - Can overfill to +200% (15,000 total)
- **NEW:** "Void Debt" - Can spend into negative (down to -10,000)
  - Going negative creates "Void Debt"
  - While in debt, Dissonance generation tripled
  - **Penalty:** "Garnishment" - If debt persists >5 min, all production diverted to paying debt (player gets 0 income)
- **Restriction:** Cannot purchase Tier 4+ tech while in Void Debt

**Visual Changes:**
- Card **expands to 3×3** (massive, imposing)
- Primary counter can show NEGATIVE: "-2,450 / 5,000"
- Debt warning: Red flashing border when negative
- Secondary: "Debt: ACTIVE" / "Garnish: 2m 15s"
- Tertiary: "Overfill: 120%" / "Penalty: +300% Diss"
- Icon: Gaping void/black hole

**Audio:** Ominous rumble, "debt collector" ticking sound

**Stats:** +0 Wonder / +2 Dread

**Unlock Cost:** 3,000 Ore, 100 Alloy, 50 Knowledge

**Special:** "Usurer" mechanic - Enables aggressive spending beyond means, but punishes heavily

---

### (No Tier 3+ Storage)
Storage system complete at Tier 2 fork.

---

## 4. The Reactor (Energy)

### T1: High-Capacity Batteries → "Battery Bank"
**Card Name:** Battery Bank
**Size:** 1×1
**Type:** Passive Energy Buffer

**Functionality:**
- Stores 500 Energy
- Buffers energy spikes/drains
- Shows charge level, in/out rates, net production
- No generation (just storage)

**Visual:**
- Icon: 🔋
- Primary: "500 / 500 E"
- Secondary: "Charge: 100%" / "In: +15/s"
- Tertiary: "Drain: -8/s" / "Net: +7/s"
- Footer: "← C2 Solar" "→ ALL"

**Audio:** Electrical hum

**Stats:** +0 Wonder / +0 Dread (Balanced)

**Unlock Cost:** 300 Ore

---

### T2: Photosynthetic Arrays → "Solar Farm"
**Card Name:** Solar Farm
**Size:** 2×2
**Type:** Wonder-Leaning Generator

**Functionality:**
- Generates +20 Energy/sec (passive, clean)
- **Byproduct:** Produces +1 Xeno-Bloom per minute
  - Bloom is used by Habitat and Life Support systems
  - Renewable, sustainable
- No fuel required
- 100% uptime (no maintenance)

**Visual Changes:**
- Icon: Solar panel array
- Primary: "+20 ENERGY/sec"
- Secondary: "Bloom: +1/min" / "Uptime: 100%"
- Border: Soft cyan (Wonder aesthetic)

**Audio:** Quiet hum, peaceful

**Stats:** +1 Wonder / +0 Dread

**Unlock Cost:** 1,500 Ore, 100 Alloy

---

### T3A: Zero-Point Extraction (Wonder) → "Zero-Point Prism"
**Card Name:** Zero-Point Prism
**Size:** 1×1
**Type:** Wonder Energy (Passive Infinite Power)

**Functionality:**
- Generates +25 Energy/sec (passive, from vacuum)
- **NEW:** Scales with Science Output
  - +1 Energy/sec per 100 Knowledge points
  - Rewards research-heavy Wonder builds
- **NEW:** "Tuned" stat - Stability: 98%
  - If stability drops below 90%, power fluctuates
- **Friction:** "The Focusing Lens"
  - Requires continuous supply of "Zero-Point Prisms" (consumable item)
  - If Prisms run out → Instant total blackout
  - Creates high-tier supply chain dependency

**Visual Changes:**
- Icon: ⚡ Prism/Crystal
- Primary: "+25 ENERGY/sec"
- Secondary: "Buffer: FULL" / "Tuned: 98%"
- Tertiary: "Passive: YES" / "Stable: YES"
- Footer: "Distributing → All Adjacent Cards"
- Border: Pulsing cyan

**Audio:** High-frequency hum (almost ultrasonic)

**Stats:** +3 Wonder / +0 Dread

**Unlock Cost:** 8,000 Ore, 500 Alloy, 200 Knowledge

**Special:** Flagship Wonder energy source. High reward, high supply-chain complexity.

---

### T3B: Entropy Furnace (Dread) → "The Voracious Engine"
**Card Name:** The Voracious Engine
**Size:** 2×1
**Type:** Dread Energy (Multi-Fuel Reactor)

**Functionality:**
- Generates variable Energy based on fuel burned
- **NEW:** "Fuel Priority" system
  - Player creates prioritized list: [1. Planck Cinders, 2. Ore, 3. Alloy, 4. Biomass]
  - Auto-switches to next fuel when current runs out
  - **Safe Disposal:** Burning Planck Cinders = 0.05 Energy/unit, but NO side effects (clean)
  - **Dangerous Fuels:** Burning Ore/Alloy = 5 Energy/unit, but generates Dissonance
- **NEW:** "Reality Flux"
  - Dissonance generated proportional to Energy output
  - Burning rare resources = more Dissonance
- **Failsafe:** Cannot consume non-regenerating resources (Science, Crew, Artifacts) without explicit "Sacrifice" toggle

**Visual Changes:**
- Icon: Flaming furnace
- Primary: "+40 ENERGY/sec"
- Secondary: "Fuel: Ore (85%)" / "Flux: 15%"
- Tertiary: "Priority: 1. Cinders, 2. Ore" / "Auto: ON"
- Special UI: Fuel priority list (drag to reorder)
- Border: Pulsing red/orange

**Audio:** Roaring flames, crackling

**Stats:** +0 Wonder / +3 Dread

**Unlock Cost:** 8,000 Ore, 500 Alloy, 200 Knowledge

**Special:** Flagship Dread energy source. Flexible, powerful, but generates Dissonance. Can safely dispose of Planck Cinders.

---

### (No Tier 4+ Reactor)
Energy system complete at Tier 3 fork.

---

## 5. The Engine (Propulsion)

### T1: Thruster Upgrade I → "Ion Drive"
**Card Name:** Ion Drive
**Size:** 2×1 (Horizontal)
**Type:** Basic Propulsion

**Functionality:**
- Reduces travel time between map sectors by 50%
- Manual activation: Player clicks "JUMP" button
- **Travel Time:** 60 seconds to reach next sector
- Fuel cost: 10 Energy per jump
- Shows: Next destination, ETA, fuel level

**Visual:**
- Icon: 🚀
- Primary: "Next: 45 seconds"
- Secondary: "Fuel: 85%" / "Speed: 1.0x"
- Tertiary: "Dest: Sector 7" / "ETA: 0:45"
- Button: "JUMP" (manual trigger)
- Footer: "← C2 Tank"

**Audio:** Thruster ignition whoosh

**Unlock Cost:** 800 Ore, 50 Energy

---

### T2A: Gravity Sails (Wonder) → "Solar Sail"
**Card Name:** Solar Sail
**Size:** **3×1 (Very Wide)**
**Type:** Wonder Propulsion (Passive Movement)

**Functionality:**
- **NEW:** "The Pipeline" - Passive, continuous resource flow from distant nodes
  - No manual jumps required
  - Automatically harvests resources from 3 connected sectors
  - **Slow but constant:** Takes 5 minutes to "arrive" at sector, but then generates passive income
- **NEW:** "Supply Lines" mechanic
  - Can connect to up to 3 remote sectors simultaneously
  - Each sector provides small passive resource trickle: +5 Ore/min, +2 Energy/min
- No fuel cost (solar-powered)
- Cannot perform instant jumps (trade speed for sustainability)

**Visual Changes:**
- Card becomes **3×1 very wide** (represents vast sail)
- Icon: ⛵ Solar sail unfurled
- Primary: "Supply Lines: 3 active"
- Secondary: "Sector A: +5 Ore/min"
- Tertiary: "Sector B: +2 Energy/min" / "Sector C: +3 Crystal/min"
- Shows 3 connection indicators (lines to remote sectors)
- Border: Soft cyan, gentle pulse

**Audio:** Quiet wind/solar hum

**Stats:** +2 Wonder / +0 Dread

**Unlock Cost:** 5,000 Ore, 200 Energy, 100 Alloy

**Special:** Flagship Wonder propulsion. Enables passive "trade route" economy.

---

### T2B: Null-Wake Drive (Dread) → "Blink Drive"
**Card Name:** Blink Drive
**Size:** **1×1 (Shrinks)**
**Type:** Dread Propulsion (Instant Travel, Dangerous)

**Functionality:**
- **NEW:** "The Raid" - Instant jump to any discovered sector (0 travel time)
- **Charges:** Has 3 charges, recharges 1 charge every 30 seconds
- **NEW:** "The Glitch" - Every jump has 10% chance to trigger temporal anomaly:
  - **Good Glitch (50%):** +1 hour of production instantly added
  - **Bad Glitch (50%):** +1 hour of building decay (damage) instantly, with 0 production gained
- **Friction:** "Chronological Erosion"
  - While Blink Drive is installed, offline generation decays rapidly
  - Offline time generates only 25% of normal production (penalizes idle play)
  - Instead generates "Void Essence" (can be burned for speed bursts during active play)
- Fuel: 50 Energy per jump

**Visual Changes:**
- Card **shrinks to 1×1** (compact, aggressive)
- Icon: ⚡ Lightning bolt / spatial tear
- Primary: "INSTANT JUMP"
- Secondary: "Charges: 2/3" / "Cooldown: 15s"
- Tertiary: "Risk: 10%" / "Damage: 15%"
- Button: "BLINK" (instant activation)
- Border: Jagged red, flickering

**Audio:** Violent spatial tear, distorted whoosh

**Stats:** +0 Wonder / +2 Dread

**Unlock Cost:** 5,000 Ore, 200 Energy, 100 Alloy

**Special:** Flagship Dread propulsion. High-risk, high-reward. Penalizes idle play, rewards active play.

---

### T5: Harmonic Gate (Endgame - Wonder Path)
**Card Name:** Harmonic Gate
**Size:** 2×2
**Type:** Wonder Endgame Propulsion

**Functionality:**
- **Part of T31 "Harmonic Convergence"**
- Travel time reduced to 0 across entire map
- "The Zero-Point Grid" - Distance is meaningless
- All sectors accessible simultaneously
- No fuel cost, no cooldown

**Visual Changes:**
- Card shows golden gate/portal
- Primary: "Travel Time: 0"
- Secondary: "Network: Full Coverage"
- Icon: Geometric portal

**Audio:** Harmonic resonance, perfect chord

**Stats:** +5 Wonder / +0 Dread (included in T31 stats)

**Unlock Cost:** Part of T31 Harmonic Convergence

**Special:** Unlocked only via Wonder victory path.

---

## 6. The Sensor (Map/RNG)

### T0: Ore Scanner → "LIDAR Unit"
**Card Name:** LIDAR Unit
**Size:** 1×1
**Type:** Basic Detection

**Functionality:**
- Shows next asteroid composition before mining
- Reveals 1 rock ahead in queue
- 60% accuracy (occasionally wrong)
- Range: Current sector only
- No filtering

**Visual:**
- Icon: 📡
- Primary: "Next: ORE (60%)"
- Secondary: "Range: 1" / "Accuracy: 60%"
- Simple readout

**Audio:** Ping sound

**Unlock Cost:** Free (starting card)

---

### T1: Long-Range Sensors → "Deep Void Eye"
**Card Name:** Deep Void Eye
**Size:** 1×2 (Vertical)
**Type:** Map Revealer

**Functionality:**
- Expands visible map to 3 sectors in all directions
- Reveals asteroid density (how many rocks in sector)
- Shows sector resources: "Rich in Ore" / "Crystal deposits"
- **NEW:** Auto-scans every 10 seconds
- Accuracy: 80%

**Visual Changes:**
- Card grows to **1×2 vertical**
- Icon: 🔭 Deep space telescope
- Primary: "Range: 3 sectors"
- Secondary: "Detected: 5" / "Quality: 80%"
- Tertiary: "Next Scan: 7s"
- Shows mini-map overlay

**Audio:** Scanning beep

**Unlock Cost:** 600 Ore, 30 Energy

---

### T2: Quantum Scanner → "Oracle Core"
**Card Name:** Oracle Core
**Size:** 1×2 (Vertical)
**Type:** Precision Scanner (RNG Removal)

**Functionality:**
- **NEW:** "Prescience" - Removes RNG via "Harmonic Filtering"
  - Can set scanner to specific frequency: [ORE ONLY] [CRYSTAL ONLY] [GAS ONLY]
  - Miners will ignore all other signals, ensuring 100% purity of yield
  - **Trade-off:** Idle time between matches (may wait 30s for next Ore rock)
- Accuracy: 95%
- Range: 5 sectors
- **NEW:** Identifies "Zero-Point Prisms" (rare consumable for T43)
- Auto-scan: Every 5 seconds

**Visual Changes:**
- Icon: 🔮 Oracle/Crystal ball
- Primary: "Filter: ORE ONLY"
- Secondary: "Purity: 100%" / "Wait: 12s"
- Tertiary: "Range: 5" / "Accuracy: 95%"
- Filter dropdown UI

**Audio:** Crystalline chime

**Unlock Cost:** 4,000 Ore, 150 Energy, 80 Knowledge

**Special:** Key Wonder support card. Removes RNG frustration, enables precision builds.

---

### T3: Anomaly Scanner → "Reality Mapper"
**Card Name:** Reality Mapper
**Size:** 2×2 (Large)
**Type:** Balanced Scanner (Witness Key)

**Functionality:**
- Highlights potential artifact locations (Xenoarchaeology support)
- **NEW:** "Dual-Phase Scanning" (Witness Mechanic)
  - Reveals both Wonder Reward AND Dread Risk before engagement
  - Player can see: "60% Wonder artifact, 40% Dread corruption event"
  - Allows informed decision-making
- Range: Entire map
- **NEW:** Tracks Wonder/Dread alignment of sectors
  - Shows which sectors are "harmonious" vs "chaotic"
- Accuracy: 100%

**Visual Changes:**
- Card expands to **2×2**
- Icon: 🗺️ Map with reality overlays
- Primary: "Anomalies: 3"
- Secondary: "Wonder: 60% / Dread: 40%"
- Tertiary: "Sector D5: Artifact detected"
- Shows dual-colored overlay (cyan + red)

**Audio:** Dual-tone scanning (harmonic + discordant)

**Stats:** +2 Wonder / +1 Dread

**Unlock Cost:** 8,000 Ore, 300 Energy, 200 Knowledge

**Special:** Critical card for Witness playstyle. Enables strategic risk/reward decisions.

---

### T4+: (Sensor caps at T3)
Sensor system complete. Endgame "perfect information" handled by T29 Grand Unification (reveals entire map).

---

## 7. The Habitat (Crew/Morale)

### T1: (No Tier 1 Habitat)
Crew systems unlock at Tier 2 after initial automation established.

---

### T2: Long-Term Habitation Study → "Crew Quarters"
**Card Name:** Crew Quarters
**Size:** 2×1
**Type:** Basic Habitat

**Functionality:**
- Houses 10 crew (max capacity)
- Generates Morale: Base 75%
- **NEW:** Crew growth: +1 crew per hour (slow natural growth)
- Produces +1 Xeno-Bloom per minute (from T16 research)
- Morale affects production speed:
  - >80% Morale: +10% Global Production
  - <50% Morale: -10% Global Production
  - <20% Morale: Crew mutiny risk

**Visual:**
- Icon: 👥 Crew silhouettes
- Primary: "5 / 10 crew"
- Secondary: "Morale: 75% 😊" / "Growth: +1/hr"
- Tertiary: "Comfort: Good" / "Health: 100%"
- Footer: Happiness bar (▓▓▓▓▓▓▓░░░ 75%)

**Audio:** Ambient ship sounds, occasional voices

**Unlock Cost:** 2,000 Ore, 100 Alloy, 50 Energy

---

### T2: Brain-Computer Interface → "Learning Center"
**Card Name:** Learning Center
**Size:** 1×1
**Type:** Balanced Proficiency Booster

**Functionality:**
- Crew learn faster: +25% Proficiency Gain Rate
- **NEW:** "Proficiency" system introduced
  - Crew gain XP over time
  - Higher proficiency = faster production (up to +50% at max level)
- Can train crew in specific skills: [Mining] [Refining] [Research]

**Visual:**
- Icon: 💻 Computer/Brain interface
- Primary: "+25% Learning"
- Secondary: "Training: Mining" / "XP: 450/1000"
- Tertiary: "Proficiency: Lvl 3" / "Bonus: +15%"

**Audio:** Electronic beeps, learning chimes

**Stats:** +1 Wonder / +1 Dread (Balanced - can go either way)

**Unlock Cost:** 3,000 Ore, 150 Alloy, 100 Knowledge

---

### T3A: Aquaponic Cascades (Wonder) → "Aquaponic Garden"
**Card Name:** Aquaponic Garden
**Size:** 2×2
**Type:** Wonder Life Support

**Functionality:**
- **NEW:** Converts Xeno-Bloom → Lucid Essence
  - 1 Bloom → 3 Essence (efficient transformation)
- Lucid Essence provides:
  - Passive Morale regeneration: +5% per minute (up to 100%)
  - Consumable crew buffs: "Clarity" (+20% production for 10 min)
- Self-sustaining: Produces own Bloom (+2/min)
- Beautiful, living ecosystem

**Visual Changes:**
- Card expands to **2×2**
- Icon: 🌿 Cascading gardens
- Primary: "Bloom → Essence"
- Secondary: "Production: +2 Bloom/min"
- Tertiary: "Essence: 45 units" / "Morale: +5%/min"
- Border: Soft cyan, living pulse
- Background: Animated water/plants (subtle)

**Audio:** Water trickling, peaceful ambiance

**Stats:** +1 Wonder / +0 Dread

**Unlock Cost:** 6,000 Ore, 300 Alloy, 150 Knowledge

**Special:** Flagship Wonder life support. Creates self-sustaining morale engine.

---

### T3B: Neural Dampeners (Dread) → "Isolation Tanks"
**Card Name:** Isolation Tanks
**Size:** 1×1 (Shrinks - efficiency)
**Type:** Dread Life Support

**Functionality:**
- **NEW:** Locks Morale at 100% (crew are sedated, cannot drop)
- **NEW:** "Cognitive Damping"
  - Consumes 1 Xeno-Bloom per minute to sedate crew
  - Converts suppressed emotions → Dissonance Decay (-5% Dissonance/min)
- **Cost:** Crew gains Zero Proficiency (no learning)
  - Production speed fixed at 100% (cannot improve)
  - Ship feels lifeless and hollow (narrative penalty)
- Efficient but soulless

**Visual Changes:**
- Card **shrinks to 1×1** (minimal, clinical)
- Icon: 😶 Emotionless face / isolation tank
- Primary: "Morale: LOCKED (100%)"
- Secondary: "Sedation: ACTIVE"
- Tertiary: "Proficiency: FROZEN" / "Decay: -5%/min"
- Border: Cold grey, no pulse

**Audio:** Eerie silence, occasional mechanical hum

**Stats:** +0 Wonder / +1 Dread

**Unlock Cost:** 6,000 Ore, 300 Alloy, 150 Knowledge

**Special:** Flagship Dread life support. Solves morale problem brutally, enables pure efficiency.

---

### T3: Gestalt Networking (Wonder) → "The Hive Mind"
**Card Name:** The Hive Mind
**Size:** 1×1 (Wireless - connects to everything)
**Type:** Wonder Consciousness

**Functionality:**
- **NEW:** "Synced Minds" - Proficiency XP is SHARED across all crew
  - If 1 crew member learns Mining, ALL crew benefit
  - Proficiency Gain Rate doubled
- **NEW:** Unlocks "Mastery" - Proficiency cap raised to 200% (from 150%)
- No negative effects (pure upgrade)

**Visual:**
- Icon: 🧠 Network of connected minds
- Primary: "Network: 10 minds"
- Secondary: "Shared XP: +2x"
- Tertiary: "Mastery: UNLOCKED" / "Max: 200%"
- Border: Golden neural network pattern

**Audio:** Harmonic tones, synchronized hum

**Stats:** +2 Wonder / +0 Dread

**Unlock Cost:** 8,000 Ore, 400 Alloy, 250 Knowledge

**Special:** Enables true collective intelligence. Key Wonder mid-game power spike.

---

### T3: Direct Behavior Control (Dread) → "Control Collar"
**Card Name:** Control Collar
**Size:** 1×1 (Wired - must be adjacent to Habitat)
**Type:** Dread Consciousness

**Functionality:**
- **NEW:** "Forced Labor" - Toggle "Crunch Mode"
  - ON: +50% Global Speed, but crew health drains -10%/min
  - OFF: Normal production, crew health recovers +5%/min
- **Risk:** If crew health drops to 0%, crew dies (permanent loss)
- Can be toggled on/off strategically (active management required)
- High output, high cost

**Visual:**
- Icon: ⚡ Control collar/shock symbol
- Primary: "Crunch: ON"
- Secondary: "Speed: +50%"
- Tertiary: "Health: 45%" / "Draining: -10%/min"
- Toggle button: "CRUNCH MODE"
- Border: Pulsing red when active

**Audio:** Electrical zaps, stressed voices

**Stats:** +0 Wonder / +2 Dread

**Unlock Cost:** 8,000 Ore, 400 Alloy, 250 Knowledge

**Special:** High-risk, high-reward. Requires constant attention. Can backfire catastrophically.

---

### T4A: Aether Arcologies (Wonder) → "Arcology Spire"
**Card Name:** Arcology Spire
**Size:** 2×2 (Large utopia)
**Type:** Wonder Habitat Finale

**Functionality:**
- Houses 100 crew (10x capacity increase)
- Self-sustaining ecosystem (produces own food, water, energy)
- **NEW:** "Inspiration" - At 98%+ Morale, crew enter "Flow State"
  - Flow State: All production +50%, all learning +100%
  - Generates +10 Resonance per minute
- **Penalty:** "Reality Instability"
  - Upkeep cost increases by +5% for each Dread tech installed
  - Arcology "rejects" Dread presence (thematic tension)

**Visual Changes:**
- Card becomes **2×2** utopian spire
- Icon: 🏙️ Beautiful arcology
- Primary: "50 / 100 crew"
- Secondary: "Morale: 98% 😁" / "Flow: ACTIVE"
- Tertiary: "Inspiration: +50%" / "Resonance: +10/min"
- Background: Animated happy citizens (subtle)
- Border: Golden glow

**Audio:** Uplifting music, children laughing

**Stats:** +3 Wonder / +0 Dread

**Unlock Cost:** 20,000 Ore, 1,000 Alloy, 500 Knowledge

**Special:** Ultimate Wonder habitat. Enables Wonder victory condition.

---

### T4B: Suspended Animation Pods (Dread) → "Cryo-Morgue"
**Card Name:** Cryo-Morgue
**Size:** 1×1 (Ultra-efficient)
**Type:** Dread Habitat Finale

**Functionality:**
- Freezes 90% of crew in cryo-sleep
- Only 10% awake (minimal crew requirements)
- **NEW:** "Cryo-Stasis" - Time Skip Effectiveness +100%
  - When using time skip mechanics, frozen crew don't age/consume
  - Double benefit from temporal manipulation
- **Cost:** Lose ALL "Human" bonuses
  - Cannot exceed 100% Morale (no Flow State)
  - No Proficiency gain (crew are frozen)
- Pure efficiency, zero humanity

**Visual Changes:**
- Card **shrinks to 1×1** (minimal life support)
- Icon: ❄️ Cryo pods
- Primary: "10 / 100 crew (AWAKE)"
- Secondary: "Frozen: 90 crew"
- Tertiary: "Time Skip: +100%"
- Border: Icy blue, frozen

**Audio:** Cryo hum, silence

**Stats:** +0 Wonder / +4 Dread

**Unlock Cost:** 20,000 Ore, 1,000 Alloy, 500 Knowledge
**Requirement:** Must have T40 Neural Dampeners

**Special:** Ultimate Dread habitat. Enables Dread victory condition. Crew become resources.

---

### T4: The Noosphere Resonator (Wonder Consciousness Finale)
**Card Name:** The Noosphere Resonator
**Size:** 2×2
**Type:** Wonder Endgame Consciousness

**Functionality:**
- **NEW:** "Reality Formatting" - Crew can "vote" to change local biomes
  - Every 10 minutes, crew collectively vote on sector changes
  - Can vote to: "Increase Ore density" / "Calm anomalies" / "Generate Knowledge"
  - Democratic reality manipulation
- Requires high Morale (>80%) to function
- Generates massive Resonance (+25/min)

**Visual:**
- Icon: Collective consciousness symbol
- Primary: "Vote: Ore +20%"
- Secondary: "Votes: 45/50"
- Tertiary: "Next Vote: 2m 15s"

**Audio:** Collective harmonic voices

**Stats:** +3 Wonder / +0 Dread

**Unlock Cost:** 50,000 Ore, 2,000 Alloy, 1,000 Knowledge

---

### T4: The Synaptic Lattice (Dread Consciousness Finale)
**Card Name:** The Synaptic Lattice
**Size:** 1×1
**Type:** Dread Endgame Consciousness

**Functionality:**
- **NEW:** "Memory Burn" - Sacrifice Proficiency Levels to instantly complete projects
  - Spend 10 Proficiency Levels → Instantly complete 1 research project
  - Permanent sacrifice (levels don't regenerate)
  - Allows skipping time gates via crew consumption
- **Penalty:** "Phantom Echoes" - Generates +10% Dissonance per burn

**Visual:**
- Icon: Neural network being consumed
- Primary: "Memory Burn: READY"
- Secondary: "Fuel: 45 Levels"
- Tertiary: "Projects: 3 queued"

**Audio:** Distorted screaming (brief)

**Stats:** +0 Wonder / +3 Dread

**Unlock Cost:** 50,000 Ore, 2,000 Alloy, 1,000 Knowledge

---

## 8. The Lab (Research/Artifacts)

### T1: Anomaly Harvesting → "Specimen Jar"
**Card Name:** Specimen Jar
**Size:** 1×1
**Type:** Basic Artifact Storage

**Functionality:**
- **NEW:** 2% chance to extract "Fractal Echoes" when mining
  - Fractal Echoes = Tier 0 artifacts (common)
- Stores 1 artifact
- No analysis capability yet (just collection)
- Shows artifact count

**Visual:**
- Icon: 🏺 Specimen container
- Primary: "Artifacts: 1/1"
- Secondary: "Echoes: 12 collected"
- Simple display

**Audio:** Collection chime

**Stats:** +1 Wonder / +0 Dread (Balanced)

**Unlock Cost:** 1,000 Ore, 50 Knowledge

---

### T2: Archaeological Survey → "Xeno-Gallery"
**Card Name:** Xeno-Gallery
**Size:** 2×2
**Type:** Artifact Analyzer

**Functionality:**
- Stores 5 artifacts
- **NEW:** Can analyze artifacts for "Blueprints" or "Conduits"
  - **Blueprints (Wonder):** Unlock tech shortcuts (skip prerequisites)
  - **Conduits (Dread):** Unlock passive resource generation
- Analysis time: 5 minutes per artifact
- Shows artifact tier/rarity

**Visual Changes:**
- Card expands to **2×2**
- Icon: 🏛️ Gallery/Museum display
- Primary: "Artifacts: 3/5"
- Secondary: "Analyzing: Blueprint"
- Tertiary: "Progress: 67%" / "ETA: 1m 40s"
- Shows artifact thumbnails

**Audio:** Analysis hum, discovery chime

**Unlock Cost:** 5,000 Ore, 200 Knowledge

---

### T3: Basic Xenoarch Field Kit → "Relic Cracker"
**Card Name:** Relic Cracker
**Size:** 2×1
**Type:** Balanced Artifact Processor

**Functionality:**
- Allows safe extraction of "Relics" (Tier 2 artifacts)
- Extraction success rate: 80%
- **NEW:** Can "crack" artifacts to extract "Primal Cores"
  - Primal Cores = permanent upgrade materials
  - Consumed by Tier 4 choices (T25a/T25b)
- Shows extraction queue

**Visual:**
- Icon: 🔓 Cracking tool
- Primary: "Relics: 2 queued"
- Secondary: "Success: 80%"
- Tertiary: "Cores: 5 extracted"

**Audio:** Cracking sounds, energy release

**Stats:** +1 Wonder / +1 Dread (Balanced)

**Unlock Cost:** 10,000 Ore, 500 Knowledge

---

### T4A: The Resonance Archives (Wonder) → "The Museum"
**Card Name:** The Museum
**Size:** 3×2 (Very large)
**Type:** Wonder Artifact Finale

**Functionality:**
- **NEW:** "Curated Exhibition" - 12 "Archive Pedestals"
- Artifacts are **PRESERVED** (not consumed)
- Each placed Primal Core grants permanent **Harmony Core** (Passive Buff):
  - +5% to specific resource (depends on artifact type)
  - Can freely swap artifacts between pedestals (flexible optimization)
- Museum attracts visitors: Generates +10 Knowledge/min
- Beautiful, inspiring

**Visual Changes:**
- Card becomes **3×2** (massive museum)
- Shows 12 pedestal slots (visual grid)
- Each artifact displayed with glow
- Primary: "Artifacts: 12/12"
- Secondary: "Buffs: +60% total"
- Tertiary: "Knowledge: +25/min"
- Border: Golden, reverent

**Audio:** Museum ambiance, awed whispers

**Stats:** +3 Wonder / +0 Dread

**Unlock Cost:** 40,000 Ore, 2,000 Alloy, 1,500 Knowledge

**Special:** Ultimate Wonder artifact solution. Infinite flexibility, permanent buffs.

---

### T4B: The Vivisection Chamber (Dread) → "The Grinder"
**Card Name:** The Grinder
**Size:** 1×1 (Compact, brutal)
**Type:** Dread Artifact Finale

**Functionality:**
- **NEW:** "Genetic Integration" - Artifacts are **DESTROYED** (consumed)
- Each consumed Primal Core grants permanent **Chaos Core** (Active Ability):
  - +X% to "Chaos Core" active power (infinite scaling)
  - Stacking bonus (consume 10 cores = +100% power)
- **Chaos Core Ability:** Massive burst production (+500% for 30 seconds, 5 min cooldown)
- One-way decision: Once consumed, artifact is gone forever
- High risk, high reward

**Visual Changes:**
- Card stays **1×1** (industrial grinder)
- Icon: ⚙️ Grinding mechanism / vivisection table
- Primary: "Consumed: 8 cores"
- Secondary: "Power: +80%"
- Tertiary: "Next: 5m cooldown"
- Button: "CHAOS CORE" (activate ability)
- Border: Blood red, violent

**Audio:** Grinding, destruction, power surge

**Stats:** +0 Wonder / +3 Dread

**Unlock Cost:** 40,000 Ore, 2,000 Alloy, 1,500 Knowledge

**Special:** Ultimate Dread artifact solution. Infinite scaling through consumption.

---

## Status Update

**Completed:**
- ✅ Extractor (T0 through T4)
- ✅ Processor (T1 through T3)
- ✅ Storage (T0 through T2 fork)
- ✅ Reactor (T1 through T3 fork)
- ✅ Engine (T1 through T2 fork + T5 Wonder)
- ✅ Sensor (T0 through T3)
- ✅ Habitat (T2 through T4 fork + Consciousness cards)
- ✅ Lab (T1 through T4 fork)

**All 8 core card evolution chains are now complete!**

---

**End of Card Evolution Specifications**
