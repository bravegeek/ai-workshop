# Entire IO for Creative Writing

**Status:** Raw idea, not yet a project

## The Hook

[Entire IO](https://entire.io/) hooks into git to capture AI agent sessions alongside commits. Designed for code, but the mechanic applies to any git-tracked creative writing project.

The specific value: when you brainstorm options with an AI and commit one, the unchosen options disappear when the conversation closes. With Entire, that session is indexed alongside the commit — the road not taken survives.

## What This Could Enable

- **Rejected ideas as an asset** — options generated but not chosen are preserved and searchable. Useful months later when you're stuck or the project has shifted.
- **Tracking how the world evolved** — see not just what canon says now but what was being considered at each stage. Catch when a current idea contradicts something discarded earlier for a real reason.
- **Spotting your own patterns** — which directions do you keep generating but never commit? Recurring avoidances become visible.
- **"What if" branches** — run exploratory sessions in worktrees without touching the main branch; sessions are captured if you want to return.

## Broader Uses (Dev-Oriented)

- **Decision archaeology** — when a bug surfaces in AI-assisted code, pull the session from that commit to get the full reasoning trail, not just the diff.
- **Onboarding** — new devs replay sessions for complex subsystems before touching them. More honest than documentation; captures dead ends too.
- **PR review context** — reviewers see what the agent considered and rejected, not just what changed. Surfaces assumptions.
- **Prompt retrospectives** — review sessions over time to see which prompt patterns produce clean output vs. thrash. Version-control your AI collaboration style.
- **Parallel approach comparison** — use git worktrees (Entire tracks them independently) to run two sessions on the same problem with different framing, compare checkpoints, then pick one to merge.
- **Living tutorials** — record an intentional session solving a well-understood problem clearly; the session becomes process documentation.
- **Audit trail** — for regulated contexts, the `entire/checkpoints/v1` branch is a timestamped, git-native record of AI-assisted work.

## Open Questions

- How well does Entire's indexing handle creative/narrative queries vs. code-oriented ones?
- Worth installing on the weeping-somnambulist project as a test case.

## Links

- [entireio/cli on GitHub](https://github.com/entireio/cli)
- [Entire CLI overview — mager.co](https://www.mager.co/blog/2026-02-10-entire-cli/)
