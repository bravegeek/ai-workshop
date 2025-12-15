# Feature Specification: Tier Upgrade System

**Feature Branch**: `002-tier-upgrades`  
**Created**: 2025-12-14  
**Status**: Draft  
**Input**: User description: "Implement the Tier 0 to Tier 1 upgrade system, including resource costs, upgrade UI/UX, and fixing the automation display gap"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unlock Automation (Priority: P1)

As a player, I want to spend accumulated resources to upgrade a card from Tier 0 to Tier 1 so that it begins producing resources automatically without manual clicking.

**Why this priority**: This is the core progression mechanic that transitions the game from a manual clicker to an automated idle game.

**Independent Test**: Can be tested by manually gathering resources, clicking the upgrade button, and verifying the card state changes to "Automated".

**Acceptance Scenarios**:

1. **Given** a Tier 0 card and sufficient resources, **When** the player confirms the upgrade, **Then** resources are deducted, the card becomes Tier 1, and the "Automated" status is enabled.
2. **Given** a Tier 0 card and insufficient resources, **When** the player attempts to upgrade, **Then** the action is prevented or disabled.

---

### User Story 2 - Automated Production Feedback (Priority: P1)

As a player, I want to see the resource numbers on my cards increase automatically when they are automated, so I know the system is working.

**Why this priority**: Currently, backend production works but the UI doesn't update (Gap Analysis). Without this, the upgrade appears to do nothing.

**Independent Test**: Can be tested by having an automated card and observing the UI counter for 10 seconds without clicking.

**Acceptance Scenarios**:

1. **Given** an automated Tier 1 card, **When** the game loop processes a production tick, **Then** the card's specific resource counter in the UI updates to reflect the new total.
2. **Given** multiple automated cards, **When** they produce simultaneously, **Then** the UI updates efficiently without frame drops.

---

### User Story 3 - View Upgrade Details (Priority: P2)

As a player, I want to view a detailed breakdown of the upgrade costs and benefits before committing to the purchase.

**Why this priority**: Players need clear goals (costs) and motivation (benefits) to drive their manual clicking efforts.

**Independent Test**: Can be tested by opening the upgrade modal for various cards and verifying the data matches the configuration.

**Acceptance Scenarios**:

1. **Given** a card, **When** the player requests upgrade details (e.g., clicks an upgrade icon), **Then** a modal appears showing current Tier, Next Tier stats, and a list of required resources with progress bars.
2. **Given** the upgrade modal is open, **When** the player has enough resources, **Then** the "Upgrade" button is enabled.

---

### User Story 4 - Ambient Progress Hints (Priority: P3)

As a player, I want to see visual cues (glows) on cards that are getting close to being upgradable, so I can see my progress at a glance without opening menus.

**Why this priority**: Improves game feel and provides "ambient awareness" of goals, a key design pillar.

**Independent Test**: Can be tested by granting resources incrementally and watching the card's visual state change.

**Acceptance Scenarios**:

1. **Given** a card with 0% of upgrade costs, **When** the player gathers 50% of the required resources, **Then** the card emits a faint glow.
2. **Given** a card with 99% of resources, **When** the player gathers the final amount, **Then** the card glows strongly or pulses to indicate readiness.

---

### Edge Cases

- What happens when a player clicks "Upgrade" at the exact moment resources are consumed by another process? (Should handle race condition or re-check).
- How does the system handle an upgrade cost that requires resources the player hasn't discovered yet? (Should probably show "???" or the resource name).
- What happens if the game is saved and reloaded? (Tier status and automation flag must persist).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow configuring resource costs for Tier 0 -> Tier 1 upgrades for all 8 core cards.
- **FR-002**: System MUST support multi-resource costs (e.g., Ore + Energy).
- **FR-003**: System MUST update the Global Resource State and Card State atomically when an upgrade is purchased.
- **FR-004**: Frontend `DisplayUpdateManager` MUST listen for `card:produced` events from the backend and update the DOM.
- **FR-005**: The UI MUST display an "Upgrade Available" indicator (icon/badge) when a player can afford an upgrade.
- **FR-006**: The Upgrade Modal MUST show "Current Production" vs "Next Level Production" rates.
- **FR-007**: The system MUST persist card Tier and Automation status in the save file.

### Key Entities *(include if feature involves data)*

- **CardConfiguration**: Static data defining costs for each Tier level.
- **CardState**: Runtime data tracking current `tier` (integer) and `isAutomated` (boolean).
- **ResourceBundle**: A collection of resource types and amounts (used for costs).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Player can upgrade the "Extractor" card to Tier 1 within 5 minutes of manual play (Pacing check).
- **SC-002**: UI updates resource counters at 60 FPS even with all 8 cards automated.
- **SC-003**: Upgrade Modal opens and populates data in under 100ms.
- **SC-004**: Visual "Glow" updates reflect resource progress within 1 second of resource change.
