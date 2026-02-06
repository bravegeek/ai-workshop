# LOB AI Overlay GPS - Gemini Guidance

This project is a specialized "Overlay Service" designed to improve UX in legacy Line of Business (LOB) applications.

## Project Vision
A "GPS for LOB" that uses interaction telemetry to predict and guide users through "Golden Paths" via an **Auto-Scroll & Pulse** UI.

## Technical Stack & Constraints
- **Architecture:** Drop-in JavaScript Library (NPM/CDN). NOT a browser extension.
- **Language:** TypeScript (Strict mode).
- **Build Tools:** Vite (Development), esbuild/tsup (Production).
- **UI Isolation:** All overlay elements MUST be injected via **Shadow DOM** to prevent CSS/JS collisions with the host LOB application.
- **Persistence:** Initial prototype uses local storage for the frequency map; avoid heavy backends early on.

## Long-term Vision: Reverse Proxy Injection
While the current prototype is a drop-in library, the "Gold Standard" deployment for enterprise environments is injection via a **Reverse Proxy** (Application Shimming). This allows for:
- **Zero-Touch:** No app code changes or browser extensions required.
- **Server-Side Intelligence:** Proxy can intercept API payloads to enhance state detection.
- **Security:** Centralized PII/PHI masking before telemetry leaves the network.

## Core Logic Definitions
- **StateKey:** A unique identifier for a user's context, calculated as `URL + LastActionSelector`.
- **Golden Path:** The most frequent sequence of actions taken by "expert" users to complete a task.
- **Brain:** A Weighted Frequency Map (`StateKey -> Record<NextSelector, Count>`).

## Working with this Project
1. **Source Code:** Located in `src/`.
2. **Testing:** Use `test-pages/messy-app.html` as the target for the overlay.
3. **Safety:** Never modify the host page's existing DOM elements; only overlay or highlight them.

## Communication Style
<!-- BEGIN SHARED-AI-TOOLS -->
@../../.gemini/shared/no-flatter-mode.md
<!-- END SHARED-AI-TOOLS -->
