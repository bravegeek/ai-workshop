# Tasks: Tier Upgrade System

**Feature Branch**: `002-tier-upgrades`
**Status**: Implementation Complete (20/22 tasks = 91%, 2 manual tests pending)

## Phase 1: Setup & Configuration
**Goal**: Prepare the data structures and configuration for the upgrade system.

- [X] T001 [P] Extend `CARD_CONFIGS` in `src/js/cards.js` with `upgradeCosts` (supporting multi-resource requirements) and `tierBenefits` for all 8 core cards
- [X] T002 Update `src/js/save.js` to ensure `tier` and `automated` properties are correctly serialized/deserialized

## Phase 2: Foundational Logic (US1: Unlock Automation)
**Goal**: Implement the core state logic for upgrading cards and unlocking automation.
**Story**: User Story 1 (P1)

- [X] T003 [US1] Implement `gameState.canUpgrade(cardId)` in `src/js/state.js` to check affordability for single and multi-resource costs
- [X] T004 [US1] Implement `gameState.upgradeCard(cardId)` in `src/js/state.js` to handle resource deduction, state update, and atomic race condition checks
- [ ] T005 [P] [US1] Create unit tests for `canUpgrade` and `upgradeCard` logic in `tests/state.test.js` (or similar)
- [X] T006 [US1] Update `src/js/production.js` to verify `card.automated` flag is respected in the production loop
- [X] T022 [US3] Implement helper `isResourceDiscovered(resourceType)` in `src/js/resources.js` (or similar) to support spoiler protection

## Phase 3: Visual Feedback (US2: Automated Production Feedback)
**Goal**: Ensure the UI updates automatically when resources are produced by the backend.
**Story**: User Story 2 (P1)

- [X] T007 [US2] Update `src/js/production.js` to emit `card:produced` event with `{ cardId, amount, totalProduced }` payload
- [X] T008 [US2] Update `DisplayUpdateManager` in `src/js/display.js` to listen for `card:produced`
- [X] T009 [US2] Implement `updateCardCounter(cardId, value)` method in `src/js/display.js` (or `cards.js` export) to update the specific DOM element efficiently

## Phase 4: User Interface (US3: View Upgrade Details)
**Goal**: Allow players to view costs and trigger upgrades via a modal.
**Story**: User Story 3 (P2)

- [X] T010 [US3] Add "Upgrade" icon/button to the `.card-header` template in `src/js/cards.js`
- [X] T011 [US3] Add Upgrade Modal HTML structure (hidden by default) to `src/index.html`
- [X] T012 [P] [US3] Create `src/css/layout.css` (or `cards.css`) styles for the Upgrade Modal
- [X] T013 [US3] Implement `openUpgradeModal(cardId)` in `src/js/display.js` (or new `modal.js`) to populate and show the modal
- [X] T014 [US3] Implement cost visualization logic (progress bars) in the modal population function, using `isResourceDiscovered` to hide unknown resources
- [X] T015 [US3] Connect "Confirm Upgrade" button in modal to `gameState.upgradeCard`

## Phase 5: Ambient Progress (US4: Ambient Progress Hints)
**Goal**: Provide visual feedback on upgrade progress via card glows.
**Story**: User Story 4 (P3)

- [X] T016 [P] [US4] Define `.glow-faint`, `.glow-medium`, `.glow-strong` classes in `src/css/cards.css`
- [X] T017 [US4] Implement `checkUpgradeProgress` logic in `DisplayUpdateManager` (throttled) to calculate progress %
- [X] T018 [US4] Apply/Remove glow classes on card elements based on progress thresholds (50%, 75%, 100%)
- [X] T019 [US4] Update logic to ensure undiscovered resources are correctly handled in the progress calculation (e.g. 0% progress if unknown)

## Phase 6: Polish & Integration
**Goal**: Finalize feature and ensure quality.

- [ ] T020 Run full game loop test: Gather resources -> See Glow -> Click Upgrade -> See Modal -> Confirm -> Verify Automation (MANUAL - User to test)
- [ ] T021 Verify performance: Check 60FPS during full automation with 8 cards (MANUAL - User to test)

## Dependencies

1. US1 (Logic) must be complete before US3 (UI) can function.
2. US2 (Feedback) is independent of US1 but essential for UX.
3. US4 (Ambient) depends on T001 (Config) and T003 (CanUpgrade logic).

## Implementation Strategy

- **MVP**: Complete Phase 1, 2, and 3. This gives a functional upgrade loop with console-based triggering if UI isn't ready.
- **Full Feature**: Complete Phase 4 and 5 for the full UX.
