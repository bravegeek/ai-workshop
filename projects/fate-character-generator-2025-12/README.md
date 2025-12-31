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

### Phase 1: Initial Fortification
The agent was **fortified with official Fate Core rules and examples** extracted from:
- `bin/fate_core.txt` - Fate Core System rulebook
- `bin/fate_accelerated.txt` - Fate Accelerated Edition
- `bin/fate_toolkit.txt` - Fate System Toolkit

### Phase 2: Self-Contained Robustness
The agent was made **fully self-contained** by embedding all essential rules and examples directly into the agent definition. The agent no longer requires access to external files during execution.

### What's Now Embedded:

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

**Complete Skill List with Descriptions**:
- All 18 default Fate Core skills with brief descriptions of what they do
- Examples: Athletics (physical fitness), Lore (knowledge), Will (mental fortitude)

**Stress & Consequence Calculation Rules**:
- Exact formulas for Physical/Mental stress based on Physique/Will
- Clear consequence slot definitions (Mild/Moderate/Severe) with recovery times
- Explanation of how stress and consequences work mechanically

**Genre-Specific Aspect Examples**:
- Pre-written aspect examples for 6 different genres:
  - Fantasy (Wizard for Hire, Tempted by Shiny Things)
  - Cyberpunk/Sci-Fi (Corporate Netrunner, Glitching Neural Implant)
  - Noir/Detective (Hard-Boiled Private Eye, The Bottle Calls to Me)
  - Pulp Adventure (Daring Archaeologist, Never Backs Down)
  - Modern/Urban Fantasy (Vampire Social Worker, The Fae Courts Want Me Back)
  - Horror (Haunted Psychic Medium, Something Followed Me Home)

**Core Mechanics Quick Reference**:
- The Ladder (skill ratings from Terrible to Legendary)
- The Four Outcomes (Fail, Tie, Success, Success with Style)
- The Four Actions (Overcome, Create Advantage, Attack, Defend)
- Using Aspects (Invoke for +2 or reroll, Compel for fate point)

## Why This Matters

The agent is now **completely self-sufficient** - it doesn't need to access external files or search for rules during character creation. All essential Fate Core mechanics, examples, and guidelines are embedded directly in the agent definition, making it:
- **Faster**: No file lookups needed
- **More reliable**: Works even if bin/ files are missing
- **More consistent**: Same quality output every time
- **Easier to deploy**: Single file contains everything

## Source Materials

This agent draws directly from official Evil Hat Productions Fate Core materials. All examples of character creation, High Concepts, Troubles, Skills, and Stunts are canonical references from the core rulebooks, now permanently embedded in the agent.
