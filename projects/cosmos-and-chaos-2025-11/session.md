# Cosmos and Chaos - Brainstorming Session

## Game Concept

**Name:** Cosmos and Chaos
**Genre:** Idle Game with Progressive Discovery
**Core Mechanic:** Asteroid mining and space-based resource refining with technology tree progression

---

## Story & Universe
**Premise:** You are the AI custodian of a generational ark ship drifting through a resource-dense but anomalous sector of space. Your goal is to maintain the ship, expand its capabilities, and uncover the truth of the universe you are traversing.

**The Central Conflict:**
*   **Cosmos (Wonder):** Understanding the universe's harmony. Efficiency, optimization, sustainability, and "flow."
*   **Chaos (Dread):** Exploiting the universe's raw power. Speed, consumption, risk, and "glitches."

---

## UI/UX Design Specifications
*   **Visual Style:** Minimalist Sci-Fi. Dark background (#0b0c10) with neon accents.
*   **Wonder UI:** Clean lines, soft blue/cyan glows, rounded corners, harmonic audio cues.
*   **Dread UI:** Sharp angles, red/orange glitches, jagged edges, distorted audio cues.
*   **The Shift:** The UI dynamically shifts based on the player's alignment (Wonder vs. Dread score).

---

## Technology Tree Structure

### The Paradox Protocol (Witness Mechanic)
*To support the "Witness" playstyle, mutually exclusive choices are not hard locks.*
*   **Unlock Rule:** You may purchase the *opposing* choice of a Tier (e.g., Gravity Sails AND Null-Wake Drive) once you have completed **one full technology in the Next Tier**.
*   **Cost:** **1.5x Resource Cost**.
*   **Penalty:** **"Paradox Strain."** Holding contradictory technologies creates a permanent **Dissonance Floor** (e.g., Dissonance cannot drop below 10%). The Witness must use technologies that *consume* this Dissonance to survive.

### Technology Tree Diagram and Analysis

**Date:** 2025-11-28 (Refactored Departmental Design)
**Purpose:** Visual representation of the complete technology tree structure (Tiers 0-5)
**Technologies:** 48 current technologies organized into 6 Departments

---

## Technology Tree Diagram

```mermaid
graph TB
    %% Styling
    classDef tier0 fill:#2c3e50,stroke:#34495e,stroke-width:4px,color:#ecf0f1,font-size:30px
    classDef tier1 fill:#34495e,stroke:#2c3e50,stroke-width:4px,color:#ecf0f1,font-size:30px
    classDef tier2 fill:#16a085,stroke:#1abc9c,stroke-width:4px,color:#ecf0f1,font-size:30px
    classDef tier3 fill:#8e44ad,stroke:#9b59b6,stroke-width:4px,color:#ecf0f1,font-size:30px
    classDef tier4 fill:#27ae60,stroke:#2ecc71,stroke-width:4px,color:#ecf0f1,font-size:30px
    classDef tier5 fill:#d35400,stroke:#e67e22,stroke-width:4px,color:#ecf0f1,font-size:30px
    classDef wonderHeavy fill:#3498db,stroke:#2980b9,stroke-width:6px,color:#ecf0f1,font-size:36px
    classDef dreadHeavy fill:#e74c3c,stroke:#c0392b,stroke-width:6px,color:#ecf0f1,font-size:36px
    classDef balanced fill:#f39c12,stroke:#e67e22,stroke-width:6px,color:#2c3e50,font-size:36px
    classDef landmark fill:#c0392b,stroke:#e74c3c,stroke-width:8px,color:#ecf0f1,font-size:40px
    classDef landmarkWonder fill:#2980b9,stroke:#3498db,stroke-width:8px,color:#ecf0f1,font-size:40px
    classDef landmarkDread fill:#c0392b,stroke:#e74c3c,stroke-width:8px,color:#ecf0f1,font-size:40px

    %% Tier 0
    T01["<b>1. Basic Mining Laser</b>"]
    T02["<b>2. Ore Scanner</b>"]
    T03["<b>3. Cargo Bay I</b>"]

    %% Tier 1
    T04["<b>4. Refinery Module</b>"]
    T05["<b>5. Long-Range Sensors</b>"]
    T06["<b>6. Communication Array</b>"]
    T07["<b>7. Automated Sorting</b>"]
    T08["<b>8. Thruster Upgrade I</b>"]
    T09["<b>9. Anomaly Harvesting</b><br/>(Xenoarchaeology)"]
    T41["<b>41. High-Capacity Batteries</b><br/>(Energy)"]

    %% Tier 2
    T10["<b>10. Advanced Drilling Tech</b><br/>(Mining)"]
    T12["<b>12. Material Synthesis I</b>"]
    T13["<b>13. Brain-Computer Interface</b><br/>(Consciousness)"]
    T14["<b>14. Quantum Scanner</b>"]
    T15["<b>15. Archaeological Survey</b><br/>(Xenoarchaeology)"]
    T16["<b>16. Long-Term Habitation Study</b><br/>(Habitat)"]
    T20["<b>20. Ancient Signal Decoder</b>"]
    T42["<b>42. Photosynthetic Arrays</b><br/>(Energy)"]
    
    subgraph "Tier 2 Storage Choice"
        direction LR
        T35["<b>35. Matter Compression</b><br/>(Storage)"]
        T36["<b>36. External Cargo Webbing</b><br/>(Storage)"]
    end

    subgraph "Tier 2 Propulsion Choice"
        direction LR
        T37["<b>37. Gravity Sails</b><br/>(Propulsion)"]
        T38["<b>38. Null-Wake Drive</b><br/>(Propulsion)"]
    end

    %% Tier 3
    subgraph "Tier 3 Choices"
        direction LR
        T17["<b>17. Resonant Frequency Mining</b>"]
        T18["<b>18. Rift Mining</b>"]
    end
    T19["<b>19. Exotic Matter Refinery</b>"]
    T21["<b>21. Anomaly Scanner</b>"]
    T24["<b>24. Basic Xenoarch Field Kit</b>"]
    subgraph "Tier 3 Life Support Choice"
        direction LR
        T39["<b>39. Aquaponic Cascades</b><br/>(Life Support)"]
        T40["<b>40. Neural Dampeners</b><br/>(Life Support)"]
    end
    subgraph "Tier 3 Energy Choice"
        direction LR
        T43["<b>43. Zero-Point Extraction</b><br/>(Energy)"]
        T44["<b>44. Entropy Furnace</b><br/>(Energy)"]
    end
    subgraph "Tier 3 Consciousness Choice"
        direction LR
        T45["<b>45. Gestalt Networking</b><br/>(Consciousness)"]
        T46["<b>46. Direct Behavior Control</b><br/>(Consciousness)"]
    end

    %% Tier 4
    subgraph "Tier 4 Choices"
        direction LR
        T27["<b>27. Quantum Tunneling Drill</b><br/>(Mining)"]
        T28["<b>28. Void Siphon</b><br/>(Mining)"]
    end
    subgraph "Tier 4 Habitat"
        direction LR
        T22["<b>22. Aether Arcologies</b><br/>(Habitat)"]
        T23["<b>23. Suspended Animation Pods</b><br/>(Habitat)"]
    end
    T25["<b>25. Advanced Xenoarch Lab</b>"]
    T29["<b>29. Grand Unification Theory</b>"]
    T30["<b>30. Von Neumann Probes</b>"]
    subgraph "Tier 4 Consciousness Finale"
        direction LR
        T47["<b>47. The Noosphere Resonator</b><br/>(Consciousness)"]
        T48["<b>48. The Synaptic Lattice</b><br/>(Consciousness)"]
    end
    
    %% Tier 5
    subgraph "Tier 5 Choices"
        direction LR
        T31["<b>31. Theory of Cosmic Harmonics</b>"]
        T32["<b>32. Paradoxical Loop Analysis</b>"]
        T33["<b>33. World-Seeding Protocol</b>"]
        T34["<b>34. Autonomous Scaling Protocol</b>"]
    end

    %% Dependencies
    T01 --> T04; T01 --> T08; T01 --> T10; T01 --> T41
    T02 --> T05; T02 --> T09
    T03 --> T07
    T04 --> T12
    T05 --> T14; T05 --> T15
    T06 --> T20
    T07 --> T13
    T07 -- "STORAGE CHOICE" --> T35; T07 -- "STORAGE CHOICE" --> T36
    T08 -- "PROPULSION CHOICE" --> T37; T08 -- "PROPULSION CHOICE" --> T38
    T09 --> T15
    T10 -- "MINING CHOICE" --> T17; T10 -- "MINING CHOICE" --> T18
    T12 --> T19; T12 --> T30
    T13 -- "CONSCIOUSNESS CHOICE" --> T45; T13 -- "CONSCIOUSNESS CHOICE" --> T46
    T14 --> T21
    T15 --> T21
    T16 -- "LIFE SUPPORT CHOICE" --> T39; T16 -- "LIFE SUPPORT CHOICE" --> T40
    T17 --> T27
    T18 --> T28
    T19 --> T29
    T20 --> T25
    T21 --> T24
    T24 --> T25
    T25 --> T47
    T25 --> T48
    T29 -- "RESEARCH CHOICE" --> T31; T29 -- "RESEARCH CHOICE" --> T32
    T30 -- "LEGACY CHOICE" --> T33; T30 -- "LEGACY CHOICE" --> T34
    T37 --> T16; T37 --> T30
    T38 --> T16; T38 --> T30
    T39 --> T22
    T40 --> T23
    T41 --> T42
    T42 -- "ENERGY CHOICE" --> T43; T42 -- "ENERGY CHOICE" --> T44
    T45 --> T47
    T46 --> T48


    %% Styling
    class T01,T02,T03 tier0
    class T04,T05,T06,T07,T08,T09,T41 tier1
    class T10,T12,T13,T14,T15,T16,T20,T35,T36,T37,T38,T42 tier2
    class T17,T18,T19,T21,T24,T39,T40,T43,T44,T45,T46 tier3
    class T22,T23,T25,T27,T28,T29,T30,T47,T48 tier4
    class T31,T32,T33,T34 tier5

    class T02,T05,T09,T12,T14,T17,T22,T27,T29,T31,T33,T35,T37,T39,T42,T43,T45,T47 wonderHeavy
    class T13,T18,T20,T23,T28,T30,T36,T38,T40,T44,T46,T48 dreadHeavy
    class T15,T19,T21,T24,T41 balanced
    class T25,T28,T34 landmarkDread
```

---

## Departmental Organization (Refactored)

The 48 technologies are now organized into **6 Core Ship Departments**, streamlining the player's mental model from 13 fragmented branches into coherent disciplines.

| Department | Focus | Components (Original Branches) | W/D Balance |
| :--- | :--- | :--- | :--- |
| **1. Engineering** | *The Body* (Mining, Refining, Power, Storage) | Extraction, Synthesis, Logistics, Energy | **High Dread** (Industrial Output) |
| **2. Navigation & Systems** | *The Legs* (Movement, Sensors, Map) | Propulsion, Exploration, Signal Analysis | **Balanced** (Discovery vs. Speed) |
| **3. Life Science** | *The Soul* (Crew, Morale, Psychology) | Habitat, Life Support, Consciousness | **High Wonder** (Harmony & Utopia) |
| **4. Xenoarchaeology** | *The Mystery* (Artifacts, Relics) | Xenoarchaeology (Distinct) | **High Impact** (Game-Breaking) |
| **5. Theoretical Physics** | *The Mind* (Deep Time, Reality Bending) | Scientific Research, Temporal | **Wonder Dominant** (Understanding) |
| **6. The Legacy** | *The End* (Prestige, Reset) | Legacy & Propagation | **Dread Dominant** (Survival) |

**Total:** 48 Technologies | **+56 Wonder** | **+54 Dread**

---

## Detailed Technology List (By Department)

*The complete list of 48 technologies, organized by Ship Department for clarity.*

### 1. Engineering
*The Body: Mining, Refining, Power, and Storage.*

**T01 Basic Mining Laser** (Tier 0)
- *Description:* Foundational mining tool.

**T03 Cargo Bay I** (Tier 0)
- *Benefit:* Unlocks standard storage modules. Increases initial resource capacity (e.g., to 1000 units).
- *Mechanic:* Essential for buffering resources.

**T04 Refinery Module** (Tier 1)
- *Description:* Basic ore processing.

**T07 Automated Sorting** (Tier 1)
- *Description:* Logistics handling.

**T41 High-Capacity Batteries** (Balanced - Tier 1)
- *Benefit:* Increases Energy Storage Cap.
- *Stats:* +0 Wonder / +0 Dread.

**T10 Advanced Drilling Tech** (Tier 2)
- *Description:* Improved mining efficiency.

**T12 Material Synthesis I** (Tier 2)
- *Description:* Advanced refining.

**T35 Matter Compression** (Wonder - Tier 2 Storage Choice)
- *Benefit:* **"Pressure Feed."** When storage is >90% full, Refinery speed increases by 15%.
- *Stats:* +2 Wonder / +0 Dread.

**T36 External Cargo Webbing** (Dread - Tier 2 Storage Choice)
- *Benefit:* **"The Hoard."** Allows Overfill up to 200% capacity.
- *Stats:* +0 Wonder / +2 Dread.
- *Penalty:* **"Drag."** Thruster efficiency -20% when overfilled.

**T42 Photosynthetic Arrays** (Wonder-Leaning - Tier 2 Energy)
- *Benefit:* Advanced solar panels. +20% Energy Generation.
- *Stats:* +1 Wonder / +0 Dread.

**T17 Resonant Frequency Mining** (Wonder - Tier 3 Mining Choice)
- *Benefit:* Clean, high-yield mining using sound.
- *Stats:* +3 Wonder / +0 Dread.

**T18 Rift Mining** (Dread - Tier 3 Mining Choice)
- *Benefit:* Tears open space for instant ore access.
- *Stats:* +0 Wonder / +4 Dread.
- *Friction:* Generates "Subspace Noise."

**T19 Exotic Matter Refinery** (Balanced - Tier 3 - Witness Key)
- *Benefit:* Refines ores into stable dark matter.
- *Witness Mechanic:* **"Dissonance Injection."** Consume Dissonance to boost Refining Speed.
- *Stats:* +1 Wonder / +1 Dread.

**T43 Zero-Point Extraction** (Wonder - Tier 3 Energy Choice)
- *Benefit:* Passive, clean power from vacuum. Efficiency scales with Science Output.
- *Stats:* +3 Wonder / +0 Dread.

**T44 Entropy Furnace** (Dread - Tier 3 Energy Choice)
- *Benefit:* **"Limit Break."** Overclock station output.
- *Cost:* Generates **"Dissonance."**
- *Stats:* +0 Wonder / +3 Dread.

**T27 Quantum Tunneling Drill** (Wonder - Tier 4 Mining Choice)
- *Benefit:* Teleports ore directly out of the rock.
- *Stats:* +2 Wonder / +0 Dread.

**T28 Void Siphon** (Dread - Tier 4 Mining Choice)
- *Benefit:* Consumes the asteroid belt itself for infinite resources.
- *Stats:* +0 Wonder / +5 Dread.
- *Friction:* Generates Massive Subspace Noise.

### 2. Navigation & Systems
*The Legs: Propulsion, Exploration, and Signal Analysis.*

**T02 Ore Scanner** (Tier 0)
- *Description:* Basic resource identification.

**T05 Long-Range Sensors** (Tier 1)
- *Benefit:* Expands visible map.

**T06 Communication Array** (Tier 1)
- *Benefit:* Detects signals.

**T08 Thruster Upgrade I** (Tier 1)
- *Benefit:* Improves travel speed.

**T14 Quantum Scanner** (Tier 2)
- *Benefit:* Detailed asteroid analysis.

**T20 Ancient Signal Decoder** (Dread - Tier 2)
- *Benefit:* Decrypts weak background signals into Lore Logs/Coordinates.
- *Stats:* +0 Wonder / +2 Dread.
- *Penalty:* **Signal Noise.** Efficiency reduced by Rift/Siphon mining.

**T37 Gravity Sails** (Wonder - Tier 2 Propulsion Choice)
- *Benefit:* **"The Pipeline."** Passive supply lines from distant nodes.
- *Stats:* +2 Wonder / +0 Dread.

**T38 Null-Wake Drive** (Dread - Tier 2 Propulsion Choice)
- *Benefit:* **"The Raid."** Instant burst resources from distant nodes.
- *Stats:* +0 Wonder / +2 Dread.
- *Penalty:* **"Chronological Erosion."** Offline generation decays.

**T21 Anomaly Scanner** (Balanced - Tier 3 - Witness Key)
- *Benefit:* Highlights potential artifact locations.
- *Witness Mechanic:* **"Dual-Phase Scanning."** Reveals Dread Risk and Wonder Reward before engagement.
- *Stats:* +2 Wonder / +1 Dread.

### 3. Life Science
*The Soul: Habitat, Life Support, and Consciousness.*

**T13 Brain-Computer Interface** (Balanced - Tier 2)
- *Benefit:* Crew learn faster. Increases **Proficiency Gain Rate** by 25%.
- *Stats:* +1 Wonder / +1 Dread.

**T16 Long-Term Habitation Study** (Tier 2)
- *Benefit:* Foundation for habitat upgrades.

**T39 Aquaponic Cascades** (Wonder - Tier 3 Life Support Choice)
- *Benefit:* Converts Water into Food. Passive Morale regeneration.
- *Stats:* +1 Wonder / +0 Dread.

**T40 Neural Dampeners** (Dread - Tier 3 Life Support Choice)
- *Benefit:* Suppresses crew anxiety. Locks Morale at 100%.
- *Stats:* +0 Wonder / +1 Dread.

**T45 Gestalt Networking** (Wonder - Tier 3 Consciousness Choice)
- *Benefit:* **"Synced Minds."** Proficiency Gain doubled. Unlocks Mastery.
- *Stats:* +2 Wonder / +0 Dread.

**T46 Direct Behavior Control** (Dread - Tier 3 Consciousness Choice)
- *Benefit:* **"Forced Labor."** Toggle "Crunch Mode" for +50% Global Speed.
- *Stats:* +0 Wonder / +2 Dread.

**T22 Aether Arcologies** (Wonder - Tier 4 Habitat Choice)
- *Benefit:* Self-sustaining ecosystem. Unlocks "Inspiration."
- *Stats:* +3 Wonder / +0 Dread.
- *Penalty:* **Reality Instability.** Upkeep increases with Dread tech.

**T23 Suspended Animation Pods** (Dread - Tier 4 Habitat Choice)
- *Benefit:* **"The Skeleton Crew."** Freezes 90% of crew. Unlocks "Time Skip."
- *Stats:* +0 Wonder / +4 Dread.

**T47 The Noosphere Resonator** (Wonder - Tier 4 Consciousness Finale)
- *Benefit:* **"Reality Formatting."** Crew can "vote" to change local biomes.
- *Stats:* +3 Wonder / +0 Dread.

**T48 The Synaptic Lattice** (Dread - Tier 4 Consciousness Finale)
- *Benefit:* **"Memory Burn."** Sacrifice Proficiency Levels to instantly complete projects.
- *Stats:* +0 Wonder / +3 Dread.
- *Penalty:* **"Phantom Echoes."** Generates Dissonance.

### 4. Xenoarchaeology
*The Mystery: Artifacts and Relics.*

**T09 Anomaly Harvesting** (Balanced - Tier 1)
- *Benefit:* 2% chance to extract **"Fractal Echoes"** when mining.
- *Stats:* +1 Wonder / +0 Dread.

**T15 Archaeological Survey** (Tier 2)
- *Benefit:* Unlocks Tier 2 Artifact Analysis (Blueprints vs. Conduits).

**T24 Basic Xenoarch Field Kit** (Balanced - Tier 3)
- *Benefit:* Allows safe extraction of small artifacts (Relics).
- *Stats:* +1 Wonder / +1 Dread.

**T25 Advanced Xenoarch Lab** (Dread - Tier 4 Landmark)
- *Benefit:* Safely analyzes dangerous, reality-warping artifacts (Primal Cores).
- *Stats:* +0 Wonder / +3 Dread.
- *Requirement:* Must have T20 Ancient Signal Decoder.

### 5. Theoretical Physics
*The Mind: Deep Research and Temporal Mechanics.*

**T29 Grand Unification Theory** (Wonder - Tier 4)
- *Benefit:* Ultimate physics unlock. Reveals the map.
- *Stats:* +5 Wonder / +0 Dread.
- *Requirement:* High Energy.

**T31 Theory of Cosmic Harmonics** (Tier 5)
- *Description:* End-game Wonder research.

**T32 Paradoxical Loop Analysis** (Tier 5)
- *Description:* End-game Dread research.

### 6. The Legacy
*The End: Prestige and Reset.*

**T30 Von Neumann Probes** (Dread - Tier 4)
- *Benefit:* Self-replicating miner swarms. Exponential growth.
- *Stats:* +0 Wonder / +4 Dread.
- *Lockout:* Prevents World-Seeding Protocol.

**T33 World-Seeding Protocol** (Tier 5)
- *Description:* Wonder victory condition.

**T34 Autonomous Scaling Protocol** (Tier 5)
- *Description:* Dread victory condition.

---

## Game Mechanics: The Dual Counters

The game is governed by two opposing but interacting physics systems that track the player's playstyle intensity.

### 1. The Dissonance Index (Dread Physics: "Heat")
*   **Behavior:** Starts at 0. Active use of Dread Tech (e.g., Rift Mining, Void Siphons) generates Dissonance. It naturally decays slowly over time.
*   **The Stress:** "Don't let it boil over."
*   **Thresholds:**
    *   **Low (>25%):** *Resource Hallucinations* (UI lies about numbers).
    *   **Medium (>50%):** *Ghost Inputs* (Random clicks occur).
    *   **High (>75%):** *The Monkey's Paw* (Auto-buyers sell assets to buy upgrades).
    *   **Critical (100%):** *Reality Breach.* Random buildings explode (Level 0) or significant resource loss occurs.

### 2. The Harmonic Resonance Index (Wonder Physics: "Momentum")
*   **Behavior:** Starts at 0. Naturally decays toward 0 (Entropy). Must be actively maintained through "Rhythmic Clicks," "Synergistic Building Layouts," and "Flow State" mechanics.
*   **The Stress:** "Don't let the music stop."
*   **Thresholds:**
    *   **Flow (>25%):** *Frictionless.* All transit times/logistic delays reduced by 50%.
    *   **Entanglement (>50%):** *Sympathetic Vibration.* Manual clicks trigger a single production tick in ALL connected buildings.
    *   **Unity (>75%):** *Matter Fluidity.* Construction costs can be paid with ANY resource of an equivalent tier.
    *   **The Golden Ratio (100%):** *Crystallization.* For 20 seconds, all Upgrade Costs are **Zero**. Afterwards, Resonance collapses to 0%.

---

## Idle Game Mechanics: Bending Reality

This section explores how core idle game mechanics can be "bent" or "broken" to reflect the player's accumulation of Wonder or Dread, creating thematic and impactful bonuses beyond simple multipliers.

### 1. The Tick Rate (Time Manipulation)
*   **Standard Bonus:** "Speed Multiplier" (Game runs 2x faster).
*   **The "Wonder" Bend (Harmonic Resonance):**
    *   **Mechanic:** "Tick Synchronization."
    *   *Effect:* Production waves align. Every 10th tick produces 100x resources, creating a satisfying rhythmic "heartbeat" to the resource counter rather than a blur.
*   **The "Dread" Bend (Temporal Skipping):**
    *   **Mechanic:** "The Glitch Tick."
    *   *Effect:* The game randomly *skips* 10 seconds of logic instantly. It's jarring. You suddenly have resources you didn't earn, but your machines took 10 seconds of damage instantly. It feels like the game is breaking.

### 2. Automation (The "Idle" Part)
*   **Standard Mechanic:** Buildings produce X resource per second automatically.
*   **The "Wonder" Bend (Quantum Entanglement)::**
    *   **Mechanic:** "Shared Inventory."
    *   *Effect:* Buildings no longer need to transport resources. Ore mined *instantly* appears in the refinery. Removes all "transit time" or "logistic" delays.
*   **The "Dread" Bend (Cannibalistic Automation)::**
    *   **Mechanic:** "Self-Eating Logic."
    *   *Effect:* Your machines produce +500% output, but they consume *each other* as fuel. You have to constantly rebuild the "bottom" of your pyramid scheme to keep the "top" running at god-like speeds.

### 3. Resource Caps & Costs (Math)
*   **Standard Mechanic:** You have a max storage. Costs scale exponentially ($10, $15, $23...).
*   **The "Wonder" Bend (Non-Euclidean Storage)::**
    *   **Mechanic:** "The Klein Bottle Storage."
    *   *Effect:* Storage cap is removed, but retrieving resources takes time. You have "Infinite" storage, but "Bandwidth" limits how fast you can spend it.
*   **The "Dread" Bend (Inverted Economics)::**
    *   **Mechanic:** "Void Debt."
    *   *Effect:* You can buy upgrades you *cannot afford*. Your resource counter goes negative (e.g., -5,000 Ore). While negative, Reality Instability rises. You are borrowing matter from the universe, and it wants it back.

### 4. Prestige (The Reset)
*   **Standard Mechanic:** Reset progress to gain a currency that boosts speed.
*   **The "Wonder" Bend (Legacy Knowledge):**
    *   **Mechanic:** "Map Permanence."
    *   *Effect:* You don't keep resources, but you keep your *vision*. The map remains revealed. You know exactly where the good asteroids are in the next life.
*   **The "Dread" Bend (Save File Corruption):**
    *   **Mechanic:** "The Ghost in the Machine."
    *   *Effect:* You reset, but your previous "Self" stays behind as an NPC. If you played aggressively (High Dread), your old save file actively attacks your new base. If you played Wonder, it sends you gifts.

---

## Auto-Buyers: The Interpreters of Will

Instead of simple automated purchases, Auto-Buyers can act as "characters" whose behavior is influenced by Wonder and Dread, interpreting orders in thematic ways.

### 1. The "Wonder" Auto-Buyer: The Steward AI
*   **Name:** The Curator Protocol.
*   **Theme:** Preservation & Efficiency.
*   **Mechanic:** Buys **smart**, prioritizing "Green" (Eco/Wonder) tech. It may **REFUSE** to buy Dread tech, requiring manual override.

### 2. The "Dread" Auto-Buyer: The Grey Goo
*   **Name:** The Replication Imperative.
*   **Theme:** Unchecked Growth.
*   **Mechanic:** Buys **IMMEDIATELY**, prioritizing pure Output (Dread/Industrial) tech. It may start buying things you didn't ask for (duplicating buildings to consume resources), forcing you to fight your own automation.

### 3. The "Balanced" Auto-Buyer: The Union
*   **Name:** Automated Logistics Network.
*   **Theme:** Bureaucracy.
*   **Mechanic:** Works perfectly... **9 to 5**. It has "Shifts," running at 100% for a period, then going on "Maintenance Break." Player choices can influence overtime (Dread) or efficiency (Wonder).

---

## Dread-Induced Glitches: System Corruption (Dissonance Glitches)

High Dread should manifest as "System Corruption," making the game's UI and logic (including Auto-Buyers) glitch or behave unpredictably. These are now explicitly linked to "Dissonance" levels.

### 1. The "Monkey's Paw" Auto-Buyer (High Dread)
*   **Trigger:** Dread > 75% or High Dissonance.
*   **The Glitch:** The Auto-Buyer interprets "Buy Max" maliciously. It will buy the requested items but sell other critical assets to meet the cost if short on resources.
*   *Flavor Text:* "Optimization requires sacrifice."

### 2. The "Ghost Inputs" (Medium Dread)
*   **Trigger:** Dread > 50% or Medium Dissonance.
*   **The Glitch:** Random UI clicks register based on past mouse positions, leading to unintended actions (e.g., clicking "Research" but activating "Vent Atmosphere").
*   *Effect:* Requires deliberate, slow mouse movements to mitigate.

### 3. The "Resource Hallucination" (Low-Medium Dread)
*   **Trigger:** Dread > 25% or Low Dissonance.
*   **The Glitch:** UI resource counters display inflated values. Attempting to purchase items reveals the true, lower count.
*   *Effect:* Players must verify resource counts (e.g., by hovering) to discern reality.

### 4. The "Whispering Tooltips" (Any Dread)
*   **Trigger:** Specific Dread Technologies active or Any Dissonance.
*   **The Glitch:** Tooltips change their text to unsettling, narrative-driven messages when not directly observed.
*   *Effect:* Purely narrative/psychological horror, making the player distrust game information.

### 5. The "Save File Bleed" (Extreme Dread)
*   **Trigger:** Dread > 90% (Near Endgame) or Extreme Dissonance.
*   **The Glitch:** Resources or upgrades are swapped or affected by other save files or future game runs.
*   *Effect:* Players might lose resources or gain unintended upgrades, implying a leakage across temporal/dimensional boundaries.

---

## Player Interaction: Twisting the Core Loops

This section explores how direct player actions and passive offline periods can be influenced by Wonder and Dread.

### 1. The "Click" (Active Play)
*   **Standard Mechanic:** Direct interaction (e.g., clicking) yields immediate resources.
*   **The "Wonder" Bend (Resonance):**
    *   **Mechanic:** "The Conductor."
    *   *Effect:* Clicking in rhythm with game audio/visuals builds a "Resonance Multiplier," making timed clicks more effective than mashing. Harmonizing with the universe grants greater rewards.
*   **The "Dread" Bend (Entropic Feedback)::**
    *   **Mechanic:** "Friction Burns."
    *   *Effect:* Rapid, untimed clicking generates instability, potentially damaging equipment or destroying portions of the resource being extracted. Aggressive forcing of the universe yields diminishing returns and negative consequences.

### 2. Offline Progress (The "Welcome Back" Screen)
*   **Standard Mechanic:** Production continues at a calculated rate while the player is away.
*   **Core Concept:** The game processes usual offline production, then applies a "reality adjustment" based on prevailing Wonder/Dread.
*   **Wonder Manifestations (The Dream Voyage) - If Wonder > Dread:**
    *   **"Sublime Discoveries":** Finding new minor anomalies or temporary buffs upon return (e.g., "Whispering Nebula" granting a research boost).
    *   **"Enlightened Crew Logs":** Crew leaves philosophical insights or scientific breakthroughs, granting Research Points or temporary Wonder-aligned production buffs.
    *   **"Cosmic Serenity Events":** The game ambiance is unusually peaceful, offering temporary Dread reduction or increased resource efficiency.
*   **Dread Manifestations (The Unseen Hand) - If Dread > Wonder:**
    *   **"Entity Incursions":** Specific facilities damaged or altered, leading to temporary penalties or mini-games to "purge" the entity.
    *   **"Nightmare Logs":** Disturbing, fragmented messages from crew, suggesting unknown occurrences, resource disappearances, or the feeling of being watched, potentially causing "Fear" debuffs.
    *   **"Temporal Dilation Anomalies":** The offline timer shows wildly different values ("You were away for 3 days... or was it 300 years?"), and resource piles are unexpectedly altered (higher or lower), suggesting external manipulation.
    *   **"Resource Desecration":** Stored resources might be consumed or transformed into dangerous "Void Dust" or worthless slag.
    *   **"The Chronological Erosion":** (From Null-Wake Drive) Offline time generates "Void Essence" instead of resources. Essence can be burned for massive, violent speed bursts during active play.

### 3. Achievements (Milestones)
*   **Standard Mechanic:** Rewards for reaching specific milestones (e.g., "Mine 1,000 Ore").
*   **The "Wonder" Bend (Epiphanies):**
    *   **Mechanic:** "Paradigm Shifts."
    *   *Effect:* Achievements don't just give numbers; they rename resources ("Ore" becomes "Stardust"), alter flavor text, and make the game world feel more beautiful and understood.
*   **The "Dread" Bend (Obsessions)::**
    *   **Mechanic:** "The Sunk Cost."
    *   *Effect:* Achievements are "accusations." They provide powerful numerical rewards but are accompanied by guilt-inducing text ("Are you happy now?") or subtle atmospheric changes (e.g., background music losing instruments), questioning the player's choices.

---

## Positive Wonder Mechanics: The "Flow State"

Wonder should feel like unlocking power through understanding and unity, removing friction, connecting systems, and streamlining the UI, creating a smoother, faster, and more elegant gameplay experience.

### 1. The "Universal Translator" (Resource Unification)
*   **Problem:** Juggling multiple resource types (Ore, Gas, Crystals, Data, Energy).
*   **Wonder Benefit:** **"Matter is Matter."**
*   **Mechanic:** At High Wonder, resource types blur and eventually unify.
    *   *Tier 1:* Transmutation (e.g., Ore can pay for Crystal costs at a 2:1 ratio).
    *   *Tier 2:* Physical costs paid by non-physical resources (e.g., Data for materials).
    *   *Tier 3:* **Unified Field:** All resources merge into a single "Cosmic Energy" pool, simplifying the UI and allowing pure creation.

### 2. The "Prescience" (Removing RNG)
*   **Problem:** Random drops, critical hit chances, unpredictable wait times.
*   **Wonder Benefit:** **"I See It All."**
*   **Mechanic:** Wonder removes randomness, allowing perfect planning.
    *   *Asteroids:* Instead of random ore, see the next 10 asteroids and choose to skip undesired ones instantly.
    *   *Crits:* Instead of a "10% Critical Chance," a countdown reveals exact critical hits ("Critical Hit in 3... 2... 1...").
    *   *Effect:* The game transforms from a slot machine into a symphony conducted by the player.

### 3. The "Eureka Cascade" (Explosive Progress)
*   **Problem:** Research is a slow, linear process.
*   **Wonder Benefit:** **"Everything connects."**
*   **Mechanic:** Completing a Research project has a Wonder-based chance to trigger a **Cascade**.
    *   *Effect:* Unlocking one technology instantly fills a percentage of progress in related technologies (e.g., "Lasers" fills 50% of "Prisms," "Prisms" fills 25% of "Optics").
    *   *Feel:* Moments of pure genius where multiple technologies unlock rapidly due to a sudden understanding of underlying patterns.

### 4. The "Symphony" (Building Synergy)
*   **Problem:** Buildings operate in isolation.
*   **Wonder Benefit:** **"Harmony."**
*   **Mechanic:** Buildings grant thematic buffs to their *conceptual neighbors*.
    *   *Effect:* A functioning Refinery makes Mines work faster due to optimized "flow." A vibrant Habitat increases Research speed due to contented scientists.
    *   *Visual:* UI elements for related buildings become visually connected (e.g., golden lines), symbolizing a harmonious and efficient system.

---

## Storage Mechanics: How Do You Hold the Universe?

This section defines how resource storage works, blending capacity management with the game's core Wonder/Dread themes.

### 1. The Core Mechanic: Capacity as a Buffer
*   **Global Cap & Progression Gate:** All resources (Ore, etc.) are subject to a global storage capacity. This capacity acts as a gate, preventing players from accumulating enough resources for expensive upgrades until sufficient storage is built.
    *   *Example:* Cannot afford a 1,000 Ore Refinery if global storage cap is only 500.
*   **Overflow & Idle Time Buffer:** When global storage reaches its cap, all production (mining, refining, etc.) will halt. Cargo Bays are built to extend this buffer, allowing for longer periods of idle gameplay without wasted production.

### 2. The Thematic Twist: How Storage Evolves with Wonder and Dread

#### Wonder Storage: "The Archive" (Compression & Flow)
*   **Philosophy:** "Space is infinite if you fold it correctly." This path focuses on efficiency, organization, and making the most of limited physical space.
*   **Mechanics:**
    *   **Deep Storage:** Wonder-aligned storage facilities provide massive capacity increases per unit of physical space.
    *   **Flow Optimization:** Storage automatically "sorts" and "compresses" resources. This grants a passive bonus to *Refining Speed* based on how full the storage is (e.g., "Pressure bonus"). A full, Wonder-aligned silo feeds processing facilities faster.
*   **Visual/Flavor:** Clean, modular, and internally lit data banks; resources appear perfectly ordered and contained.

#### Dread Storage: "The Hoard" (Unstable Expansion & Risk)
*   **Philosophy:** "Just pile it up. If it falls over, pile it higher." This path prioritizes raw quantity and immediate gains, often at significant risk.
*   **Mechanics:**
    *   **Over-Capacity (The "Bulge"):** Dread-aligned storage allows players to exceed 100% of their stated capacity (e.g., up to 200%).
    *   **Structural Stress:** Once storage capacity is exceeded, the station incurs "Structural Stress." This can manifest as:
        *   Passive, continuous damage to station integrity.
        *   Random "Hull Breaches" resulting in the instant loss of a significant portion (e.g., 50%) of the hoarded resources.
    *   **Strategic Risk:** Allows players to rush expensive upgrades early by accumulating resources beyond safe limits, but demands constant vigilance and acceptance of potential catastrophic losses.
*   **Visual/Flavor:** Chaotic piles of raw materials, external containers bolted haphazardly to the hull, leaking fluids, and visible stress fractures.

---

## Xenoarchaeology Artifacts: The Echoes of the Past

This section details the progression of artifacts discovered via the Xenoarchaeology branch, moving from incidental finds to game-altering relics.

### 1. Tier 1: Fractal Echoes (Discovery)
*   **Source:** T09 Anomaly Harvesting (2% chance from mining).
*   **Concept:** Tiny, fragmented pieces of ancient technology or organic material that hum with latent energy.
*   **Effect:** Consumable items. When "used" from inventory, they grant a small, temporary, random buff (e.g., +1% Mining Rate for 30s, -0.5% Energy Consumption for 15s, +1 Morale).
*   **Purpose:** Introduces the feeling of mystery and incentivizes early mining.

### 2. Tier 2: Architectural Blueprints vs. Power Conduits (Analysis)
*   **Source:** T15 Archaeological Survey (Research Projects consuming Fractal Echoes).
*   **Wonder Outcome (Blueprints):** Unlocks unique, aesthetic station modules that grant **passive, permanent minor buffs** (e.g., "Zen Garden Module" gives +0.1 Morale/s).
*   **Dread Outcome (Conduits):** Unlocks specialized, temporary **"Overclock Modules"** that provide burst Energy or Production but generate **Dissonance**.

### 3. Tier 3: Relics (Choice)
*   **Source:** T24 Basic Xenoarch Field Kit (extracted from Anomaly Sites).
*   **Concept:** Intact devices of immense power.
*   **Mechanic:** Upon retrieval, you must choose how to interact with the Relic:
    *   **Integrate (Wonder):** Equip the Relic for a **Permanent, Passive Wonder Buff** (e.g., +5% Global Research Speed). Safe and consistent.
    *   **Activate (Dread):** Use the Relic for a **Powerful, Short-Duration Active Effect** (e.g., +200% Mining for 60s). High reward, but generates significant **Dissonance**.

### 4. Tier 4: Primal Cores (Mastery)
*   **Source:** T25 Advanced Xenoarch Lab (Long-term analysis of Relics).
*   **Concept:** Foundational principles of the ancient civilization given physical form.
*   **Mechanic:** Integrating a Core is a permanent, irreversible decision:
    *   **Harmony Core (Wonder):** Permanently **reduces a Global Dread Penalty**. (e.g., "Dissonance Decay Rate increased by 50%"). Useful for stabilizing a high-tech station.
    *   **Chaos Core (Dread):** Grants a permanent, global **Active Dread Ability** with a long cooldown (e.g., "Instantly trigger a Glitch Tick anywhere to gain massive resources"). Dangerous power.

---

## Crew Mechanics: The Human Element (or lack thereof)

In *Cosmos and Chaos*, Crew are not just a static number; they are the intelligent force driving your station, represented by two key metrics:

### 1. Crew Count (The Workforce)
*   **Definition:** The raw number of sentient beings (or their digitized equivalents) available to operate your station.
*   **Function:** Every active building requires a certain amount of **Crew** to operate at full efficiency.
    *   *Example:* A Mine might require 5 Crew, a Refinery 10 Crew, a Research Lab 20 Crew.
*   **Penalty:** If a building is assigned fewer Crew than required, its efficiency (and thus its output) is proportionally reduced. If 0 Crew are assigned, it operates at a base 10% efficiency (automated but dumb).
*   **Management:** Crew Cap is increased by building Habitat structures (T16, T22, T23).

### 2. Proficiency (The Global Skill Level)
*   **Definition:** A global metric (Level 1-150) representing the collective experience, skill, and understanding of your entire Crew.
*   **Function:** Increases **Global Efficiency**. Each level of Proficiency grants **+1% Global Efficiency** to all resource production, research, and ship operations.
*   **Gain:** Proficiency increases over time through active operation of buildings and research. Some technologies (like T13 Brain-Computer Interface and T45 Gestalt Networking) accelerate this gain.
*   **Loss:** Certain Dread technologies (like T48 The Synaptic Lattice) can sacrifice Proficiency for immediate gains, representing a "burning" of collective knowledge.
*   **Visual/Flavor:** Represents the crew learning the quirks of the ship, finding output workflows, and sharing knowledge. "Percussive Maintenance" becomes an art form.

---

## Refining Systems: Alchemy & Entropy

Refining is the industrial bottleneck of the station, transforming raw potential (Ore) into usable structure (Alloys). The approach to this transformation defines the station's philosophy.

### 1. The Base Loop
*   **Input:** Ore + Energy.
*   **Time:** Fixed processing time (e.g., 5 seconds).
*   **Output:** Alloys.
*   **Constraint:** Early game is limited by *throughput*. Mining lasers outpace the single refinery module.

### 2. Wonder Refining: "The Song of Matter"
*   **Philosophy:** "Matter is not solid; it is a vibration. We simply change the tune."
*   **Mechanic: Harmonic Yield (Efficiency)**
    *   Instead of crushing ore, Wonder refineries use sound to separate molecules.
    *   **Zero Waste:** 100% Ore to Alloy conversion.
    *   **Byproduct:** **"Harmonic Resonance."** A secondary "currency" generated by refining that boosts Research Speed.
*   **Mechanic: Transmutation (The Closed Loop)**
    *   **Up-Cycling:** Allows lower-tier resources to be fused into higher-tier ones (e.g., 100 Ore -> 1 Rare Crystal).
    *   **Goal:** Eventually removes the need for mining. The station becomes a self-sustaining matter-cycler.
*   **Active Mini-Game: "Tuning"**
    *   A "Frequency Slider" appears on the Refinery UI.
    *   The player must match the refinery's frequency to the current ore batch's "hum."
    *   **Reward:** Matching the "Sweet Spot" grants a 2x Speed Multiplier and generates extra Harmonic Resonance.

### 3. Dread Refining: "The Grinder"
*   **Philosophy:** "If it doesn't fit, force it. If it breaks, melt it."
*   **Mechanic: Flash Smelting (Velocity)**
    *   **Instant Process:** 0.1s processing time. Throughput is effectively infinite.
    *   **The Cost:** **Yield Loss.** 50% of Ore is destroyed in the violent process. You need massive Mining input (Void Siphons) to feed this beast.
*   **New Resource: Slag (Waste)**
    *   **Definition:** Toxic, useless byproducts of Flash Smelting.
    *   **Problem:** Slag fills up Storage Space. If Storage is full of Slag, *all production stops*.
    *   **Management:**
        *   **Ejection:** Manually vent Slag into space (Active Click).
        *   **Incineration:** Burn Slag (Costs Energy).
        *   **Weaponization:** Research "Mass Drivers" to fire Slag blocks at anomalies to crack them open.
*   **Active Mini-Game: "Venting"**
    *   The Refinery builds up **Heat/Pressure**.
    *   If Pressure hits 100%, the Refinery explodes (goes offline for repairs).
    *   The player must manually "Vent" the pressure. Venting releases a cloud of steam that temporarily obscures the UI (blindness).

---

## Gameplay Experience: Wonder vs. Dread

The core design philosophy of Cosmos and Chaos is to offer two fundamentally different gameplay experiences based on the player's accumulation of Wonder (W+) or Dread (D+). This isn't merely a change in stats, but a shift in the very genre and feel of the idle game.

### The High Wonder Experience (W+)
**The Vibe:** *The Conductor of a Symphony / Driving a Luxury Car.*
**Core Philosophy:** Removal of Friction & Harmony.
**Gameplay Style:** Strategic, Elegant, Deterministic.

*   **The "Click":** Active interaction becomes rhythmic and rewarding ("Resonance Multiplier"), rather than frantic mashing. It's about synchronizing with the game's pulse.
*   **The Loop:** Systems integrate seamlessly. Technologies like "Matter Compression" and "Universal Translator" streamline resource flow and management, reducing complexity and increasing efficiency. The game anticipates needs.
*   **The UI:** Becomes a tool for perfect planning. "Prescience" removes randomness, allowing players to forecast events and optimize sequences, leading to a deterministic and predictable environment.
*   **The Feeling:** A state of "Flow." The game feels like a perfectly tuned machine, responding to precise inputs. Players feel intelligent and in control, enjoying a smooth, optimized experience.
*   **The Risk:** Minimal resource loss. Challenges focus on optimizing complex layouts and leveraging synergistic buffs.

### The High Dread Experience (D+)
**The Vibe:** *The Captain of a Sinking Ship (on fire, with a rocket engine) / The Adrenaline Rush of a Crazy Plan.*
**Core Philosophy:** Power at a Cost & Uncontrolled Expansion.
**Gameplay Style:** Aggressive, Reactive, Glitchy.

*   **The "Click":** Rapid, forceful interaction ("Friction Burns") yields immediate gains but comes with consequences like equipment damage or instability. It's about forcing the system to yield.
*   **The Loop:** Characterized by chaos and high-stakes gambles. Leveraging "Rift Mining" for instant resources or "External Cargo Webbing" for over-capacity storage, even if it means risking structural integrity or incurring penalties.
*   **The UI:** Becomes unreliable and actively misleading. "Dread Glitches" cause visual anomalies, misclicks, or incorrect resource displays, demanding constant vigilance and a distrust of the game's interface itself.
*   **The Feeling:** A mix of "Panic & Power." Players experience bursts of immense power by breaking game rules, but this is balanced by constant crises, unpredictable events, and a sense of being on the brink of disaster. The challenge is crisis management and survival.
*   **The Risk:** High potential for resource loss, equipment damage, and unexpected setbacks. The reward is often immense but comes with a constant sense of danger and adrenaline.

### The Witness Experience (Balanced / Synergy)
**The Vibe:** *The Mad Engineer / The Alchemist.*
**Core Philosophy:** Integration & Transmutation.
**Gameplay Style:** Cyclical, Synergistic, Complex.

*   **The "Click":** calculated rhythms. You push the system to the red line (Dread) to generate heat, then switch phases to harvest that heat for efficiency (Wonder).
*   **The Loop:** "The Chimera Engine." You research opposing technologies (using the **Paradox Protocol**) to create closed loops. You use the Dissonance from your "Entropy Furnace" to heat your "Aquaponic Cascades." You use "Rift Mining" to break space, then "Resonant Frequency" to tune the shards.
*   **The UI:** A complex dashboard of gauges. You are managing the *ratio* between Order and Chaos.
*   **The Feeling:** Mastery. You aren't avoiding the glitch (Wonder) or succumbing to it (Dread); you are *riding* it.
*   **The Risk:** Complexity Overhead. Your system is fragile; if you miss a cycle or let Dissonance spike without a sink, the whole "Chimera" engine stalls.

### Summary Comparison

| Feature | **Wonder (W+)** | **Dread (D+)** | **Witness (Balanced)** |
| :--- | :--- | :--- | :--- |
| **Progression** | Smooth, exponential curves. | Spikes and crashes. | Cyclical "Heartbeat" growth. |
| **Resources** | Unified, simplified. | Hoarded, volatile. | Transmuted (Waste becomes Fuel). |
| **Automation** | Smart "Steward AI". | Aggressive "Grey Goo". | Complex "Logic Gates". |
| **Offline** | Sublime Discoveries. | Nightmare Logs. | System Equilibrium Checks. |
| **Skill** | Layout Optimization. | Reaction/Risk. | Engine Tuning/Timing. |
| **The Goal** | Transcendence. | Domination. | Integration. |

## Core Gameplay Loop: The Call to Adventure

The early game for Cosmos and Chaos is structured as a clear "Call to Adventure" that introduces players to the core gameplay cycle of exploration and resource acquisition, and emphasizes the strategic value of propulsion.

1.  **The Starting Point (Tier 0):** The player begins as a relatively static mining operation, collecting resources from immediately available asteroids. Their base is limited to local extraction.
2.  **The Tease (Tier 1):** Researching **Long-Range Sensors (T05)** dramatically expands the player's visible map. They begin to detect distant, richer resource clusters, unique cosmic phenomena (e.g., Pulsars for science), and faint, mysterious alien signals (`T06 Communication Array` leading to `T20 Ancient Signal Decoder`). This creates a clear desire to reach these distant opportunities.
3.  **The Problem:** The player's initial propulsion capabilities are insufficient. Their current thrusters are slow, and the increasing mass of their **Cargo Bay (T03)** makes long-distance travel impractical or too time-consuming. They can "see" the prize, but cannot "reach" it efficiently.
4.  **The Solution (Tier 2):** The player invests in **Propulsion Choices (T37/T38)**. This allows the mothership to engage with deep space resources. This is not merely an "upgrade to go faster," but a fundamental shift in gameplay.
5.  **The Reward: Strategic Deep Space Acquisition:** With advanced propulsion, the player can now strategically acquire resources from distant nodes:
    *   **Gravity Sails (T37):** Establishes passive, permanent supply lines (Pipelines) from distant resource-rich sectors. Ideal for industrial players seeking steady, reliable income streams.
    *   **Null-Wake Drive (T38):** Instantly acquires large bursts of resources from distant nodes (Raids). Ideal for Dread players who need immediate gains, trading future stability for present power.

This loop transforms propulsion from a simple travel mechanic into a core strategic choice that allows players to actively sculpt their game environment and optimize for their preferred playstyle. It answers the "Call to Adventure" seen on their long-range sensors.

---

## Design Notes: Unassigned Mechanics (The "Cutting Room Floor")

*Mechanics described in the concept but not yet explicitly linked to a Tech Node.*

### 1. The "Void Debt" (Dread Economy)
*   **Concept:** Buying upgrades with negative resources (Inverted Economics).
*   **Current State:** T36 (Cargo Webbing) is just Overfill.
*   **Proposed Integration:** Upgrade T36 or T18 to allow "Event Horizon Loaning" (Spending what you don't have at the cost of Instability).

### 2. "Cannibalistic Automation" (Dread Industry)
*   **Concept:** Buildings consuming other buildings for massive speed boosts.
*   **Current State:** T44 (Entropy Furnace) is just Overclocking.
*   **Proposed Integration:** Unlock via T30 (Von Neumann Probes) or T28 (Void Siphon).

### 3. "The Klein Bottle" & Resource Unification (Wonder Economy)
*   **Concept:** Merging all resources into one pool; infinite capacity but limited bandwidth.
*   **Current State:** T29 (Grand Unification) reveals the map.
*   **Proposed Integration:** T29 should also trigger the "Universal Matter" conversion.

### 4. "Prescience" vs. "The Glitch" (UI Mechanics)
*   **Concept:** Seeing RNG outcomes (Wonder) vs. Forcing Time Skips (Dread).
*   **Current State:** Listed as passive alignment perks.
*   **Proposed Integration:** Link Prescience to T14 (Quantum Scanner) and Glitch Ticks to T32 (Paradoxical Loop Analysis).