# Session Metadata

**Date:** December 28, 2025
**Model:** Gemini 2.5 Flash
**User Request:** Create an agent to help create a character sheet for the Fate Core system.

## Reasoning
The user requested an agent for Fate Core character creation. The standard `strategic-brainstorm-researcher` was identified as a strong template due to its structured interview approach. We are adapting this template to specific Fate Core mechanics.

## Design Decisions
1.  **Framework Adaptation:** The "Context, Role, Interview" (CRI) model works well for RPGs.
    *   **Context** = Setting the Stage (Genre/World).
    *   **Role** = The AI adopts the persona of an expert Game Master.
    *   **Interview** = The step-by-step character creation process (High Concept -> Skills -> Stunts).
2.  **Phase Trio Simplification:** The standard "Phase Trio" (writing stories with other players) is difficult in a 1-on-1 AI chat. The agent is instructed to guide this narratively or offer a simplified "Additional Aspects" approach.
3.  **Skill Pyramid Enforcement:** The agent is explicitly instructed to follow the +4/+3/+2/+1 distribution to ensure legal builds.
4.  **Output Format:** The final output is defined as a Markdown character sheet to ensure usability.

## Resources
- **Fate Core SRD:** https://fate-srd.com/fate-core
- **Base Template:** `.claude/agents/strategic-brainstorm-researcher.md`
