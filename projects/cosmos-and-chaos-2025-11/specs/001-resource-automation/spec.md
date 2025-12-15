# Feature Specification: Resource Automation & Live Counters

**Feature Branch**: `001-resource-automation`
**Created**: 2025-12-10
**Status**: Draft
**Input**: User description: "Phase 2: Automation & Counters - Implement counter updates, status LEDs, I/O indicators, auto-production, and basic resource system"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Watch Resources Accumulate (Priority: P1)

As a player, I want to see resources automatically accumulating on my cards so that I understand the game is progressing without constant manual clicking.

**Why this priority**: This is the core idle game mechanic that transforms the game from a manual clicker to an automated idle experience. Without auto-production, there is no "idle" game.

**Independent Test**: Can be fully tested by placing a card on the grid, waiting a few seconds, and observing that counter values increase automatically. Delivers the fundamental idle game experience.

**Acceptance Scenarios**:

1. **Given** a Tier 1 card is placed on the grid, **When** 1 second passes, **Then** the card's production counter increases automatically
2. **Given** a card is producing resources, **When** the player views the card, **Then** the counter displays the current resource value with smooth updates
3. **Given** multiple cards are producing resources, **When** time passes, **Then** each card's counter updates independently at its designated rate

---

### User Story 2 - Monitor Card Health Status (Priority: P2)

As a player, I want to see visual indicators of card health and efficiency so that I can identify which cards need attention or are performing well.

**Why this priority**: Visual feedback helps players make strategic decisions about card placement and upgrades. Essential for understanding game state at a glance.

**Independent Test**: Can be tested by observing status LED colors change as card efficiency varies. Delivers clear visual feedback on card performance without requiring any other features.

**Acceptance Scenarios**:

1. **Given** a card has high efficiency (>80%), **When** the player views the card, **Then** the status LED shows green
2. **Given** a card has medium efficiency (40-80%), **When** the player views the card, **Then** the status LED shows yellow
3. **Given** a card has low efficiency (<40%), **When** the player views the card, **Then** the status LED shows red
4. **Given** a card's efficiency changes, **When** it crosses a threshold, **Then** the status LED color updates accordingly

---

### User Story 3 - Understand Resource Flow (Priority: P2)

As a player, I want to see which cards are producing or consuming resources so that I can understand the resource flow in my grid.

**Why this priority**: I/O indicators help players understand dependencies and optimize card placement. Important for strategic gameplay but not critical for basic idle mechanics.

**Independent Test**: Can be tested by placing cards with input/output relationships and verifying that arrows or indicators show resource flow direction. Delivers strategic insight independently.

**Acceptance Scenarios**:

1. **Given** a card produces a resource, **When** the player views the card, **Then** output indicators show the resource type being produced
2. **Given** a card consumes a resource, **When** the player views the card, **Then** input indicators show the resource type being consumed
3. **Given** two adjacent cards have matching I/O, **When** resources flow between them, **Then** indicators highlight the connection
4. **Given** a card lacks required inputs, **When** the player views the card, **Then** input indicators show the missing resource

---

### User Story 4 - Track Multiple Resource Types (Priority: P3)

As a player, I want to track different resource types (Ore, Energy, Data, etc.) across my grid so that I can manage complex production chains.

**Why this priority**: Multiple resource types enable depth and strategy but aren't needed for basic automation. Can be added after core mechanics work.

**Independent Test**: Can be tested by producing different resource types and verifying they track separately. Delivers economic depth independently of other features.

**Acceptance Scenarios**:

1. **Given** cards produce different resource types, **When** time passes, **Then** each resource type tracks separately
2. **Given** a card consumes one resource and produces another, **When** it operates, **Then** both resource counters update correctly
3. **Given** the player views global resources, **When** looking at the resource panel, **Then** all resource types and their totals are visible
4. **Given** multiple cards produce the same resource, **When** time passes, **Then** the resource totals aggregate correctly

---

### Edge Cases

- What happens when a card's production rate is faster than the counter update rate (e.g., producing 100/sec but counter updates at 2Hz)?
- How does the system handle resource overflow if storage limits exist?
- What happens when a card is moved while producing resources?
- How does the system handle counter precision (decimal places vs integers)?
- What happens when the browser tab is unfocused - do counters continue updating?
- How does the system handle very large numbers (e.g., >1 million resources)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST update card counters at configurable rates (2Hz for high-priority, 1Hz for medium, 0.5Hz for low-priority)
- **FR-002**: System MUST display status LEDs with three states: green (>80% efficiency), yellow (40-80%), red (<40%)
- **FR-003**: Cards MUST be able to automatically produce resources without player interaction once placed on the grid
- **FR-004**: System MUST display I/O indicators showing which resources a card produces and consumes
- **FR-005**: System MUST track at least 5 distinct resource types: Ore, Energy, Data, Biomass, and Nanites
- **FR-006**: System MUST calculate efficiency based on available inputs versus required inputs
- **FR-007**: System MUST persist resource values when cards are moved on the grid
- **FR-008**: Counters MUST display numeric values with appropriate formatting (e.g., 1.2K, 3.4M for large numbers)
- **FR-009**: System MUST support Tier 1 card upgrades that enable auto-production (Tier 0 = manual only, Tier 1+ = automatic)
- **FR-010**: System MUST detect adjacent cards to determine I/O connectivity for resource flow
- **FR-011**: System MUST throttle counter updates to maintain 60 FPS performance
- **FR-012**: System MUST maintain accurate resource totals even when counters update less frequently than production

### Key Entities

- **Resource**: Represents a game resource type (Ore, Energy, Data, Biomass, Nanites) with name, icon, and current amount
- **Counter**: A visual display component showing resource values on a card, with update rate and formatting rules
- **StatusLED**: A visual indicator showing card efficiency state (green/yellow/red), derived from efficiency calculation
- **IOIndicator**: A visual component showing resource inputs and outputs on a card, with direction and resource type
- **ProductionRate**: The amount of a resource produced per second by a card, affected by efficiency
- **Efficiency**: A calculated percentage (0-100%) based on available inputs versus required inputs

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can observe resource accumulation without any manual interaction within 2 seconds of placing a Tier 1 card
- **SC-002**: Counter updates remain smooth and visible at 2Hz for high-priority cards across at least 25 active cards
- **SC-003**: Status LED color changes are immediately visible (within 100ms) when efficiency crosses threshold boundaries
- **SC-004**: Players can identify resource flow patterns between adjacent cards within 5 seconds of viewing the grid
- **SC-005**: System maintains 60 FPS performance with 25+ cards actively producing resources
- **SC-006**: Resource calculations remain accurate to within 1% even with counter update throttling
- **SC-007**: Players can distinguish between at least 5 different resource types through visual indicators
- **SC-008**: Large numbers (>1000) display with appropriate abbreviations (K, M, B) within available counter space

## Assumptions *(optional)*

- Phase 1 MVP is complete (grid system, drag & drop, manual clicking all working)
- Test infrastructure is in place (Vitest configured and Phase 1 tests passing)
- Card data model includes fields for production rates, efficiency, inputs, and outputs
- Browser supports requestAnimationFrame for efficient counter updates
- Game will use a centralized state management system (GameState from Phase 1.5)
- Resource production is time-based (per second) rather than tick-based
- Initial implementation will focus on desktop (1920×1080 target resolution)
- Cards can only produce resources when placed on the grid (not in deck/hand)

## Dependencies *(optional)*

### Upstream Dependencies (Must exist before starting)
- Phase 1 MVP complete: Grid system, card placement, drag & drop
- Phase 1.5 refactor complete: Centralized GameState and SaveManager
- Test infrastructure operational: Vitest configured with passing tests
- Card data structure must include: production rates, input requirements, output types

### Downstream Dependencies (Will need this feature)
- Phase 3 (Wonder/Dread Systems): Will build on resource tracking for Resonance/Dissonance counters
- Phase 4 (Tech Tree): Will use resource costs for unlock requirements
- Phase 5 (Advanced Mechanics): Adjacency bonuses will modify production rates

## Out of Scope *(optional)*

### Explicitly NOT Included
- Adjacency bonuses (Flow/Leech) - Reserved for Phase 5
- Wonder/Dread dual counters (Resonance/Dissonance) - Reserved for Phase 3
- Tech tree unlock system - Reserved for Phase 4
- Resource costs for card placement/upgrades - Reserved for Phase 4
- Offline progress calculation - Reserved for Phase 5
- Sound effects or audio cues - Reserved for Phase 6
- Mobile-specific optimizations - Desktop-first approach
- Resource trading or conversion mechanics - Not in current roadmap
- Multiplayer resource sharing - Single-player game only

### Future Considerations
- Advanced number formatting (scientific notation for extreme values)
- Customizable counter update rates per card type
- Historical resource production graphs
- Resource prediction/forecasting
