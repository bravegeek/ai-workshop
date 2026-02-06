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
