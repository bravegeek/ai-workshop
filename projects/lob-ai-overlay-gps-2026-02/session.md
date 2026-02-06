# LOB AI Overlay GPS
Date: 2026-02-05

## Session Summary
We brainstormed a design for an AI-driven overlay to accelerate workflows in poorly designed Line of Business (LOB) web applications. The core concept is a "GPS for LOB" that predicts and guides users through "Golden Paths" using interaction telemetry.

## Context
- **Objective:** Speed up processing on cluttered, poorly designed screens.
- **Approach:** Browser extension or overlay that sits on top of existing apps without modifying the underlying code.
- **Target Friction:** Navigation complexity, data entry labor, and decision-making support.

## Expert Role
**AI/UX Interaction Designer**
Adopted to focus on human-computer interaction, proactive guidance, and minimizing cognitive load in high-friction environments.

## Interview Insights
- **Core Strategy:** Use a "Mini-Map" approach—a ghost button triggers a list of the top 3 predicted next actions.
- **Selection Action:** Once an action is selected, the UI performs an **Auto-Scroll & Pulse** to physically move the user to the target and highlight it.
- **Intelligence:** The system should collect (with consent) user telemetry (clicks, scrolls) to model the most efficient paths taken by expert users.

## Research Plan
- **Telemetry:** Identified lightweight options like TA3 and Umami for clickstream analysis.
- **DOM Stability:** Established a fallback strategy from attributes to XPath and relative positioning.
- **Implementation:** Verified that browser extensions have the necessary permissions for smooth auto-scrolling and element focusing.

## Next Steps
- **Algorithm Design:** Decide between simple frequency counting or more complex sequence modeling (e.g., Markov chains) for the "Top 3" predictions.
- **Selector Prototyping:** Build a script to test robust element identification on target LOB apps.
- **Extension Scaffolding:** Create a Manifest V3 extension to test the "Auto-Scroll & Pulse" interaction on a sample messy page.

---

## Session Update: 2026-02-06

### Architectural Pivot: Library vs. Extension
- **Decision:** Shift from a Browser Extension to a **Drop-in Library (NPM/CDN script)**.
- **Rationale:** Reduces "maintenance tax" (store reviews, V3 quirks) and allows for instant updates. If an extension is needed later, the library can be wrapped in a content script.
- **Strategy:** Position the product as an "Overlay Service" (similar to Intercom or Pendo).

### Refined Algorithm: Context-Aware Frequency
- **Logic:** Use a Weighted Frequency Map: `StateKey (URL + Last Action) -> NextSelector`.
- **Ranking:** Sort by highest frequency counts for the current state to determine the "Top 3" suggestions.

### Proposed Project Structure
```text
src/
├── brain.ts         # Prediction Algorithm
├── overlay.ts       # UI logic (Auto-Scroll & Pulse)
├── telemetry.ts     # DOM event listeners
└── index.ts         # Entry point
test-pages/
└── messy-app.html   # Mock LOB page for testing
```

### Future Consideration: Reverse Proxy Injection (Application Shimming)
- **Concept:** Use a Reverse Proxy (Nginx, Cloudflare Worker) to inject the `<script>` tag into HTML responses.
- **Pros:**
    - **Zero-Touch:** No user installation or app code access required.
    - **Enhanced State Intelligence:** Proxy can see API payloads and HTTP headers to refine predictions.
    - **Security Gateway:** Centralized PII/PHI masking before telemetry leaves the network.
- **Cons:**
    - **Infrastructure:** Requires a high-availability proxy layer.
    - **Latency:** Real-time stream modification adds small overhead.
    - **Complexity:** Man-in-the-Middle SSL management and dynamic CSP header rewriting.
- **Status:** Documented as a "Gold Standard" alternative for limited-control environments. Not selected for initial prototype.

---

## Technical Decisions: TypeScript & Tooling

### Why TypeScript?
- **DOM Stability:** Forces `null`/`undefined` handling for unreliable LOB DOM structures.
- **State Modeling:** Strict interfaces for nested Frequency Maps and Telemetry events.
- **API Quality:** Generates `.d.ts` files for better consumer IDE support.
- **Refactoring:** Easier architectural pivots (e.g., to Browser Extension) via compiler-driven changes.

### Compilation Options (Fast Tools)
- **esbuild:** Extremely fast Go-based bundler; best for high-speed production builds.
- **tsup:** Wrapper around esbuild optimized for libraries (auto-generates type definitions).
- **Vite:** Best for development experience; uses esbuild for fast HMR (Hot Module Replacement).
- **Bun:** All-in-one tool (already in env) that can handle building without extra dependencies.

**Selection:** Use **Vite** for the local dev environment and **esbuild/tsup** for the final production library bundle.
