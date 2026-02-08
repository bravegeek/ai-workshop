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
├── mapper/          # Manual Path Recording & Management
│   ├── recorder.ts  # Captures expert clicks into a Path JSON
│   └── player.ts    # Executes "Auto-Scroll & Pulse" from a Path
├── ui/              # Shadow DOM Overlay components
│   ├── pulse.ts     # The visual highlight logic
│   └── tooltip.ts   # The "Why" labels
├── engine/          # State detection & Fingerprinting
│   └── fingerprint.ts
└── index.ts         # Entry point
test-pages/
└── messy-app.html   # Mock LOB page for testing
```

## Next Steps (Utility First)

1. **Build the "Manual Mapper" Core:**
   - Create a `Recorder` module that listens for clicks and generates a "Golden Path" JSON object.
   - Implement `Page Fingerprinting` using semantic anchors (H1s, unique buttons) instead of fragile URLs.

2. **Develop the "Shadow UI" Prototype:**
   - Build a Shadow DOM-based "Pulse" and "Tooltip" system that tracks target elements using `requestAnimationFrame` to avoid jitter.
   - Ensure zero interference with the host app's CSS/JS.

3. **Create the "Messy App" Benchmark:**
   - Stand up a `test-pages/messy-app.html` with nested scrolls, dynamic IDs, and iframes to stress-test the Fingerprinting and Pulse positioning.

4. **Expert Workflow Export/Import:**
   - Allow an "Expert" to record a path and export it as a JSON blob that can be manually loaded into another user's session (via console or local storage) for immediate utility.

---

## Session Update: 2026-02-06 (Refining for Immediate Utility)

### Strategy Shift: Manual Mapping over Auto-Telemetry
- **Decision:** Prioritize a **"Manual Mapper"** (Human-in-the-loop) over the "Automatic Telemetry" engine. 
- **Rationale:** Automatic learning requires a "Cold Start" period where the tool is useless. A Manual Mapper provides **Day 1 Value** by allowing experts to codify "Golden Paths" instantly.
- **Zero-Touch Postponement:** While Zero-Touch (Proxy) is the goal for enterprise deployment, the script must first prove its utility as a standalone library/snippet.

### Refined UX: The "Why" Layer
- **Requirement:** Every pulse/suggestion MUST include a micro-label (e.g., "Step 2: Enter Account ID"). 
- **Trust Building:** This prevents "Clippy Syndrome" by providing context for the AI's guidance.

### Future Consideration: Reverse Proxy Injection (Application Shimming)
- **Concept:** Use a Reverse Proxy (Nginx, Cloudflare Worker) to inject the `<script>` tag into HTML responses.
- **Status:** Documented as a "Gold Standard" alternative for limited-control environments. Postponed until standalone utility is proven.

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


---

## Session Update: 2026-02-06 (CRIT Review)

### Strategy Map: LOB AI Overlay Review

**1. The Problem Space**
*   **The Goal:** Modernize UX in legacy "Black Box" LOB applications without touching their source code.
*   **The Constraint:** Must operate in a "Zero-Touch" environment, necessitating a Reverse Proxy for script injection.
*   **The Core Risk:** Telemetry accuracy and user annoyance ("Clippy Syndrome").

**2. The Solution Space**
*   **Phase 1 (The Prototype):** Passive "Waze-style" guidance (Option A). Highlights the path but doesn't force it. Uses `URL + LastActionSelector` for state detection and `localStorage` for persistence.
*   **Phase 2 (The Proxy Pivot):** Implement the Reverse Proxy to handle injection. Introduce PII/PHI masking at the edge to satisfy Security.
*   **Phase 3 (The Brain Expansion):** Move from local storage to proxy-stitched sessions (Option B) to handle multi-app "Golden Paths."

**3. Shadow Perspectives**
*   **Senior UX Researcher:** Warns that a "Passive" UI might be ignored. Recommends "Micro-Hooks" (e.g., hover tooltips) to provide the "Why" behind a prediction.
*   **Security & Compliance:** Views the Reverse Proxy as a major win for data privacy, as it allows for a "Sanitization Layer" before telemetry ever hits the analytics engine.

**4. High-Impact Unknowns**
*   **The "StateKey" Collision Rate:** How often will `URL + Selector` fail in the real-world LOB apps?
*   **Proxy Latency:** How much overhead does injecting the "Sanitization Layer" add to the legacy app's response time?
*   **PII Masking Reliability:** Can the proxy identify sensitive data without complex schemas?

### Interview Insights & Decisions
- **Persistence:** Start with `localStorage` (A), then move to `Proxy-Stitched Sessions` (B) and eventually `Enterprise ID` (C).
- **Injection:** Prioritize "Zero-Touch" via Reverse Proxy as the primary delivery mechanism.
- **Guidance Model:** Lean toward the "Passive Waze" model (A) for initial rollout to lower risk and capture cleaner telemetry data.

---

## Session Update: 2026-02-08 (Module Specifications)

### Next Steps: Spec Roadmap (by dependency)

| # | Module | Depends On | Spec Path | Status |
|---|--------|-----------|-----------|--------|
| 1 | **Mapper** | — | `specs/mapper/spec.md` | In Progress |
| 2 | **Telemetry** | Mapper | `specs/telemetry/spec.md` | Pending |
| 3 | **Engine** | Mapper, Telemetry | `specs/engine/spec.md` | Pending |
| 4 | **UI** | Engine | `specs/ui/spec.md` | Pending |
| 5 | **Integration** | All above | `specs/integration/spec.md` | Pending |

### Module Summaries

**1. Mapper (`src/mapper/`)** — Foundation layer. Selector normalization, StateKey generation, DOM observation.
- Selector hierarchy: Unique ID > data-testid > aria-label > Text Content > DOM Path
- Dynamic ID detection/stripping (e.g. `ember123`)
- StateKey = URL + LastActionSelector, with page fingerprinting fallback
- MutationObserver for state transitions
- Constraints: read-only host DOM, sub-50ms, strict try-catch

**2. Telemetry** — Privacy-first event capture with provider architecture.
- Transition Packet: stateKey, normalizedSelector, actionType, dwellTime
- Data prohibitions: no input values, clipboard, innerText
- Provider interface: record(), query(), flush()
- LocalStorageProvider first, Beacon/Proxy later
- PII/PHI masking before storage

**3. Engine (`src/engine/`)** — Brain weighting and guidance logic. Pure computation, no DOM.
- Hybrid: Curated Golden Paths vs Predictive (frequency-based)
- Deterministic tie-breaking: Curated > Highest Frequency > Most Recent
- Suggestion output: target selector, label/why, confidence, source

**4. UI (`src/ui/`)** — Shadow DOM overlay, pulse, auto-scroll, contextual labels.
- Shadow DOM host lifecycle
- Pulse animation, auto-scroll, "Why" micro-labels
- Passive UX: never blocks or hijacks
- Constructable Stylesheets only, ARIA-compliant, prefers-reduced-motion

**5. Integration** — Top-level wiring, drop-in script, error boundaries.
- Single `<script>` entry point with config object
- Boot: mapper → telemetry → engine → UI
- Kill switch, error boundaries, clean teardown, no global namespace pollution
