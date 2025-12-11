# Card Taxonomy Audit & Simplification

**Date:** 2025-12-03
**Agent Role:** Senior Systems Designer
**Objective:** Rationalize the 48-technology tree into a manageable "Bento Grid" system where cards evolve rather than accumulate.

## 1. The "Card vs. Stat" Filter
We reviewed the 48 technologies. To prevent "Grid Bloat," we are redefining a "Card" as a **Physical Ship System** that occupies grid space. Everything else must be a **Passive Upgrade**, a **Feature Unlock**, or a **Global Rule**.

### The Cut List (Demoted from Cards to Upgrades)
*These technologies no longer require their own grid slot. They are absorbed into other cards or the UI.*

1.  **T07 Automated Sorting:** Becomes a UI toggle on the **Storage Bay** card.
2.  **T08 Thruster Upgrade I:** Becomes a generic stat boost for the **Engine**.
3.  **T13 Brain-Computer Interface:** Becomes a global passive (Crew XP rate).
4.  **T10 Advanced Drilling Tech:** Merged into Mining Laser (Tier 2 State).
5.  **T29 Grand Unification Theory:** Global Game Rule (Resource Consolidation).
6.  **T30 Sovereignty Algorithm:** UI Overlay / Global Toggle (Autopilot).
7.  **T31 Harmonic Convergence:** Global Slider UI (The Composer).
8.  **T32 Axiom Breaker:** Global Ability (Manual Overwrite).
9.  **T33/34/33b (Victory Conditions):** These are events, not cards.

## 2. The Core Lineages (The "Slots")
Instead of 48 cards, the game is composed of **8 Core Systems**. Each system has a linear evolution path that branches at higher tiers.

### Slot A: The Extractor (Mining)
*The source of raw materials.*
*   **Tier 0:** Basic Mining Laser (Manual Clicker)
*   **Tier 1:** Auto-Miner (Servo Upgrade - Automation)
*   **Tier 2:** Deep Core Drill (Efficiency)
*   **Tier 3 (Fork):**
    *   **Wonder:** **Harmonic Siphon** (2x1 Wide, Pass-through)
    *   **Dread:** **Rift Bore** (1x2 Tall, High Heat/Damage)
*   **Tier 4 (Finale):**
    *   **Wonder:** Quantum Excavator (Teleportation)
    *   **Dread:** Replicator Swarm (The Grey Goo - Spreads/Consumes)

### Slot B: The Processor (Refining)
*The converter of materials.*
*   **Tier 0:** Basic Smelter (Ore -> Alloy)
*   **Tier 2:** Molecular Forge (Unlocks "Upcycling")
*   **Tier 3 (Fork):**
    *   **Wonder:** **Exotic Matter Kiln** (Slow, High Yield, Clean)
    *   **Dread:** **Entropy Furnace** (Fast, Burns Trash/Fuel)
*   **Tier 4:** Universal Fabricator (Matter Unification)

### Slot C: The Storage (Logistics)
*The buffer.*
*   **Tier 0:** Cargo Bay
*   **Tier 2:** Smart Vault (Filtered)
*   **Tier 3 (Fork):**
    *   **Wonder:** **Klein Bottle** (Infinite Capacity, Throughput limited)
    *   **Dread:** **Void Locker** (Debt Mechanics, Negative Storage)

### Slot D: The Reactor (Energy)
*The heartbeat.*
*   **Tier 1:** Battery Bank
*   **Tier 2:** Solar/Photosynthetic Array
*   **Tier 3 (Fork):**
    *   **Wonder:** **Zero-Point Prism** (Passive, requires tuning)
    *   **Dread:** **Bio-Mass Burner** (Consumes Crew/Bloom for power)

### Slot E: The Engine (Propulsion)
*The pacer.*
*   **Tier 1:** Ion Drive
*   **Tier 2 (Fork):**
    *   **Wonder:** **Gravity Sail** (Passive travel, slow & steady)
    *   **Dread:** **Blink Drive** (Instant jumps, ship damage)

### Slot F: The Sensor (Map)
*The eyes.*
*   **Tier 0:** LIDAR
*   **Tier 2:** Quantum Scanner (Filters RNG)
*   **Tier 3:** Anomaly Oracle (Reveals Rewards/Risks)

### Slot G: The Habitat (Crew)
*The soul.*
*   **Tier 1:** Crew Quarters
*   **Tier 3 (Fork):**
    *   **Wonder:** **Arcology** (Happiness = Buffs)
    *   **Dread:** **Cryo-Stasis** (Frozen Crew = Time Skips)

### Slot H: The Lab (Research)
*The brain.*
*   **Tier 1:** Computer Core
*   **Tier 2:** Xeno-Archaeology Lab
*   **Tier 4 (Fork):**
    *   **Wonder:** **The Museum** (Preserve artifacts for buffs)
    *   **Dread:** **The Vivisection Chamber** (Consume artifacts for power)

## 3. The "Witness" Consequence
*   **Standard Player:** Has ~8 Active Cards (1 of each Slot).
*   **Witness Player:** Can choose to build *both* forks at Tier 3.
    *   Example: Builds **Harmonic Siphon** AND **Rift Bore**.
    *   Result: Has 2 Extractor Cards. Grid count increases to 9.
    *   **Max Bloat:** If a Witness duplicates EVERY slot, they have ~16 active cards. This is manageable on a scrollable grid but visually busy—fitting the narrative of "Chaos and Complexity."

## 4. Conclusion
We have reduced the "Mental Object Count" from **48** to **8 Core Systems**.
The remaining techs are either **States** of these 8 systems or **Global Rules**.

This structure is ready for implementation.