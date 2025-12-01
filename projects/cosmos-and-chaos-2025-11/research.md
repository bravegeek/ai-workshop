# Research Plan: Cosmos and Chaos Technical Stack

## Overview

This document outlines the recommended technical stack and implementation strategies for the "Cosmos and Chaos" idle game, based on extensive research into performance, scalability, and user experience for web-based, cross-platform applications.

## Core Technical Decisions

### 1. Core Game Loop & State Management: `Zustand` with `requestAnimationFrame`

*   **Decision Rationale:**
    *   **Performance:** For a high-frequency game loop (targeting 60 updates per second) and dynamic UI elements like the "Resonance Wave" rhythm game, `Zustand` significantly outperforms `Redux Toolkit`. Its lightweight nature and fine-grained subscription model minimize unnecessary React re-renders, which is critical for maintaining a smooth frame rate and preventing UI lag, especially on mobile devices.
    *   **"Transient Updates":** Zustand's ability to manage non-reactive state allows game logic to update frequently without forcing React to re-render the entire component tree, providing optimal performance for game-specific calculations.
    *   **Simplicity:** Offers a simpler API and less boilerplate, accelerating development.
*   **Implementation Strategy:**
    *   Utilize a `useGameStore` hook with `Zustand` to manage global game state (resources, tech tree progress, Dissonance/Resonance values, etc.).
    *   Implement the core game loop using `requestAnimationFrame` within a custom React hook (e.g., `useGameLoop`). This ensures the loop is synchronized with the browser's refresh rate, optimizing performance and battery life.
    *   Separate game logic updates from React renders where possible, subscribing components only to the specific pieces of state they need.

### 2. Number Handling: `break_infinity.js`

*   **Decision Rationale:**
    *   **Scale:** Idle games rapidly generate numbers far exceeding JavaScript's native `Number.MAX_SAFE_INTEGER` (2^53 - 1). Native `BigInt` is unsuitable due to performance overhead for frequent calculations and lack of decimal support.
    *   **Performance vs. Precision:** `break_infinity.js` is the de-facto standard in the incremental game community. It offers extremely fast arithmetic operations and a small memory footprint by using a "big float" approach (mantissa + exponent). This provides sufficient precision for game purposes while handling astronomical numbers.
*   **Implementation Strategy:**
    *   All core game values (resource counts, costs, multipliers, Dissonance/Resonance values) will be represented using `break_infinity.js` instances.
    *   Ensure all arithmetic operations involving these values use the library's methods to maintain precision and avoid overflow.

### 3. Game Persistence: `idb-keyval` (IndexedDB) with Versioned Migration

*   **Decision Rationale:**
    *   **Capacity & Performance:** `localStorage` is synchronous and limited to 5-10MB, which is insufficient and can block the UI thread during frequent auto-saves as the game state grows. `IndexedDB` is asynchronous, offers significantly larger storage capacity (up to several GB), and is designed for structured data.
    *   **Simplicity with Power:** `idb-keyval` provides a simple, promise-based API wrapper around IndexedDB, abstracting away its complexity.
*   **Implementation Strategy:**
    *   Implement an auto-save mechanism that writes the entire game state (from the `Zustand` store) to `IndexedDB` at regular intervals (e.g., every 30 seconds) or on specific events.
    *   Utilize a strict **Versioned Migration** pattern:
        *   Each saved game state will include a version number.
        *   On game load, check the saved version against the current app version.
        *   If the saved version is older, pass the state through a series of explicit migration functions (e.g., `migrate_v1_to_v2(state)`) to transform it into the current schema. This prevents breaking old save files with new features.

### 4. Dynamic Visual Effects: Hybrid `CSS` + `Canvas`

*   **Decision Rationale:**
    *   **Performance & Battery:** Combining the strengths of CSS animations for UI elements and Canvas for complex graphics offers the best balance for mobile performance and battery life.
    *   **Platform Agnostic:** Ensures consistent experience on both desktop and mobile touch devices.
*   **Implementation Strategy:**
    *   **"Layout Instability" (Medium Dissonance):** Achieved using hardware-accelerated CSS `transform` properties (`translate3d`) on UI elements (buttons, resource cards). This creates a sense of drift and disorientation without heavy CPU load.
    *   **"Glitch Cloud" & Dissonance Effects:** Simple, non-intrusive CSS `filter` (e.g., `hue-rotate`, `saturate`), `transform` (e.g., `skewX`), and `animation` for global screen effects or individual element flickering.
    *   **"Resonance Wave" (Wonder "The Conductor"):** A small, dedicated HTML5 Canvas instance will be used to render the smooth, high-frequency visualizer lines for the rhythm game, providing precise pixel control for this interactive element.
    *   **Optimization:** Minimize redraws on Canvas. Only update changed areas. Use `will-change` CSS property for performance hints on frequently animating DOM elements.

## Next Steps: Prototyping

This research concludes the planning phase. The next logical step is to set up the project environment and begin implementing the core game loop, state, and UI elements based on these decisions.
