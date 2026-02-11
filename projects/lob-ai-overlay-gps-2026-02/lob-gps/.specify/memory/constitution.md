# LOB AI Overlay GPS Constitution

## Core Principles

### I. Isolation via Shadow DOM (Non-Negotiable)
All UI elements and overlay components MUST be injected using the Shadow DOM. This prevents CSS/JS collisions with legacy Line of Business (LOB) applications and ensures the overlay remains visually consistent regardless of the host's styles.

### II. Hybrid Guidance (Curated & Predictive)
The system supports two modes of intelligence: "Manual Mapping" (Curated Golden Paths defined by experts) for immediate Day 1 utility, and "Predictive Guidance" (Automated Frequency Maps) for long-term optimization. Curated paths always take precedence over predicted ones to ensure trusted guidance.

### III. The "Why" Layer (Trust)
To prevent "Clippy Syndrome," every visual pulse or auto-scroll suggestion MUST include a contextual micro-label (e.g., "Step 2: Enter Account ID"). Providing the "Why" is as important as the guidance itself; users must understand the intent behind the automation.

### IV. Non-Intrusive "Passive Waze" UX
Guidance must be "Passive by Default." The overlay should highlight and suggest actions (like a GPS showing the route) but NEVER block the user, force navigation, or hijack control without explicit interaction. The user is always the pilot; the AI is the co-pilot.

### V. Zero-Touch Deployment Architecture
The system must be designed as a drop-in JavaScript library that requires zero modifications to the host application's source code. The architecture should be compatible with future "Reverse Proxy" (Application Shimming) deployment models for enterprise-grade scalability and security.

### VI. Privacy-First Telemetry
Interaction telemetry is the lifeblood of the system, but it must be handled with extreme care. Telemetry collection should focus on selectors and state transitions, and MUST support PII/PHI masking to ensure no sensitive data leaves the local network.

### VII. Strict Type Safety and Zero Warning Policy
The codebase must adhere to strict TypeScript standards to ensure maintainability. A "Zero Warning Policy" is in effect: all linting, type-checking, and build-time warnings MUST be corrected immediately. Furthermore, the library must remain lightweight with minimal dependencies to ensure it does not degrade the performance of the host application.

### VIII. Performance and Responsiveness (Speed)
Latency is the enemy of guidance. The "Auto-Scroll & Pulse" UI must be non-blocking and execute with sub-50ms latency for state detection and UI updates. Heavy computations (like frequency map weighting) must be optimized or offloaded to avoid UI thread jitter.

### IX. Test-First Reliability (Non-Negotiable)
Every core logic component (StateKey generation, Brain weighting, Selector matching) MUST have 100% unit test coverage using **Vitest**. We use a "Test-First" approach: logic is defined by its test cases before implementation. Functional and integration tests MUST be implemented using **Playwright** to verify "Auto-Scroll & Pulse" behaviors against `messy-app.html` across different browser engines.

### X. Fail-Safe Resilience
The overlay is strictly additive. Any runtime error within the overlay must be caught and silenced to ensure the host application remains functional. A global "kill switch" (e.g., a specific key combo or API call) must be available to disable the overlay instantly without a page refresh.

### XI. Accessibility and Inclusive Guidance
The "Pulse" and "Auto-Scroll" features must respect `prefers-reduced-motion` media queries. All injected elements must be ARIA-compliant and navigable via keyboard to ensure the "GPS" doesn't create barriers for users with disabilities.

### XII. Determinism and Normalization
To prevent UI flickering, the "Brain" must use deterministic tie-breaking (e.g., "Curated Path" > "Highest Frequency" > "Most Recent"). Telemetry must be normalized (e.g., stripping GUIDs from selectors) before weighting.

### XIII. Telemetry Schema and Privacy
To ensure privacy by design and scalability toward the "Reverse Proxy" model, telemetry MUST be restricted to **State Transitions** rather than data content.
1.  **Transition Packet:** Telemetry must capture `stateKey`, `normalizedSelector`, `actionType`, and `dwellTime`.
2.  **Data Prohibitions:** Capturing the content of input fields (`value`), clipboard data, or `innerText` of non-interactive elements is **STRICTLY PROHIBITED**.
3.  **Provider Architecture:** The system must use a provider-based telemetry engine, starting with a `LocalStorageProvider` for local-only learning, with an interface designed to support future `Beacon` and `Proxy` providers.

## Technical Constraints

- **Language:** TypeScript (Strict mode).
- **Architecture:** Encapsulated library (no global namespace pollution).
- **Build Tooling:** **tsup** (via esbuild) for ESM/CJS bundles and `.d.ts` generation.
- **Development Server:** **Vite** for fast HMR and testing against `messy-app.html`.
- **Unit Testing:** **Vitest** for fast, local logic verification.
- **Functional Testing:** **Playwright** (Chromium/WebKit/Firefox) for cross-browser reliability.
- **Styling Strategy:** Styles MUST be injected via **Constructable Stylesheets** or raw `<style>` blocks within the Shadow DOM. External CSS frameworks (e.g., Tailwind) and runtime CSS-in-JS libraries are **BANNED** to maintain the <50KB bundle limit.
- **Performance:** Sub-50ms UI response time; <50KB gzipped bundle size target.
- **Persistence:** Initial prototype uses `localStorage`; avoid external dependencies for state early on.
- **UI Isolation:** Shadow DOM for all injected elements.
- **Safety:** Read-only interaction with the host DOM; strict `try-catch` boundaries.

## Development Workflow

1.  **Test-Driven Context:** Use `test-pages/messy-app.html` to verify all overlay behaviors.
2.  **Context Definition:** StateKey defaults to `URL + LastActionSelector`, but MUST support "Page Fingerprinting" (using semantic anchors like H1s or unique buttons) to handle fragile legacy routing.
3.  **Selector Hierarchy (GPS Stability):** Selector generation MUST follow a strict hierarchy of stability: `Unique ID` > `data-testid` > `aria-label` > `Text Content` (for interactive elements) > `DOM Path`. Auto-generated/dynamic IDs (e.g., `id="ember123"`) MUST be detected and ignored during normalization.
4.  **Normalization:** Ensure selectors are cleaned of dynamic IDs before being stored in the "Brain."

## Governance
This constitution supersedes general development practices within this project. Any deviation from these principles (e.g., direct DOM modification of host elements) requires explicit justification and a transition plan to compliant patterns.

**Version**: 1.1.0 | **Ratified**: 2026-02-06 | **Last Amended**: 2026-02-10