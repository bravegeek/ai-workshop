# Fate Core Character Generator Agent

This directory contains the development files for the `fate-character-generator` agent.

## Usage

1.  **Deploy**: Copy `fate-character-generator.md` to `.claude/agents/`.
    ```bash
    cp projects/fate-character-generator-2025-12/fate-character-generator.md .claude/agents/
    ```
2.  **Trigger**: In your chat, ask to create a Fate Core character.
    - "I want to create a Fate character."
    - "Help me stat a sci-fi pilot for Fate."

## Agent Capabilities
- **Genre Agnostic**: Works for Fantasy, Sci-Fi, Pulp, etc.
- **Rules Aware**: Enforces the Standard Skill Pyramid and Refresh rates.
- **Output**: Generates a clean Markdown character sheet.

## Recent Enhancements (2025-12-30)

The agent has been **fortified with official Fate Core rules and examples** extracted from:
- `bin/fate_core.txt` - Fate Core System rulebook
- `bin/fate_accelerated.txt` - Fate Accelerated Edition
- `bin/fate_toolkit.txt` - Fate System Toolkit

### What's New:

**High Concept Guidance**:
- Four specific approaches for creating High Concepts (literal job/role, job + adjective, mash two jobs, important relationship)
- Canonical examples: "Disciple of the Ivory Shroud", "Infamous Girl with Sword", "Wizard for Hire"

**Trouble Improvements**:
- Two types of Troubles explained (Personal Struggles vs Problematic Relationships)
- Real examples from Fate Core: "The Manners of a Goat", "Tempted by Shiny Things", "Rivals in the Collegia Arcana"
- Guidelines on avoiding common pitfalls (too easy to solve, too paralyzing, redundant with High Concept)
- **The "Bright Side" of Troubles**: Guidance on how Troubles can be invoked positively

**Stunt Creation**:
- Three main stunt types clearly defined with examples:
  1. Add a new action to a skill (e.g., "Backstab")
  2. Add a +2 bonus in narrow circumstances (e.g., "Arcane Expert", "Child of the Court")
  3. Create a rules exception (e.g., "Ritualist", "Hogtie")
- Better template guidance for creating balanced stunts

**Aspect Quality Standards**:
- Principles from Fate Core on making good aspects:
  - Must be both useful AND dangerous
  - Should push into conflict AND help excel in it
  - Better to leave blank than pick uninspiring aspects

**Complete Skill List**:
- All 18 default Fate Core skills listed for easy reference

## Source Materials

This agent draws directly from official Evil Hat Productions Fate Core materials. All examples of character creation, High Concepts, Troubles, Skills, and Stunts are canonical references from the core rulebooks.
