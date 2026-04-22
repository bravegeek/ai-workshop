# Guided Brainstorm

A structured brainstorming framework for decisions, strategy, creative work, career questions, and more. Works with Claude, ChatGPT, Gemini, or any LLM chat interface.

The session moves through four phases:

1. **Situation** — establish your context
2. **Advisor** — adopt an expert role
3. **Conversation** — focused one-question-at-a-time interview
4. **Plan** — define next steps or a research agenda

## Quickstart

### Claude Code

1. Copy `SKILL.md` into your `.claude/skills/` directory.
2. Start a new Claude Code session and type `/guided-brainstorm`.
3. The facilitator will greet you and walk you through the session.
4. When you're done, say "save" — files are written to `./brainstorms/[project-name]-YYYY-MM/`.

### ChatGPT

1. Open a new conversation.
2. Click the system prompt / custom instructions field (or paste at the top of your first message prefixed with "Use these instructions:").
3. Paste the full contents of `prompt.md`.
4. Start the session by sending: "Let's begin."
5. At the end, say "save" — the facilitator will output your session documents as formatted blocks to copy and save manually.

### Gemini

1. Open a new conversation in Gemini Advanced.
2. Paste the full contents of `prompt.md` as your first message, followed by: "Acknowledge these instructions and greet me to begin the session."
3. Work through the session normally.
4. At the end, say "save" — same inline output behavior as ChatGPT.

## Which file to use

| File | Use case |
|------|----------|
| `SKILL.md` | Claude Code — agentic context, writes files automatically |
| `prompt.md` | Any LLM chat interface — paste as system prompt, outputs inline |

## Categories

The framework works across:

- Technology & engineering
- Business strategy & operations
- Product & innovation
- Personal decisions & life planning
- Creative projects
- Education & teaching
- Academic research
- Career & learning

## Credits

This tool was inspired by the CRIT framework from *The AI-Driven Leader* by Geoff Woods (2024). Guided Brainstorm uses its own terminology and is not affiliated with or endorsed by the author or publisher. See NOTICE for full attribution.

## License

MIT — see LICENSE.
