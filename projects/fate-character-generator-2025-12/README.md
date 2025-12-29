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
