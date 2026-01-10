# Party 1999

A hybrid-mechanic party game for desktop and mobile platforms.

## Project Status
**Status:** Planning / Brainstorming
**Started:** January 2026
**Timeline:** 2-4 week prototype

## Overview

Party 1999 is a multiplayer party game inspired by makeitmeme.com but with unique hybrid creative mechanics. The game combines text-based and visual input (drawing/emoji) to create engaging social gameplay experiences.

## Key Features

### Phase 1 (MVP)
- **Hybrid Creative Input:** Combine text + simple drawing/visual elements
- **Real-time Multiplayer:** 4-10 players per game room
- **Social Voting Loop:** Players vote on submissions, scoring system
- **Quick Casual Sessions:** 5-10 minute gameplay with option to extend
- **Cross-Platform:** Seamless experience on desktop and mobile

### Phase 2 (Future)
- Multiple game modes with different creative mechanics
- Extended gameplay options
- Additional social features

## Technical Requirements

### Architecture Principles
- **Simple but Scalable:** Easy to start, no rewrites needed as features expand
- **Cross-Platform First:** Mobile and desktop parity
- **Real-time Communication:** WebSocket-based multiplayer
- **Flexible State Management:** In-memory for quick sessions, designed to scale to persistence

### Target Player Experience
- Minimal setup time
- Drop-in/drop-out friendly (where possible)
- Fast, responsive input on mobile devices
- Smooth touch and mouse interaction
- 5-10 minute sessions by default

## Technical Considerations

### Input Handling
- Text input (prompts, captions, creative writing)
- Canvas/drawing functionality
- Emoji composition
- Mobile touch optimization

### Multiplayer Architecture
- Real-time game rooms (WebSockets)
- Player state synchronization
- Room management (create, join, leave)
- Turn-based or simultaneous input
- Voting/scoring mechanics

### Data Requirements
- Text storage (minimal)
- Image/drawing data handling
- Session state management
- Potential for persistence layer

## Development Approach

- **Personal Project:** Built with AI assistance
- **Rapid Prototyping:** Focus on getting playable prototype working quickly
- **Iterative Development:** Test with friends, gather feedback, refine
- **Future-Proof Architecture:** Design for extensibility from day one

## Session Notes

See `/sessions/party-1999/` for detailed brainstorming sessions and planning notes.

**Latest Session:** [2026-01-09 Brainstorming Session](../../sessions/party-1999/2026-01-09-brainstorming-session.md)

## Research Areas

When ready to proceed, prioritize research in:
1. Tech stack selection (balancing simplicity + scalability)
2. Real-time multiplayer patterns for party games
3. Hybrid input implementation (text + canvas)
4. Game state & session management
5. Cross-platform UI/UX patterns

See session notes for detailed research questions and planning options.

## Next Steps

1. Complete research phase (tech stack, architecture patterns)
2. Select technology stack
3. Set up development environment
4. Build core game room functionality
5. Implement hybrid input mechanics
6. Add voting/scoring system
7. Test with friends
8. Iterate based on feedback

---

**Note:** This is part of the ai-workshop multi-project repository. Each project is independent and self-contained.
