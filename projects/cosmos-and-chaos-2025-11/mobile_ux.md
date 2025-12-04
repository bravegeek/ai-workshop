# Mobile UI & Interaction Specification

**Date:** 2025-12-03
**Agent Role:** Mobile UX Lead
**Objective:** Define a responsive, mobile-first interface for the "Bento Grid" system that handles increasing complexity via "Unfolding Gameplay" and "Collapsible Cards."

## 1. The Viewport Strategy: "Canvas + Inspector"

To solve the "Fat Finger" problem on mobile while preserving the "Spatial Puzzle" of the desktop grid.

### The Canvas (The Grid)
*   **Interaction:** Pinch-to-zoom, Two-finger pan.
*   **Content:** Displays the **Hero Cards** in their grid positions.
*   **Function:**
    *   **Status Monitoring:** See which machines are running, jammed, or idle.
    *   **Layout Management:** Drag-and-drop cards to optimize adjacency bonuses.
    *   **Visual Feedback:** See the "Flow" (particles moving between cards) or "Dread" (glitches/shakes).
*   **Restrictions:** No complex controls (sliders, tiny buttons) directly on the grid tiles. Only large, single-tap actions (like "Collect" or "Wake Up").

### The Inspector (The Control Panel)
*   **Interaction:** Single-tap any Card on the Canvas.
*   **Visual:** A **Bottom Sheet** (Mobile) or **Side Panel** (Desktop) slides in.
*   **Content:**
    *   Detailed stats (Production rates, exact numbers).
    *   Complex controls (Priority sliders, Target selection, Toggle switches).
    *   Upgrade Tree for that specific card.
    *   Flavor text/Lore.
*   **Benefit:** Decouples the "Game Board" from the "Control Board." We can have big, chunky buttons in the Inspector without cluttering the Grid.

## 2. The "Unfolding" Grid (Phased Complexity)

The grid is not static; it grows with the player's technology level.

| Phase | Narrative | Grid Size | Visible Slots | UX Focus |
| :--- | :--- | :--- | :--- | :--- |
| **1. Escape Pod** | "Survival" | **1x2** (Vertical) | Mining, Power | **The Button.** Massive manual controls. Learning rhythm. |
| **2. The Shuttle** | "Stabilization" | **2x2** (Square) | +Refining, Storage | **Adjacency.** Learning to connect outputs to inputs. |
| **3. The Frigate** | "Expansion" | **Infinite Canvas** | +Sensors, Habitat | **Management.** Scrolling/Zooming. Automating early tech. |
| **4. The Ark** | "Mastery" | **Infinite Canvas** | +Labs, Witness Tech | **Optimization.** Collapsing old tech to make room for new. |

## 3. Collapsible Cards (The "Minification" System)

As cards evolve from "Active Manual Tools" to "Passive Automated Systems," their UI footprint shrinks.

### State A: The "Active" Card (Standard)
*   **Size:** Default 1x1 or larger.
*   **Visuals:** High detail. Animated parts. Big "Action Button" (if manual).
*   **Info:** Shows current progress bar, detailed output text.
*   **Use Case:** Tier 0-2 tech that requires frequent player clicks.

### State B: The "Minified" Card (Collapsed)
*   **Trigger:** Unlocks when a card reaches **"Full Automation"** (usually Tier 3).
*   **User Action:** Player can toggle a "Collapse" icon on the card header.
*   **Size:** **Remains 1x1** (to preserve grid adjacency logic) BUT visuals simplify.
    *   *Alternative:* Could shrink visually to 0.5x0.5 but logically occupy 1x1 to keep grid math simple.
*   **Visuals:**
    *   Background becomes flat/dark.
    *   Animations stop (performance gain).
    *   **Status Light:** Green (Running), Red (Jammed).
    *   **Sparkline:** A tiny graph showing output stability.
*   **Info:** No text. Just an icon and the Status Light.
*   **Benefit:** Reduces visual noise. Allows player to visually ignore "solved" problems.

## 4. Card State Examples

### Mining Laser
*   **Active (Tier 0):**
    *   Large "FIRE" button takes up 50% of card.
    *   Shake animation on click.
    *   Laser beam visual.
*   **Minified (Tier 3):**
    *   "FIRE" button removed (it's auto).
    *   Icon: Drill bit.
    *   Status: Green LED pulsing at rate of mining.
    *   Tap to open Inspector if you need to change Ore Target.

### Storage Bay
*   **Active (Tier 0):**
    *   Big Progress Bar (0/1000).
    *   "Eject" button.
    *   Visual pile of rocks grows.
*   **Minified (Tier 3):**
    *   Icon: Box.
    *   Status: Circular gauge (pie chart) showing % full.
    *   Color changes: Green (<80%), Orange (>80%), Red (Full).

## 5. Mobile Gestures & Haptics

*   **Tap:** Select/Open Inspector (Light Haptic).
*   **Long Press:** Enter "Edit Mode" (Pick up card to move). (Medium Haptic).
*   **Double Tap:** "Quick Action" (Contextual).
    *   *Miner:* Emergency Kick (Fix Jam).
    *   *Storage:* Emergency Dump.
    *   *Reaction:* Strong Haptic (Thud).

## 6. Technical Implications (CSS/JS)

*   **Responsiveness:** The grid container needs to use `touch-action: none` to handle custom pan/zoom logic via JS (or a library like `use-gesture`).
*   **Inspector:** Needs to be a separate DOM layer (Overlay) with high Z-index.
*   **State Classes:** Cards need `.is-minified`, `.is-active`, `.is-editing` classes to drive CSS transitions.
