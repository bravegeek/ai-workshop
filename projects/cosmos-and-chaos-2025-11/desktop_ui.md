# Desktop UI & Interaction Specification: The Control Panel

**Date:** 2025-12-03
**Agent Role:** Sim-Strategy UI Architect
**Objective:** Define the "Desktop-First" interface for the "Bento Grid" system, replacing the mobile constraints with a "Mega-Grid" dashboard aesthetic.

## 1. The Layout: The Command Console

The entire screen represents the ship's primary AI terminal. It is "Always On," dense, and minimalist.

### Zone A: The Motherboard (Center)
*   **The Canvas:** A large scrollable grid (e.g., 10x10 total capacity).
*   **The Viewport:** The player sees a **5x5 Window** into this grid at any given time.
*   **Scrolling:** Panning the camera is manual (Right-click drag or Edge Pan), requiring "Attention" to manage distant sectors.
*   **The Grid:**
    *   **Visuals:** Dark PCB texture. Subtle grid dots.
    *   **Traces:** Faint lines connect adjacent slots, lighting up when cards communicate.

### Zone B: The Log Feed (Left Sidebar)
*   **Content:** A scrolling text log of ship events ("Mineral extracted.", "Anomaly detected.", "Dread spike warning.").
*   **Function:** Narrative delivery and system alerts.
*   **Style:** Monospace font, terminal green (Wonder) or red (Dread) highlights.

### Zone C: The Data Stack (Right Sidebar)
*   **Content:** Global Resource Counters (Ore, Energy, Knowledge).
*   **Detail:** Hovering a resource shows a "Sparkline" graph (Production/Consumption rates over the last minute).
*   **Tech Tree Access:** A button or tab to slide out the Research panel.

## 2. The "Circuit Board" Mechanics

### Adjacency Visualization
*   **Concept:** "The Flow."
*   **Implementation:**
    *   When Card A (Miner) is placed next to Card B (Refinery), the shared border **changes color** (e.g., to bright Cyan).
    *   A small particle animation flows from A to B across the border.
    *   **No Wires:** We rely entirely on physical contact (Side-by-Side).

### Card Anatomy (Desktop Scale)
*   **Size:** Cards are **240x240px** (desktop standard).
*   **Viewport Size:** 1200x1200px (5x5 cards visible).
*   **Total Grid:** 2400x2400px minimum (10x10 capacity).
*   **Density:** Desktop-first design with clear, readable counters.
*   **Layout:**
    *   **Header (50px):** Card Name + Tier Icon + Status LED (8x8px).
    *   **Body (140px):**
        *   Large icon/visual (60x60px) representing card type.
        *   Primary counter (24px bold font - main resource output/input).
        *   Secondary counters (16px font - efficiency, status, rates).
        *   Tertiary stats (12px font - additional metrics).
        *   Interactive toggles/sliders (if needed for manual cards).
    *   **Footer (50px):** Input/Output indicators (Arrows + resource types on all 4 sides) + Health/Efficiency bars.

### The Glitch Mechanics (Hardware Failure)
*   **Dread Effect:** Instead of just UI glitching, the "Hardware" fails.
    *   **Sparks:** Particle effects erupt from a specific grid coordinate.
    *   **Dead Pixels:** A section of the grid becomes unclickable.
    *   **Burnout:** A card turns grey and smokes. Must be right-clicked -> "Reboot" to fix.

## 3. Interaction Model (Mouse & Keyboard)

*   **Left Click:** Select Card (Highlights it, shows detailed stats in Right Sidebar).
*   **Left Drag:** Move Card.
*   **Right Click:** Context Menu (Upgrade, Sell, Reboot, Pause).
*   **Hover:** "X-Ray Vision."
    *   Hovering a card fades out its background, showing the "Internal Logic" (e.g., wiring diagram or raw numbers).
*   **Scroll Wheel:** Zoom In/Out (within limited range).

## 4. Technical Implementation Strategy

*   **Grid System:** CSS Grid is perfect for the 10x10 layout.
*   **Viewport:** An `overflow: hidden` container div sized to show exactly 5x5 cells.
*   **Drag & Drop:** HTML5 Drag and Drop API or a library like `interact.js`.
*   **Rendering:** Standard DOM elements (divs) are sufficient. No Canvas/WebGL needed yet, keeping development simple.

## 5. Updated Todo List

1.  **Scaffold:** `index.html` with the 3-Zone Layout (Sidebar, Grid, Sidebar).
2.  **CSS:** Define the "PCB" aesthetic variables (Dark greys, neon borders).
3.  **Grid Logic:** Implement the 10x10 grid with a 5x5 viewing window.
4.  **Card Template:** Create the HTML/CSS for a "Hero Card" with hover states.
5.  **JS:** Basic drag-and-drop functionality.
