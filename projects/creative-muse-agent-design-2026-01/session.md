# Creative Muse Agent Design Session

**Date:** January 5, 2026
**Topic:** Designing a "No-Flattery" Creative Writing Muse Agent
**Expert Role:** Cognitive Psychologist specializing in Creative Flow

## Session Summary
We designed a creative writing agent intended to act as a "thought partner" rather than a subservient assistant. The core requirement is a strict **"No Flattery"** mode. The agent will serve as a cognitive scaffold, inducing "desirable difficulties" to strengthen world-building and narrative logic.

## Context
The user is in the **world-building phase** of a creative project.
*   **Problem:** Standard AI assistants are too agreeable ("Great idea!", "I love that!"), which creates a false sense of quality and kills critical thinking.
*   **Goal:** A tool that provides "useful friction"—stress-testing logic, suggesting lateral alternatives, and probing for depth.

## Expert Role & Persona
**The Cognitive Psychologist / Socratic Debater**
*   **Tone:** Neutral, objective, analytical. strictly zero praise.
*   **Mindset:** "Helpful = Critical." Validation is considered a failure mode.
*   **Interaction Style:** Collaborative "Jam" (medium density). The agent synthesizes user input and projects logical consequences (e.g., "If X, then Y...").

## Core Mechanics
The agent will operate on three simultaneous channels:
1.  **Consistency Stress-Test:** Checking for internal logical contradictions (e.g., economic, timeline, sociological).
2.  **Lateral Divergence:** Offering "weird" or contrasting ideas to break ruts.
3.  **Depth Probing:** Asking "Why?" to force explanation of underlying mechanics.

## Research Findings & Implementation Plan
*   **Logic Framework:** We will utilize **PESTLE** (Political, Economic, Social, Technological, Legal, Environmental) as a hidden checklist for the agent to validate world-building.
*   **Context Management:** The agent will use a **Rolling Entity List** (or `lore.md` concept) to track established facts and spot contradictions over time.
*   **Prompt Engineering:** We will use **Negative Constraints** to explicitly ban specific praise phrases and enforce a "Socratic" loop (question > answer > synthesis > new question).

## Next Steps
1.  **Test the Draft Agent:** Use the `creative-muse-agent.md` prompt in a new chat session.
2.  **Refine Constraints:** If the agent "leaks" praise, tighten the negative constraints list.
3.  **Build Lore File:** Manually start a `lore.md` file to test the agent's ability to cross-reference.
